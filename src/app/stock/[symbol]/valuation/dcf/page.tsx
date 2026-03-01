'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calculator, 
  TrendingUp, 
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { getStockLogoFast } from '@/data/stock-logos'

interface StockData {
  symbol: string
  name: string
  price: number
}

interface AnalysisData {
  valuation_methods?: {
    dcf?: {
      current_value?: number
      current_price?: number
      premium_discount?: number
      recommendation?: string
      periods?: Record<string, { analysis?: string; recommendation?: string }>
    }
  }
  overall_rating?: string
  confidence?: string
}

interface DCFInputs {
  freeCashFlow: number
  growthRate: number
  terminalGrowthRate: number
  discountRate: number
  yearsProjected: number
  sharesOutstanding: number
}

export default function DCFPage() {
  const params = useParams()
  const symbol = (params.symbol as string).toUpperCase()
  const [stock, setStock] = useState<StockData | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAssumptions, setShowAssumptions] = useState(false)

  // Mock DCF inputs - will be replaced with real API data
  const [inputs] = useState<DCFInputs>({
    freeCashFlow: 95000000000, // $95B for AAPL example
    growthRate: 8.5,
    terminalGrowthRate: 2.5,
    discountRate: 10,
    yearsProjected: 10,
    sharesOutstanding: 15500000000
  })

  useEffect(() => {
    fetchStock()
  }, [symbol])

  async function fetchStock() {
    try {
      const [stockRes, analysisRes] = await Promise.all([
        fetch(`/api/stock/${symbol}`),
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
      
      if (analysisRes.ok) {
        const data = await analysisRes.json()
        setAnalysis(data)
      }
    } catch (error) {
      console.error('Failed to fetch stock:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate DCF
  const calculateDCF = () => {
    const { freeCashFlow, growthRate, terminalGrowthRate, discountRate, yearsProjected, sharesOutstanding } = inputs
    
    let presentValue = 0
    let projectedCashFlows: number[] = []
    
    // Project cash flows
    for (let year = 1; year <= yearsProjected; year++) {
      const fcf = freeCashFlow * Math.pow(1 + growthRate / 100, year)
      const discountedFCF = fcf / Math.pow(1 + discountRate / 100, year)
      presentValue += discountedFCF
      projectedCashFlows.push(fcf)
    }
    
    // Terminal value
    const terminalFCF = projectedCashFlows[projectedCashFlows.length - 1] * (1 + terminalGrowthRate / 100)
    const terminalValue = terminalFCF / ((discountRate - terminalGrowthRate) / 100)
    const discountedTerminalValue = terminalValue / Math.pow(1 + discountRate / 100, yearsProjected)
    
    const totalEnterpriseValue = presentValue + discountedTerminalValue
    const fairValuePerShare = totalEnterpriseValue / sharesOutstanding
    
    return {
      presentValueOfCashFlows: presentValue,
      terminalValue: discountedTerminalValue,
      enterpriseValue: totalEnterpriseValue,
      fairValuePerShare,
      projectedCashFlows
    }
  }

  const dcfResult = calculateDCF()
  const currentPrice = stock?.price || 0
  const upside = currentPrice > 0 ? ((dcfResult.fairValuePerShare - currentPrice) / currentPrice) * 100 : 0

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toFixed(2)}`
  }

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DCF Model</h1>
              <p className="text-sm text-[#8b9eb3]">{symbol} - Discounted Cash Flow</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Result Card */}
        <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 rounded-2xl p-5 border border-blue-500/20">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-[#5a6b7d] mb-1">Current Price</div>
              <div className="text-xl font-bold text-white">
                ${currentPrice.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#5a6b7d] mb-1">DCF Fair Value</div>
              <div className="text-xl font-bold text-[#2ecc71]">
                ${dcfResult.fairValuePerShare.toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className={`text-lg font-bold flex items-center gap-2 ${
              upside >= 0 ? 'text-[#2ecc71]' : 'text-[#e74c3c]'
            }`}>
              {upside >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {upside >= 0 ? '+' : ''}{upside.toFixed(1)}% Upside
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              upside > 10 ? 'bg-[#2ecc71]/20 text-[#2ecc71]' :
              upside > -10 ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-[#e74c3c]/20 text-[#e74c3c]'
            }`}>
              {upside > 10 ? 'Undervalued' : upside > -10 ? 'Fair Value' : 'Overvalued'}
            </div>
          </div>
        </div>

        {/* AI Analysis Card */}
        {analysis?.valuation_methods?.dcf && (
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/30 rounded-2xl p-5 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">🤖 AI DCF Analysis</h2>
              {analysis.overall_rating && (
                <div className="text-lg font-bold">{analysis.overall_rating}</div>
              )}
            </div>
            
            {analysis.valuation_methods.dcf.recommendation && (
              <div className="bg-[#0d1421]/50 rounded-xl p-4 mb-4">
                <p className="text-white text-sm">{analysis.valuation_methods.dcf.recommendation}</p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xs text-[#5a6b7d] mb-1">DCF Value</div>
                <div className="text-lg font-bold text-[#2ecc71]">
                  ${analysis.valuation_methods.dcf.current_value?.toFixed(0) || '-'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#5a6b7d] mb-1">Premium/Discount</div>
                <div className={`text-lg font-bold ${(analysis.valuation_methods.dcf.premium_discount || 0) >= 0 ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                  {(analysis.valuation_methods.dcf.premium_discount || 0) >= 0 ? '+' : ''}{analysis.valuation_methods.dcf.premium_discount?.toFixed(0) || 0}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#5a6b7d] mb-1">Confidence</div>
                <div className="text-lg font-bold text-purple-400">{analysis.confidence || '-'}</div>
              </div>
            </div>
            
            {analysis.valuation_methods.dcf.periods?.['5Y']?.analysis && (
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <div className="text-xs text-purple-400 mb-1">5-Year Trend</div>
                <p className="text-sm text-[#8b9eb3]">{analysis.valuation_methods.dcf.periods['5Y'].analysis}</p>
              </div>
            )}
          </div>
        )}

        {/* What is DCF */}
        <div className="bg-[#1a2332] rounded-2xl p-5 border border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white mb-3">What is DCF?</h2>
          <p className="text-[#8b9eb3] text-sm leading-relaxed mb-4">
            The <strong className="text-white">Discounted Cash Flow (DCF)</strong> model estimates the intrinsic value of a company by projecting its future free cash flows and discounting them back to present value.
          </p>
          <div className="bg-[#0d1421] rounded-xl p-4 font-mono text-sm text-center">
            <span className="text-[#2ecc71]">Intrinsic Value</span>
            <span className="text-[#5a6b7d]"> = </span>
            <span className="text-blue-400">Σ FCF / (1+r)^n</span>
            <span className="text-[#5a6b7d]"> + </span>
            <span className="text-purple-400">Terminal Value</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-[#1a2332] rounded-2xl p-5 border border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white mb-4">Valuation Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#2a3a4d]/50">
              <span className="text-[#8b9eb3]">PV of Cash Flows (10Y)</span>
              <span className="text-white font-medium">{formatLargeNumber(dcfResult.presentValueOfCashFlows)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#2a3a4d]/50">
              <span className="text-[#8b9eb3]">PV of Terminal Value</span>
              <span className="text-white font-medium">{formatLargeNumber(dcfResult.terminalValue)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#2a3a4d]/50">
              <span className="text-[#8b9eb3]">Enterprise Value</span>
              <span className="text-white font-medium">{formatLargeNumber(dcfResult.enterpriseValue)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-white font-semibold">Fair Value per Share</span>
              <span className="text-[#2ecc71] font-bold text-lg">${dcfResult.fairValuePerShare.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Assumptions */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] overflow-hidden">
          <button
            onClick={() => setShowAssumptions(!showAssumptions)}
            className="w-full flex items-center justify-between p-5 hover:bg-[#243447] transition-colors"
          >
            <h2 className="text-lg font-semibold text-white">Model Assumptions</h2>
            {showAssumptions ? (
              <ChevronUp className="w-5 h-5 text-[#5a6b7d]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#5a6b7d]" />
            )}
          </button>
          
          {showAssumptions && (
            <div className="px-5 pb-5 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[#2a3a4d]/50">
                <span className="text-[#8b9eb3]">Base Free Cash Flow</span>
                <span className="text-white">{formatLargeNumber(inputs.freeCashFlow)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#2a3a4d]/50">
                <span className="text-[#8b9eb3]">Growth Rate</span>
                <span className="text-white">{inputs.growthRate}%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#2a3a4d]/50">
                <span className="text-[#8b9eb3]">Terminal Growth Rate</span>
                <span className="text-white">{inputs.terminalGrowthRate}%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#2a3a4d]/50">
                <span className="text-[#8b9eb3]">Discount Rate (WACC)</span>
                <span className="text-white">{inputs.discountRate}%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#2a3a4d]/50">
                <span className="text-[#8b9eb3]">Projection Period</span>
                <span className="text-white">{inputs.yearsProjected} years</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#8b9eb3]">Shares Outstanding</span>
                <span className="text-white">{(inputs.sharesOutstanding / 1e9).toFixed(2)}B</span>
              </div>
            </div>
          )}
        </div>

        {/* Sensitivity Note */}
        <div className="bg-[#1a2332]/50 rounded-xl p-4 border border-[#2a3a4d]/50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#8b9eb3]">
              <p className="mb-2">
                <strong className="text-white">Note:</strong> DCF valuations are highly sensitive to growth rate and discount rate assumptions. Small changes can significantly impact the fair value estimate.
              </p>
              <p>
                This model uses industry-standard assumptions. Customize inputs with your own analysis for better accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
