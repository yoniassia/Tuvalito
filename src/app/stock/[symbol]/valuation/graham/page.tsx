'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  BookOpen,
  TrendingUp, 
  TrendingDown,
  Info,
  AlertTriangle
} from 'lucide-react'
import { getStockLogoFast } from '@/data/stock-logos'

interface StockData {
  symbol: string
  name: string
  price: number
}

interface GFData {
  grahamNumber: number
  historicalValuations: Array<{
    date: string
    price: number
    grahamNumber: number
  }>
}

interface AnalysisData {
  valuation_methods?: {
    graham?: {
      current_value?: number
      current_price?: number
      premium_discount?: number
      recommendation?: string
      reason?: string
    }
  }
  overall_rating?: string
  confidence?: string
}

type TimeRange = '1Y' | '3Y' | '5Y' | '10Y' | 'max'

export default function GrahamPage() {
  const params = useParams()
  const symbol = (params.symbol as string).toUpperCase()
  const [stock, setStock] = useState<StockData | null>(null)
  const [gfData, setGfData] = useState<GFData | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('5Y')

  const timeRanges: TimeRange[] = ['1Y', '3Y', '5Y', '10Y', 'max']

  useEffect(() => {
    fetchData()
  }, [symbol])

  async function fetchData() {
    try {
      const [stockRes, gfRes, analysisRes] = await Promise.all([
        fetch(`/api/stock/${symbol}`),
        fetch(`/api/gurufocus/${symbol}`),
        fetch(`/api/analysis/${symbol}`)
      ])
      
      if (stockRes.ok) {
        const data = await stockRes.json()
        setStock({
          symbol,
          name: data.name || symbol,
          price: data.price || 0
        })
      }
      
      if (gfRes.ok) {
        const data = await gfRes.json()
        setGfData(data)
      }
      
      if (analysisRes.ok) {
        const data = await analysisRes.json()
        setAnalysis(data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentPrice = stock?.price || 0
  // Use GuruFocus data, fallback to our analysis data
  const grahamNumber = gfData?.grahamNumber || analysis?.valuation_methods?.graham?.current_value || 0
  const margin = grahamNumber && currentPrice > 0 
    ? ((grahamNumber - currentPrice) / currentPrice) * 100 
    : 0

  // Filter data by time range
  const filteredData = useMemo(() => {
    const data = gfData?.historicalValuations || []
    const now = new Date()
    return data.filter(d => {
      if (!d.price || !d.grahamNumber || d.price <= 0 || d.grahamNumber <= 0) return false
      const date = new Date(d.date)
      const yearsAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365)
      
      switch (timeRange) {
        case '1Y': return yearsAgo <= 1
        case '3Y': return yearsAgo <= 3
        case '5Y': return yearsAgo <= 5
        case '10Y': return yearsAgo <= 10
        case 'max': return true
        default: return yearsAgo <= 5
      }
    })
  }, [gfData, timeRange])

  // Chart calculation
  const chartData = useMemo(() => {
    if (filteredData.length < 2) return null

    const width = 340
    const height = 200
    const padding = { top: 15, right: 50, bottom: 30, left: 10 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Use log scale for better visualization when price >> graham
    const prices = filteredData.map(d => d.price)
    const grahams = filteredData.map(d => d.grahamNumber)
    
    const allValues = [...prices, ...grahams]
    const maxVal = Math.max(...allValues) * 1.1
    const minVal = Math.min(...allValues) * 0.9
    
    // For log scale
    const logMin = Math.log10(Math.max(minVal, 0.01))
    const logMax = Math.log10(maxVal)

    const xScale = (i: number) => padding.left + (i / (filteredData.length - 1)) * chartWidth
    const yScale = (v: number) => {
      const logV = Math.log10(Math.max(v, 0.01))
      return padding.top + (1 - (logV - logMin) / (logMax - logMin)) * chartHeight
    }

    // Generate paths
    const pricePath = filteredData.map((d, i) => 
      `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.price)}`
    ).join(' ')

    const grahamPath = filteredData.map((d, i) => 
      `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.grahamNumber)}`
    ).join(' ')

    // Fill area between price and graham
    const fillPath = [
      ...filteredData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.price)}`),
      ...filteredData.slice().reverse().map((d, i) => `L ${xScale(filteredData.length - 1 - i)} ${yScale(d.grahamNumber)}`)
    ].join(' ') + ' Z'

    // Y-axis labels
    const yValues = [maxVal, Math.sqrt(maxVal * minVal), minVal]
    const yLabels = yValues.map(v => ({
      y: yScale(v),
      label: v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toFixed(0)}`
    }))

    // X-axis labels
    const firstYear = filteredData[0].date.slice(0, 4)
    const lastYear = filteredData[filteredData.length - 1].date.slice(0, 4)

    // Latest values
    const latest = filteredData[filteredData.length - 1]
    const latestMargin = ((latest.grahamNumber - latest.price) / latest.price) * 100

    // Calculate average premium over period
    const premiums = filteredData.map(d => ((d.price - d.grahamNumber) / d.grahamNumber) * 100)
    const avgPremium = premiums.reduce((a, b) => a + b, 0) / premiums.length

    return {
      width,
      height,
      padding,
      pricePath,
      grahamPath,
      fillPath,
      yLabels,
      firstYear,
      lastYear,
      latest,
      latestMargin,
      avgPremium,
      chartWidth,
      chartHeight
    }
  }, [filteredData])

  // Get rating based on margin
  const getRating = () => {
    if (margin > 30) return { text: 'Significantly Undervalued', color: 'text-[#00C853]', bg: 'bg-[#00C853]/20' }
    if (margin > 10) return { text: 'Modestly Undervalued', color: 'text-[#4CAF50]', bg: 'bg-[#4CAF50]/20' }
    if (margin > -10) return { text: 'Fairly Valued', color: 'text-[#FFC107]', bg: 'bg-[#FFC107]/20' }
    if (margin > -30) return { text: 'Modestly Overvalued', color: 'text-[#FF9800]', bg: 'bg-[#FF9800]/20' }
    return { text: 'Significantly Overvalued', color: 'text-[#FF5252]', bg: 'bg-[#FF5252]/20' }
  }

  const rating = getRating()

  // Check if graham is appropriate for this stock
  const isGrahamAppropriate = margin > -50 // If premium > 50%, probably not a value stock

  return (
    <div className="min-h-screen bg-[#0d1421] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d1421]/95 backdrop-blur-sm border-b border-[#2a3a4d]">
        <div className="px-4 py-4">
          <Link href={`/stock/${symbol}/valuation`} className="flex items-center gap-2 text-[#8b9eb3] hover:text-white transition-colors mb-3">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Valuation</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getStockLogoFast(symbol)}
                alt={symbol}
                width={48}
                height={48}
                className="object-contain w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = `<span class="text-black font-bold text-xl">${symbol[0]}</span>`
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Graham Number
              </h1>
              <p className="text-sm text-[#8b9eb3]">{symbol} - Benjamin Graham&apos;s Fair Value</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Main Value Card */}
        <div className="bg-gradient-to-br from-[#1E222D] to-[#2a3a4d] rounded-2xl p-5 border border-purple-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#8b9eb3]">Graham Number</span>
            <span className={`text-2xl font-bold ${margin >= 0 ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
              ${grahamNumber.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-bold text-white">{symbol}</span>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${rating.bg} ${rating.color}`}>
              {rating.text}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <div className="text-xs text-[#5a6b7d] mb-1">Current Price</div>
              <div className="text-2xl font-bold text-white">${currentPrice.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#5a6b7d] mb-1">Premium/Discount</div>
              <div className={`text-2xl font-bold flex items-center justify-end gap-2 ${
                margin >= 0 ? 'text-[#00C853]' : 'text-[#FF5252]'
              }`}>
                {margin >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {margin >= 0 ? '+' : ''}{margin.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Warning for growth stocks */}
        {!isGrahamAppropriate && (
          <div className="bg-[#FF9800]/10 rounded-xl p-4 border border-[#FF9800]/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF9800] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[#FF9800] font-semibold mb-1">Not Suitable for Growth Stocks</h3>
                <p className="text-sm text-[#8b9eb3]">
                  {symbol} trades at a {Math.abs(margin).toFixed(0)}% premium to Graham Number. 
                  This metric was designed for mature, dividend-paying value stocks, not high-growth companies.
                  Consider using <Link href={`/stock/${symbol}/valuation/gf-value`} className="text-[#00C853] underline">GF Value</Link> or <Link href={`/stock/${symbol}/valuation/peter-lynch`} className="text-[#00C853] underline">Peter Lynch</Link> instead.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Card */}
        {analysis?.valuation_methods?.graham && (
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/30 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">🤖 AI Graham Analysis</h3>
              {analysis.overall_rating && (
                <div className="text-sm font-bold">{analysis.overall_rating}</div>
              )}
            </div>
            
            {analysis.valuation_methods.graham.recommendation && (
              <p className="text-sm text-white bg-[#0d1421]/50 rounded-lg p-3 mb-3">
                {analysis.valuation_methods.graham.recommendation}
              </p>
            )}
            
            {analysis.valuation_methods.graham.reason && (
              <p className="text-xs text-[#8b9eb3]">
                {analysis.valuation_methods.graham.reason}
              </p>
            )}
          </div>
        )}

        {/* Historical Chart */}
        {chartData && (
          <div className="bg-[#1E222D] rounded-xl p-4 border border-[#2a3a4d]">
            <h3 className="text-white font-semibold mb-3">Price vs Graham Number History</h3>
            
            {/* Time Range Selector */}
            <div className="flex gap-1 mb-4">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    timeRange === range
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-[#0d1421] text-[#8b9eb3] hover:text-white hover:bg-[#243447]'
                  }`}
                >
                  {range === 'max' ? 'Max' : range}
                </button>
              ))}
            </div>

            {/* SVG Chart */}
            <svg 
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
              className="w-full h-auto"
            >
              {/* Background */}
              <rect 
                x={chartData.padding.left} 
                y={chartData.padding.top} 
                width={chartData.chartWidth}
                height={chartData.chartHeight}
                fill="#0d1421"
                rx="6"
              />

              {/* Fill area between lines (red = overvalued) */}
              <path 
                d={chartData.fillPath} 
                fill="rgba(255, 82, 82, 0.15)" 
              />

              {/* Graham Number line (purple) */}
              <path 
                d={chartData.grahamPath} 
                fill="none" 
                stroke="#a855f7" 
                strokeWidth="2"
              />

              {/* Price line (blue) */}
              <path 
                d={chartData.pricePath} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="2.5"
              />

              {/* Y-axis labels */}
              {chartData.yLabels.map((label, i) => (
                <text 
                  key={i}
                  x={chartData.width - chartData.padding.right + 5}
                  y={label.y + 4}
                  fill="#5a6b7d"
                  fontSize="9"
                >
                  {label.label}
                </text>
              ))}

              {/* X-axis labels */}
              <text 
                x={chartData.padding.left}
                y={chartData.height - 8}
                fill="#5a6b7d"
                fontSize="9"
              >
                {chartData.firstYear}
              </text>
              <text 
                x={chartData.width - chartData.padding.right}
                y={chartData.height - 8}
                fill="#5a6b7d"
                fontSize="9"
                textAnchor="end"
              >
                {chartData.lastYear}
              </text>
            </svg>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-0.5 bg-blue-500 rounded"></div>
                <span className="text-[#8b9eb3]">Price</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-0.5 bg-purple-500 rounded"></div>
                <span className="text-[#8b9eb3]">Graham Number</span>
              </div>
            </div>

            {/* Period Stats */}
            <div className="mt-4 pt-3 border-t border-[#2a3a4d] grid grid-cols-2 gap-4">
              <div className="bg-[#0d1421] rounded-lg p-3">
                <div className="text-xs text-[#5a6b7d] mb-1">Avg Premium ({timeRange})</div>
                <div className="text-lg font-bold text-[#FF5252]">
                  +{chartData.avgPremium.toFixed(0)}%
                </div>
              </div>
              <div className="bg-[#0d1421] rounded-lg p-3">
                <div className="text-xs text-[#5a6b7d] mb-1">Current Premium</div>
                <div className={`text-lg font-bold ${chartData.latestMargin >= 0 ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
                  {chartData.latestMargin >= 0 ? '' : '+'}{Math.abs(chartData.latestMargin).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* What is Graham Number */}
        <div className="bg-[#1E222D] rounded-xl p-5 border border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white mb-3">What is Graham Number?</h2>
          <p className="text-[#8b9eb3] text-sm leading-relaxed mb-4">
            The <strong className="text-white">Graham Number</strong> was developed by Benjamin Graham, the father of value investing. It calculates the maximum fair price for a stock based on:
          </p>
          
          <div className="bg-[#0d1421] rounded-lg p-4 mb-4 font-mono text-sm text-center">
            <span className="text-purple-400">Graham Number</span> = √(22.5 × EPS × Book Value)
          </div>
          
          <ul className="space-y-2 text-sm text-[#8b9eb3]">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span><strong className="text-white">22.5</strong> = 15 (PE) × 1.5 (PB) — Graham&apos;s conservative multipliers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span><strong className="text-white">EPS</strong> = Earnings Per Share (trailing 12 months)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span><strong className="text-white">Book Value</strong> = Net assets per share</span>
            </li>
          </ul>
        </div>

        {/* When to Use */}
        <div className="bg-[#1E222D] rounded-xl p-5 border border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white mb-3">When to Use Graham Number</h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-[#00C853] text-lg">✓</span>
              <div>
                <span className="text-white font-medium">Good for:</span>
                <p className="text-sm text-[#8b9eb3]">Mature, stable companies • Financial sector (banks, insurance) • Dividend aristocrats • Asset-heavy industries</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-[#FF5252] text-lg">✗</span>
              <div>
                <span className="text-white font-medium">Not suitable for:</span>
                <p className="text-sm text-[#8b9eb3]">High-growth tech stocks • Asset-light companies • Rapid scaling businesses • Companies with negative earnings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-[#1E222D]/50 rounded-xl p-4 border border-[#2a3a4d]/50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#8b9eb3]">
              <p>
                <strong className="text-white">Historical Note:</strong> Benjamin Graham developed this formula in the 1930s-1940s for a very different market. Modern growth stocks often trade at sustained premiums. Use alongside other valuation methods.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
