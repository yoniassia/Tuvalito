'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  Info,
  Star,
  Target
} from 'lucide-react'
import { getStockLogoFast } from '@/data/stock-logos'

interface StockData {
  symbol: string
  name: string
  price: number
}

interface GFData {
  gfScore: number
  gfValue: number
  gfValueMargin: number
  gfValue12m: number
  ranks: {
    growth: number
    profitability: number
    momentum: number
    balanceSheet: number
    gfValue: number
  }
  predictability: number
}

interface AnalysisData {
  overall_rating?: string
  confidence?: string
  executive_summary?: {
    verdict?: string
    key_insight?: string
  }
}

export default function GFValuePage() {
  const params = useParams()
  const symbol = (params.symbol as string).toUpperCase()
  const [stock, setStock] = useState<StockData | null>(null)
  const [gfData, setGfData] = useState<GFData | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)

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
  const gfValue = gfData?.gfValue || 0
  const margin = gfData?.gfValueMargin || 0
  const gfValue12m = gfData?.gfValue12m || 0

  // Render stars
  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < count ? 'fill-yellow-500 text-yellow-500' : 'text-[#2a3a4d]'}`} 
      />
    ))
  }

  // Get rating based on margin
  const getRating = () => {
    if (margin > 30) return { text: 'Significantly Undervalued', color: 'text-[#00C853]', bg: 'bg-[#00C853]/20' }
    if (margin > 10) return { text: 'Modestly Undervalued', color: 'text-[#4CAF50]', bg: 'bg-[#4CAF50]/20' }
    if (margin > -10) return { text: 'Fairly Valued', color: 'text-[#FFC107]', bg: 'bg-[#FFC107]/20' }
    if (margin > -30) return { text: 'Modestly Overvalued', color: 'text-[#FF9800]', bg: 'bg-[#FF9800]/20' }
    return { text: 'Significantly Overvalued', color: 'text-[#FF5252]', bg: 'bg-[#FF5252]/20' }
  }

  const rating = getRating()

  // Calculate 12-month upside
  const upside12m = gfValue12m && currentPrice > 0 
    ? ((gfValue12m - currentPrice) / currentPrice) * 100 
    : null

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
              <h1 className="text-xl font-bold text-white">GF Value™</h1>
              <p className="text-sm text-[#8b9eb3]">{symbol} - GuruFocus Fair Value</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Main Value Card */}
        <div className="bg-gradient-to-br from-[#1E222D] to-[#2a3a4d] rounded-2xl p-5 border border-[#00C853]/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00C853]" />
              <span className="text-sm text-[#8b9eb3]">GF Value™</span>
            </div>
            <span className={`text-2xl font-bold ${margin >= 0 ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
              ${gfValue.toFixed(2)} {margin >= 0 ? '▲' : '▼'}
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
              <div className="text-xs text-[#5a6b7d] mb-1">Margin of Safety</div>
              <div className={`text-2xl font-bold flex items-center justify-end gap-2 ${
                margin >= 0 ? 'text-[#00C853]' : 'text-[#FF5252]'
              }`}>
                {margin >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {margin >= 0 ? '+' : ''}{margin.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* 12-Month Estimate */}
        {gfValue12m > 0 && (
          <div className="bg-[#1E222D] rounded-xl p-4 border border-[#2a3a4d]">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">12-Month Estimate</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#5a6b7d] mb-1">GF Value (12M)</div>
                <div className="text-xl font-bold text-blue-400">${gfValue12m.toFixed(2)}</div>
              </div>
              {upside12m !== null && (
                <div className="text-right">
                  <div className="text-xs text-[#5a6b7d] mb-1">Potential Upside</div>
                  <div className={`text-xl font-bold ${upside12m >= 0 ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
                    {upside12m >= 0 ? '+' : ''}{upside12m.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Analysis Card */}
        {analysis?.executive_summary && (
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/30 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">🤖 AI Analysis</h3>
              {analysis.overall_rating && (
                <div className="text-sm font-bold">{analysis.overall_rating}</div>
              )}
            </div>
            
            {analysis.executive_summary.verdict && (
              <p className="text-sm text-white bg-[#0d1421]/50 rounded-lg p-3 mb-3">
                {analysis.executive_summary.verdict}
              </p>
            )}
            
            {analysis.executive_summary.key_insight && (
              <p className="text-xs text-[#8b9eb3]">
                💡 {analysis.executive_summary.key_insight}
              </p>
            )}
          </div>
        )}

        {/* GF Score Card */}
        {gfData && (
          <div className="bg-[#1E222D] rounded-xl p-5 border border-[#2a3a4d]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">GF Score</h2>
              <div className="text-3xl font-bold text-[#00C853]">
                {gfData.gfScore}<span className="text-lg text-[#00C853]/60">/100</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-[#0d1421] rounded-xl p-3 text-center">
                <div className="text-xs text-[#5a6b7d] mb-1">Growth</div>
                <div className="text-xl font-bold text-white">{gfData.ranks?.growth || '-'}</div>
                <div className="text-[10px] text-[#5a6b7d]">/10</div>
              </div>
              <div className="bg-[#0d1421] rounded-xl p-3 text-center">
                <div className="text-xs text-[#5a6b7d] mb-1">Profit</div>
                <div className="text-xl font-bold text-white">{gfData.ranks?.profitability || '-'}</div>
                <div className="text-[10px] text-[#5a6b7d]">/10</div>
              </div>
              <div className="bg-[#0d1421] rounded-xl p-3 text-center">
                <div className="text-xs text-[#5a6b7d] mb-1">Momentum</div>
                <div className="text-xl font-bold text-white">{gfData.ranks?.momentum || '-'}</div>
                <div className="text-[10px] text-[#5a6b7d]">/10</div>
              </div>
              <div className="bg-[#0d1421] rounded-xl p-3 text-center">
                <div className="text-xs text-[#5a6b7d] mb-1">Balance</div>
                <div className="text-xl font-bold text-white">{gfData.ranks?.balanceSheet || '-'}</div>
                <div className="text-[10px] text-[#5a6b7d]">/10</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#2a3a4d]">
              <span className="text-sm text-[#8b9eb3]">Predictability</span>
              <div className="flex gap-1">
                {renderStars(gfData.predictability || 0)}
              </div>
            </div>
          </div>
        )}

        {/* What is GF Value */}
        <div className="bg-[#1E222D] rounded-xl p-5 border border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white mb-3">What is GF Value™?</h2>
          <p className="text-[#8b9eb3] text-sm leading-relaxed mb-4">
            <strong className="text-white">GF Value</strong> is GuruFocus&apos;s proprietary fair value estimate. It&apos;s calculated based on:
          </p>
          <ul className="space-y-2 text-sm text-[#8b9eb3]">
            <li className="flex items-start gap-2">
              <span className="text-[#00C853]">•</span>
              <span><strong className="text-white">Historical trading multiples</strong> (PE, PS, PB) - how the market has historically valued the stock</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00C853]">•</span>
              <span><strong className="text-white">GuruFocus adjustment factor</strong> - based on past returns and growth trajectory</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00C853]">•</span>
              <span><strong className="text-white">Future earnings estimates</strong> - analyst consensus and growth projections</span>
            </li>
          </ul>
          <p className="text-xs text-[#5a6b7d] mt-4 italic">
            Note: This is a proprietary methodology. GuruFocus does not disclose the exact formula.
          </p>
        </div>

        {/* How to Interpret */}
        <div className="bg-[#1E222D] rounded-xl p-5 border border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white mb-3">How to Interpret</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 py-2 border-b border-[#2a3a4d]/50">
              <div className="w-3 h-3 rounded-full bg-[#00C853]" />
              <span className="text-[#8b9eb3]"><strong className="text-[#00C853]">+30% or more:</strong> Significantly Undervalued</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-[#2a3a4d]/50">
              <div className="w-3 h-3 rounded-full bg-[#4CAF50]" />
              <span className="text-[#8b9eb3]"><strong className="text-[#4CAF50]">+10% to +30%:</strong> Modestly Undervalued</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-[#2a3a4d]/50">
              <div className="w-3 h-3 rounded-full bg-[#FFC107]" />
              <span className="text-[#8b9eb3]"><strong className="text-[#FFC107]">-10% to +10%:</strong> Fairly Valued</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-[#2a3a4d]/50">
              <div className="w-3 h-3 rounded-full bg-[#FF9800]" />
              <span className="text-[#8b9eb3]"><strong className="text-[#FF9800]">-10% to -30%:</strong> Modestly Overvalued</span>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5252]" />
              <span className="text-[#8b9eb3]"><strong className="text-[#FF5252]">-30% or less:</strong> Significantly Overvalued</span>
            </div>
          </div>
        </div>

        {/* Current Assessment */}
        <div className={`rounded-xl p-5 border ${
          margin > 10 ? 'bg-[#00C853]/10 border-[#00C853]/30' :
          margin > -10 ? 'bg-[#FFC107]/10 border-[#FFC107]/30' :
          'bg-[#FF5252]/10 border-[#FF5252]/30'
        }`}>
          <h2 className="text-lg font-semibold text-white mb-3">Current Assessment</h2>
          <p className="text-[#8b9eb3] text-sm leading-relaxed">
            {symbol} is currently trading at <strong className="text-white">${currentPrice.toFixed(2)}</strong>, 
            {margin > 0 
              ? <span> which is <strong className="text-[#00C853]">{margin.toFixed(1)}% below</strong> its GF Value of ${gfValue.toFixed(2)}. This suggests the stock may be <strong className="text-[#00C853]">undervalued</strong> and could offer upside potential.</span>
              : <span> which is <strong className="text-[#FF5252]">{Math.abs(margin).toFixed(1)}% above</strong> its GF Value of ${gfValue.toFixed(2)}. This suggests the stock may be <strong className="text-[#FF5252]">overvalued</strong> at current levels.</span>
            }
          </p>
          {margin > 10 && (
            <p className="text-xs text-[#5a6b7d] mt-3">
              Note: High-growth companies may trade above fair value for extended periods due to future earnings expectations. Always combine with other analysis methods.
            </p>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-[#1E222D]/50 rounded-xl p-4 border border-[#2a3a4d]/50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#00C853] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#8b9eb3]">
              <p>
                <strong className="text-white">Data Source:</strong> GuruFocus. GF Value™ is a proprietary valuation model and should be used alongside other analysis methods. This is not financial advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
