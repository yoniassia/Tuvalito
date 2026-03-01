'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Info
} from 'lucide-react'

interface StockData {
  symbol: string
  name: string
  price: number
}

export default function EPSGrowthPage() {
  const params = useParams()
  const symbol = (params.symbol as string).toUpperCase()
  const [stock, setStock] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock financial data
  const [financials] = useState({
    currentEPS: 6.42,
    epsGrowthRate: 12.5, // %
    projectionYears: 5,
    terminalPE: 18, // Expected P/E at end of projection
    discountRate: 10, // Required rate of return
  })

  useEffect(() => {
    fetchStock()
  }, [symbol])

  async function fetchStock() {
    try {
      const res = await fetch(`/api/stock/${symbol}`)
      if (res.ok) {
        const data = await res.json()
        setStock({
          symbol,
          name: data.name || symbol,
          price: data.price || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch stock:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate projected EPS for each year
  const projectedEPS: number[] = []
  for (let i = 1; i <= financials.projectionYears; i++) {
    projectedEPS.push(financials.currentEPS * Math.pow(1 + financials.epsGrowthRate / 100, i))
  }

  // Future stock price = Terminal P/E × Future EPS
  const futureEPS = projectedEPS[projectedEPS.length - 1]
  const futurePrice = financials.terminalPE * futureEPS

  // Discount back to present value
  const fairValue = futurePrice / Math.pow(1 + financials.discountRate / 100, financials.projectionYears)

  const currentPrice = stock?.price || 0
  const upside = currentPrice > 0 ? ((fairValue - currentPrice) / currentPrice) * 100 : 0

  // CAGR if you buy now and sell at future price
  const expectedCAGR = currentPrice > 0 
    ? (Math.pow(futurePrice / currentPrice, 1 / financials.projectionYears) - 1) * 100 
    : 0

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">EPS Growth Model</h1>
              <p className="text-sm text-[#8b9eb3]">{symbol} - Earnings Projection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Result Card */}
        <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/20 rounded-2xl p-5 border border-orange-500/20">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-[#5a6b7d] mb-1">Current Price</div>
              <div className="text-xl font-bold text-white">
                ${currentPrice.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#5a6b7d] mb-1">Fair Value (PV)</div>
              <div className="text-xl font-bold text-[#2ecc71]">
                ${fairValue.toFixed(2)}
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
            <div className="text-right">
              <div className="text-xs text-[#5a6b7d]">Expected CAGR</div>
              <div className={`font-bold ${expectedCAGR > financials.discountRate ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                {expectedCAGR.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Model Explanation */}
        <div className="bg-[#1a2332] rounded-2xl p-5 border border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white mb-3">How It Works</h2>
          <p className="text-[#8b9eb3] text-sm leading-relaxed mb-4">
            The EPS Growth Model projects future stock price based on expected earnings growth, then discounts it back to determine fair value today.
          </p>
          <div className="bg-[#0d1421] rounded-xl p-4 font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#5a6b7d]">1. Project EPS:</span>
              <span className="text-orange-400">EPS × (1 + g)^n</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5a6b7d]">2. Future Price:</span>
              <span className="text-orange-400">P/E × Future EPS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5a6b7d]">3. Present Value:</span>
              <span className="text-orange-400">Future Price ÷ (1 + r)^n</span>
            </div>
          </div>
        </div>

        {/* EPS Projection Table */}
        <div className="bg-[#1a2332] rounded-2xl p-5 border border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white mb-4">EPS Projection</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-3 min-w-max pb-2">
              <div className="bg-[#0d1421] rounded-xl p-3 text-center min-w-[80px]">
                <div className="text-xs text-[#5a6b7d] mb-1">Now</div>
                <div className="font-bold text-white">${financials.currentEPS.toFixed(2)}</div>
              </div>
              {projectedEPS.map((eps, i) => (
                <div key={i} className="bg-[#0d1421] rounded-xl p-3 text-center min-w-[80px]">
                  <div className="text-xs text-[#5a6b7d] mb-1">Y{i + 1}</div>
                  <div className="font-bold text-[#2ecc71]">${eps.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-[#5a6b7d]">
            <TrendingUp className="w-3 h-3 text-[#2ecc71]" />
            <span>{financials.epsGrowthRate}% annual growth</span>
          </div>
        </div>

        {/* Valuation Math */}
        <div className="bg-[#1a2332] rounded-2xl p-5 border border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white mb-4">Valuation Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#2a3a4d]/50">
              <div>
                <span className="text-white">Projected EPS (Y{financials.projectionYears})</span>
                <p className="text-xs text-[#5a6b7d]">${financials.currentEPS} × (1 + {financials.epsGrowthRate}%)^{financials.projectionYears}</p>
              </div>
              <span className="text-[#2ecc71] font-medium">${futureEPS.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#2a3a4d]/50">
              <div>
                <span className="text-white">Terminal P/E Multiple</span>
                <p className="text-xs text-[#5a6b7d]">Expected P/E in {financials.projectionYears} years</p>
              </div>
              <span className="text-white font-medium">{financials.terminalPE}x</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#2a3a4d]/50">
              <div>
                <span className="text-white">Future Stock Price</span>
                <p className="text-xs text-[#5a6b7d]">{financials.terminalPE} × ${futureEPS.toFixed(2)}</p>
              </div>
              <span className="text-orange-400 font-medium">${futurePrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#2a3a4d]/50">
              <div>
                <span className="text-white">Discount Rate</span>
                <p className="text-xs text-[#5a6b7d]">Required rate of return</p>
              </div>
              <span className="text-white font-medium">{financials.discountRate}%</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-white font-semibold">Fair Value (Present Value)</span>
                <p className="text-xs text-[#5a6b7d]">${futurePrice.toFixed(2)} ÷ (1 + {financials.discountRate}%)^{financials.projectionYears}</p>
              </div>
              <span className="text-[#2ecc71] font-bold text-lg">${fairValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Model Assumptions */}
        <div className="bg-[#1a2332] rounded-2xl p-5 border border-[#2a3a4d]">
          <h2 className="text-lg font-semibold text-white mb-4">Model Assumptions</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0d1421] rounded-xl p-3">
              <div className="text-xs text-[#5a6b7d] mb-1">Growth Rate</div>
              <div className="font-semibold text-white">{financials.epsGrowthRate}%</div>
            </div>
            <div className="bg-[#0d1421] rounded-xl p-3">
              <div className="text-xs text-[#5a6b7d] mb-1">Terminal P/E</div>
              <div className="font-semibold text-white">{financials.terminalPE}x</div>
            </div>
            <div className="bg-[#0d1421] rounded-xl p-3">
              <div className="text-xs text-[#5a6b7d] mb-1">Discount Rate</div>
              <div className="font-semibold text-white">{financials.discountRate}%</div>
            </div>
            <div className="bg-[#0d1421] rounded-xl p-3">
              <div className="text-xs text-[#5a6b7d] mb-1">Time Horizon</div>
              <div className="font-semibold text-white">{financials.projectionYears} years</div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-[#1a2332]/50 rounded-xl p-4 border border-[#2a3a4d]/50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#8b9eb3]">
              <p className="mb-2">
                <strong className="text-white">Key Assumptions:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>EPS grows at a constant rate for {financials.projectionYears} years</li>
                <li>P/E multiple stays at {financials.terminalPE}x at exit</li>
                <li>No major business disruptions or changes</li>
              </ul>
              <p className="mt-2">
                Adjust assumptions based on your own analysis for more accurate results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
