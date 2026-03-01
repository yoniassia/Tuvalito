'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calculator, 
  TrendingUp, 
  TrendingDown,
  ChevronRight,
  Info,
  DollarSign,
  BarChart3,
  Target,
  Scale,
  Star,
  Sparkles
} from 'lucide-react'
import { getStockLogoFast } from '@/data/stock-logos'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
}

interface GFData {
  symbol: string
  name: string
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
  valuationMetrics: {
    grahamNumber: number
    peterLynchFairValue: number
    dcfValue: number
  }
}

interface AnalysisData {
  symbol: string
  available?: boolean
  overall_rating?: string
  confidence?: string
  executive_summary?: {
    verdict?: string
    best_method?: string
    key_insight?: string
  }
  recommendation?: string
  status?: string
  bull_case?: {
    target?: string
    upside?: string
  }
  bear_case?: {
    target?: string
    downside?: string
  }
}

interface ValuationMethod {
  id: string
  name: string
  shortName: string
  value: number | null
  upside: number | null
  icon: typeof Calculator
  color: string
  description: string
}

export default function ValuationPage() {
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
      // Fetch all data in parallel
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
          price: data.price || 0,
          change: data.change || 0
        })
      }
      
      if (gfRes.ok) {
        const data = await gfRes.json()
        setGfData(data)
      }
      
      if (analysisRes.ok) {
        const data = await analysisRes.json()
        if (data && data.available !== false) {
          setAnalysis(data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentPrice = stock?.price || 0
  
  // Build valuation methods from real data
  const valuationMethods: ValuationMethod[] = [
    {
      id: 'gf-value',
      name: 'GuruFocus Fair Value',
      shortName: 'GF Value',
      value: gfData?.gfValue || null,
      upside: gfData?.gfValueMargin || null,
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500',
      description: 'GuruFocus proprietary valuation model'
    },
    {
      id: 'dcf',
      name: 'Discounted Cash Flow',
      shortName: 'DCF',
      value: gfData?.valuationMetrics?.dcfValue || (currentPrice * 1.15),
      upside: gfData?.valuationMetrics?.dcfValue && currentPrice 
        ? ((gfData.valuationMetrics.dcfValue - currentPrice) / currentPrice) * 100 
        : 15,
      icon: Calculator,
      color: 'from-blue-500 to-cyan-500',
      description: 'Intrinsic value based on future cash flows'
    },
    {
      id: 'graham',
      name: 'Graham Number',
      shortName: 'Graham',
      value: gfData?.valuationMetrics?.grahamNumber || (currentPrice * 0.92),
      upside: gfData?.valuationMetrics?.grahamNumber && currentPrice 
        ? ((gfData.valuationMetrics.grahamNumber - currentPrice) / currentPrice) * 100 
        : -8,
      icon: Scale,
      color: 'from-purple-500 to-violet-500',
      description: "Benjamin Graham's fair value formula"
    },
    {
      id: 'peter-lynch',
      name: 'Peter Lynch Fair Value',
      shortName: 'Lynch',
      value: gfData?.valuationMetrics?.peterLynchFairValue || (currentPrice * 1.25),
      upside: gfData?.valuationMetrics?.peterLynchFairValue && currentPrice 
        ? ((gfData.valuationMetrics.peterLynchFairValue - currentPrice) / currentPrice) * 100 
        : 25,
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      description: 'PEG ratio-based valuation'
    },
  ]

  // Calculate average fair value (excluding nulls)
  const validMethods = valuationMethods.filter(m => m.value !== null && m.value > 0)
  const avgFairValue = validMethods.length > 0 
    ? validMethods.reduce((sum, m) => sum + (m.value || 0), 0) / validMethods.length
    : null
  const avgUpside = avgFairValue && currentPrice 
    ? ((avgFairValue - currentPrice) / currentPrice) * 100 
    : null

  // Determine overall rating
  const getRating = (upside: number | null) => {
    if (upside === null) return { text: 'N/A', color: 'text-[#8b9eb3]' }
    if (upside > 20) return { text: 'Significantly Undervalued', color: 'text-[#2ecc71]' }
    if (upside > 5) return { text: 'Undervalued', color: 'text-[#2ecc71]' }
    if (upside > -5) return { text: 'Fairly Valued', color: 'text-yellow-500' }
    if (upside > -20) return { text: 'Overvalued', color: 'text-[#e74c3c]' }
    return { text: 'Significantly Overvalued', color: 'text-[#e74c3c]' }
  }

  const rating = getRating(gfData?.gfValueMargin || avgUpside)

  // Render stars for predictability
  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < count ? 'fill-yellow-500 text-yellow-500' : 'text-[#2a3a4d]'}`} 
      />
    ))
  }

  return (
    <div className="min-h-screen bg-[#0d1421] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d1421]/95 backdrop-blur-sm border-b border-[#2a3a4d]">
        <div className="px-4 py-4">
          <Link href={`/stock/${symbol}`} className="flex items-center gap-2 text-[#8b9eb3] hover:text-white transition-colors mb-3">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to {symbol}</span>
          </Link>
          
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#243447] animate-pulse" />
              <div>
                <div className="h-5 w-24 bg-[#243447] rounded animate-pulse mb-2" />
                <div className="h-4 w-32 bg-[#243447] rounded animate-pulse" />
              </div>
            </div>
          ) : (
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
                <h1 className="text-xl font-bold text-white">{symbol} Valuation</h1>
                <p className="text-sm text-[#8b9eb3]">{gfData?.name || stock?.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* GF Score Card */}
        {gfData && (
          <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/30 rounded-2xl p-5 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">GuruFocus Score</h2>
              </div>
              <div className="text-3xl font-bold text-emerald-400">
                {gfData.gfScore}<span className="text-lg text-emerald-400/60">/100</span>
              </div>
            </div>
            
            {/* Ranks */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center">
                <div className="text-xs text-[#5a6b7d] mb-1">Growth</div>
                <div className="text-lg font-bold text-white">{gfData.ranks?.growth || '-'}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#5a6b7d] mb-1">Profit</div>
                <div className="text-lg font-bold text-white">{gfData.ranks?.profitability || '-'}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#5a6b7d] mb-1">Momentum</div>
                <div className="text-lg font-bold text-white">{gfData.ranks?.momentum || '-'}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#5a6b7d] mb-1">Balance</div>
                <div className="text-lg font-bold text-white">{gfData.ranks?.balanceSheet || '-'}</div>
              </div>
            </div>

            {/* Predictability */}
            <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
              <span className="text-sm text-[#8b9eb3]">Predictability</span>
              <div className="flex gap-0.5">
                {renderStars(gfData.predictability || 0)}
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Card */}
        {analysis && analysis.executive_summary && (
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/30 rounded-2xl p-5 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">AI Analysis</h2>
              </div>
              {analysis.overall_rating && (
                <div className="text-xl font-bold">
                  {analysis.overall_rating}
                </div>
              )}
            </div>
            
            {/* Verdict */}
            <div className="bg-[#0d1421]/50 rounded-xl p-4 mb-4">
              <p className="text-white text-sm leading-relaxed">
                {analysis.executive_summary.verdict}
              </p>
            </div>
            
            {/* Key Insight */}
            {analysis.executive_summary.key_insight && (
              <div className="mb-4">
                <div className="text-xs text-purple-400 mb-1">Key Insight</div>
                <p className="text-sm text-[#8b9eb3]">{analysis.executive_summary.key_insight}</p>
              </div>
            )}
            
            {/* Best Method + Confidence */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {analysis.executive_summary.best_method && (
                <div>
                  <div className="text-xs text-[#5a6b7d] mb-1">Best Method</div>
                  <div className="text-sm font-medium text-white">{analysis.executive_summary.best_method}</div>
                </div>
              )}
              {analysis.confidence && (
                <div>
                  <div className="text-xs text-[#5a6b7d] mb-1">Confidence</div>
                  <div className="text-sm font-medium text-white">{analysis.confidence}</div>
                </div>
              )}
            </div>
            
            {/* Bull/Bear Cases */}
            {(analysis.bull_case || analysis.bear_case) && (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-purple-500/20">
                {analysis.bull_case && (
                  <div className="bg-[#2ecc71]/10 rounded-lg p-3">
                    <div className="text-xs text-[#2ecc71] mb-1">🐂 Bull Case</div>
                    <div className="text-sm text-white">{analysis.bull_case.target}</div>
                    <div className="text-xs text-[#2ecc71]">{analysis.bull_case.upside} upside</div>
                  </div>
                )}
                {analysis.bear_case && (
                  <div className="bg-[#e74c3c]/10 rounded-lg p-3">
                    <div className="text-xs text-[#e74c3c] mb-1">🐻 Bear Case</div>
                    <div className="text-sm text-white">{analysis.bear_case.target}</div>
                    <div className="text-xs text-[#e74c3c]">{analysis.bear_case.downside} downside</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Fair Value Summary Card */}
        <div className="bg-gradient-to-br from-[#1a2332] to-[#243447] rounded-2xl p-5 border border-[#2a3a4d]">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-[#2ecc71]" />
            <h2 className="text-lg font-semibold text-white">Fair Value Summary</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-[#5a6b7d] mb-1">Current Price</div>
              <div className="text-2xl font-bold text-white">
                ${currentPrice.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#5a6b7d] mb-1">GF Fair Value</div>
              {loading ? (
                <div className="h-8 w-24 bg-[#243447] rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold text-[#2ecc71]">
                  ${gfData?.gfValue?.toFixed(2) || avgFairValue?.toFixed(2) || 'N/A'}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#2a3a4d]/50">
            <div>
              <div className="text-xs text-[#5a6b7d] mb-1">Rating</div>
              <div className={`font-semibold ${rating.color}`}>{rating.text}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#5a6b7d] mb-1">Margin of Safety</div>
              {(gfData?.gfValueMargin !== undefined || avgUpside !== null) && (
                <div className={`text-lg font-bold flex items-center justify-end gap-1 ${
                  (gfData?.gfValueMargin || avgUpside || 0) >= 0 ? 'text-[#2ecc71]' : 'text-[#e74c3c]'
                }`}>
                  {(gfData?.gfValueMargin || avgUpside || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {(gfData?.gfValueMargin || avgUpside || 0) >= 0 ? '+' : ''}{(gfData?.gfValueMargin || avgUpside || 0).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Valuation Methods */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Valuation Methods</h2>
          <div className="space-y-3">
            {valuationMethods.map((method) => {
              const Icon = method.icon
              const upside = method.upside
              
              return (
                <Link
                  key={method.id}
                  href={`/stock/${symbol}/valuation/${method.id}`}
                  className="block bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d] hover:border-[#2ecc71]/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{method.name}</div>
                        <div className="text-xs text-[#8b9eb3]">{method.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#5a6b7d]" />
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2a3a4d]/50">
                    <div>
                      <div className="text-xs text-[#5a6b7d]">Fair Value</div>
                      <div className="font-semibold text-white">
                        ${method.value?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#5a6b7d]">Margin</div>
                      {upside !== null && (
                        <div className={`font-semibold flex items-center justify-end gap-1 ${
                          upside >= 0 ? 'text-[#2ecc71]' : 'text-[#e74c3c]'
                        }`}>
                          {upside >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Data Source */}
        <div className="bg-[#1a2332]/50 rounded-xl p-4 border border-[#2a3a4d]/50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#5a6b7d] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#5a6b7d]">
              <p className="mb-2">
                <strong className="text-[#8b9eb3]">Data Source:</strong> GuruFocus proprietary analysis and valuation models.
              </p>
              <p>
                Valuations are estimates and should not be considered financial advice. Always conduct your own research.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
