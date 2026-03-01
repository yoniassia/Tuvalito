'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  Lightbulb, 
  Calculator,
  Sparkles,
  AlertTriangle,
  Target,
  Building2,
  Flame
} from 'lucide-react'

// Analysis data from Albert's research - 63+ stocks analyzed
const ANALYSIS_DATA = {
  opportunities: [
    { symbol: 'F', method: 'Graham + DCF', fairValue: 31, price: 13, upside: 134, status: '🔥🔥 Very Undervalued' },
    { symbol: 'CMCSA', method: 'Lynch + DCF', fairValue: 51, price: 28, upside: 82, status: '🔥🔥 Very Undervalued' },
    { symbol: 'NVO', method: 'Peter Lynch', fairValue: 90, price: 51, upside: 77, status: '🔥 Undervalued' },
    { symbol: 'PYPL', method: 'DCF', fairValue: 100, price: 58, upside: 72, status: '🔥 Undervalued' },
    { symbol: 'T', method: 'DCF', fairValue: 41, price: 25, upside: 65, status: '🔥 Undervalued' },
    { symbol: 'GM', method: 'Graham', fairValue: 122, price: 81, upside: 50, status: '🔥 Below Graham' },
    { symbol: 'BABA', method: 'DCF', fairValue: 194, price: 132, upside: 47, status: '🔥 Undervalued' },
    { symbol: 'BMY', method: 'DCF', fairValue: 69, price: 54, upside: 28, status: '🔥 Undervalued' },
    { symbol: 'DIS', method: 'Peter Lynch', fairValue: 141, price: 114, upside: 24, status: '🔥 Undervalued' },
    { symbol: 'CVX', method: 'DCF', fairValue: 185, price: 152, upside: 22, status: '🔥 Below DCF' },
    { symbol: 'XOM', method: 'Lynch + DCF', fairValue: 142, price: 120, upside: 18, status: '🔥 Undervalued' },
    { symbol: 'C', method: 'Graham', fairValue: 123, price: 117, upside: 5, status: '🔥 Below Graham' },
  ],
  nearFair: [
    { symbol: 'VZ', method: 'DCF', premium: 2, status: '✅ At Fair Value' },
    { symbol: 'TGT', method: 'DCF', premium: 6, status: '✅ Near Fair' },
    { symbol: 'BAC', method: 'Graham', premium: 10, status: '✅ Near Fair' },
    { symbol: 'ADBE', method: 'Lynch + DCF', premium: 10, status: '✅ Near Fair' },
    { symbol: 'AXP', method: 'DCF', premium: 12, status: '✅ Near Fair' },
    { symbol: 'META', method: 'Peter Lynch', premium: 19, status: '✅ Near Fair' },
    { symbol: 'QCOM', method: 'DCF', premium: 23, status: '✅ Near Fair' },
    { symbol: 'CRM', method: 'Peter Lynch', premium: 25, status: '✅ Near Fair' },
    { symbol: 'AMZN', method: 'Peter Lynch', premium: 35, status: '✅ Near Fair' },
  ],
  premium: [
    { symbol: 'NVDA', method: 'Peter Lynch', premium: 38, status: '⚠️ Premium' },
    { symbol: 'GOOGL', method: 'Peter Lynch', premium: 42, status: '⚠️ Premium' },
    { symbol: 'MSFT', method: 'Peter Lynch', premium: 52, status: '⚠️ Premium' },
    { symbol: 'AAPL', method: 'DCF', premium: 63, status: '⚠️ Premium' },
    { symbol: 'NFLX', method: 'Peter Lynch', premium: 64, status: '⚠️ Premium' },
    { symbol: 'LLY', method: 'Peter Lynch', premium: 77, status: '⚠️ Expensive' },
  ],
  warnings: [
    { symbol: 'DE', issue: 'Lynch crashed $640→$289 (55% drop!)', status: '⚠️⚠️ Big Drop' },
    { symbol: 'SBUX', issue: 'Lynch crashed $45→$23', status: '⚠️ Lynch Crash' },
    { symbol: 'AMD', issue: 'Lynch declining while price rising', status: '⚠️ Divergence' },
    { symbol: 'NKE', issue: 'Lynch = 0, growth collapsed', status: '⚠️ INTC Pattern' },
    { symbol: 'INTC', issue: 'Value Trap - looks cheap but declining', status: '⚠️ Trap' },
    { symbol: 'CSCO', issue: 'Lynch = 0, no growth', status: '⚠️ Lynch=0' },
    { symbol: 'TXN', issue: 'Lynch = 0, growth collapsed', status: '⚠️ Lynch=0' },
    { symbol: 'BA', issue: 'DCF negative - troubled company', status: '❌ Avoid' },
  ],
  speculation: [
    { symbol: 'TSLA', premium: 94, reason: 'No method works - Elon Premium', status: '🎰 Speculation' },
  ],
  banks: [
    { symbol: 'JPM', method: 'Graham', opportunity2024: 'Below Graham+DCF', returnSince: '+89%' },
    { symbol: 'GS', method: 'Graham', opportunity2024: 'At Graham (3%)', returnSince: '+53%' },
    { symbol: 'WFC', method: 'Graham', opportunity2024: 'Below DCF', returnSince: '+33%' },
  ],
  methodSummary: {
    graham: {
      name: 'Graham Number',
      icon: 'BookOpen',
      color: 'purple',
      bestFor: 'Banks, Financial Services, Mature Value Stocks',
      notFor: 'Tech, Growth Stocks',
      topPicks: ['JPM', 'GS', 'WFC'],
      insight: 'Graham works best for companies with tangible assets. Banks showed perfect correlation in 2024.'
    },
    peterLynch: {
      name: 'Peter Lynch',
      icon: 'Lightbulb',
      color: 'orange',
      bestFor: 'Tech Growth, Consumer, GARP Stocks',
      notFor: 'Banks, Unprofitable Companies',
      topPicks: ['META', 'CRM', 'AMZN', 'DIS'],
      opportunities: ['DIS (19% below!)'],
      insight: 'Peter Lynch is the best method for tech stocks. When Lynch = 0, it\'s a warning sign!'
    },
    dcf: {
      name: 'DCF (Intrinsic Value)',
      icon: 'Calculator',
      color: 'green',
      bestFor: 'Cash Flow Positive Companies, Mature Tech',
      notFor: 'High-Growth, Negative FCF',
      topPicks: ['PYPL', 'AAPL'],
      opportunities: ['PYPL (72% below!)'],
      insight: 'DCF showed PYPL significantly undervalued. FCF growth is key differentiator from value traps.'
    },
    gfValue: {
      name: 'GF Value',
      icon: 'Sparkles',
      color: 'emerald',
      bestFor: 'All stocks with trading history',
      notFor: 'IPOs, Turnarounds',
      topPicks: ['NVDA', 'AAPL'],
      insight: 'Adaptive method that learns from historical premiums. Best for stocks that don\'t fit other models.'
    }
  }
}

type Tab = 'overview' | 'graham' | 'lynch' | 'dcf' | 'gfValue'

export default function AlphaPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Target className="w-4 h-4" /> },
    { id: 'graham', label: 'Graham', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'lynch', label: 'Lynch', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'dcf', label: 'DCF', icon: <Calculator className="w-4 h-4" /> },
    { id: 'gfValue', label: 'GF Value', icon: <Sparkles className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-[#0d1421] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d1421]/95 backdrop-blur-sm border-b border-[#2a3a4d]">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-1">Alpha Insights</h1>
          <p className="text-sm text-[#8b9eb3]">Valuation Analysis Summary - 18 Stocks Analyzed</p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#2ecc71] text-white'
                  : 'bg-[#1a2332] text-[#8b9eb3] hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Opportunities */}
            <div className="bg-gradient-to-r from-[#00C853]/20 to-[#1a2332] rounded-xl p-4 border border-[#00C853]/30">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-[#00C853]" />
                <h2 className="text-lg font-semibold text-white">🔥 Current Opportunities</h2>
              </div>
              <div className="space-y-3">
                {ANALYSIS_DATA.opportunities.map((stock) => (
                  <Link href={`/stock/${stock.symbol}/valuation`} key={stock.symbol}>
                    <div className="bg-[#0d1421] rounded-lg p-4 hover:bg-[#1a2332] transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-white">{stock.symbol}</span>
                          <span className="text-sm text-[#8b9eb3] ml-2">via {stock.method}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#00C853]">+{stock.upside}%</div>
                          <div className="text-xs text-[#5a6b7d]">Upside</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-[#8b9eb3]">Fair Value: <span className="text-white">${stock.fairValue}</span></span>
                        <span className="text-[#8b9eb3]">Price: <span className="text-white">${stock.price}</span></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Near Fair Value */}
            <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d]">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#4CAF50]" />
                ✅ Near Fair Value (20-35% premium)
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {ANALYSIS_DATA.nearFair.map((stock) => (
                  <Link href={`/stock/${stock.symbol}/valuation`} key={stock.symbol}>
                    <div className="bg-[#0d1421] rounded-lg p-3 text-center hover:bg-[#243447] transition-colors">
                      <div className="text-lg font-bold text-white">{stock.symbol}</div>
                      <div className="text-sm text-[#4CAF50]">{stock.premium}%</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Warning Signs */}
            <div className="bg-[#FF9800]/10 rounded-xl p-4 border border-[#FF9800]/30">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#FF9800]" />
                ⚠️ Warning Signs
              </h2>
              <div className="space-y-2">
                {ANALYSIS_DATA.warnings.map((stock) => (
                  <Link href={`/stock/${stock.symbol}/valuation`} key={stock.symbol}>
                    <div className="bg-[#0d1421] rounded-lg p-3 hover:bg-[#1a2332] transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{stock.symbol}</span>
                        <span className="text-xs text-[#FF9800]">{stock.status}</span>
                      </div>
                      <p className="text-sm text-[#8b9eb3] mt-1">{stock.issue}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Banks */}
            <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d]">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                🏦 Banks - Graham Works!
              </h2>
              <div className="space-y-2">
                {ANALYSIS_DATA.banks.map((stock) => (
                  <Link href={`/stock/${stock.symbol}/valuation/graham`} key={stock.symbol}>
                    <div className="bg-[#0d1421] rounded-lg p-3 flex items-center justify-between hover:bg-[#243447] transition-colors">
                      <div>
                        <span className="font-bold text-white">{stock.symbol}</span>
                        <span className="text-xs text-[#8b9eb3] ml-2">2024: {stock.opportunity2024}</span>
                      </div>
                      <span className="text-[#00C853] font-bold">{stock.returnSince}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d]">
              <h2 className="text-lg font-semibold text-white mb-4">📚 Key Insights</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <p className="text-[#8b9eb3]"><strong className="text-white">Peter Lynch</strong> is best for tech stocks. META, CRM, AMZN all tracked well.</p>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <p className="text-[#8b9eb3]"><strong className="text-white">Graham Number</strong> is best for banks. JPM, GS, WFC showed perfect signals.</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#FF9800] flex-shrink-0" />
                  <p className="text-[#8b9eb3]"><strong className="text-white">Lynch = 0</strong> is a warning sign! NKE and INTC both had Lynch go to 0 before problems.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Calculator className="w-5 h-5 text-[#00C853] flex-shrink-0" />
                  <p className="text-[#8b9eb3]"><strong className="text-white">DCF + Growing FCF</strong> differentiates opportunity (PYPL) from trap (INTC).</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'graham' && (
          <>
            <div className="bg-gradient-to-br from-purple-500/20 to-[#1a2332] rounded-xl p-5 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-8 h-8 text-purple-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Graham Number</h2>
                  <p className="text-sm text-[#8b9eb3]">Benjamin Graham&apos;s Value Formula</p>
                </div>
              </div>
              
              <div className="bg-[#0d1421] rounded-lg p-4 mb-4 font-mono text-sm text-center">
                Graham = √(22.5 × EPS × Book Value)
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#0d1421] rounded-lg p-3">
                  <div className="text-xs text-[#5a6b7d] mb-1">Best For</div>
                  <div className="text-sm text-white">Banks, Financials, Mature Value</div>
                </div>
                <div className="bg-[#0d1421] rounded-lg p-3">
                  <div className="text-xs text-[#5a6b7d] mb-1">Not For</div>
                  <div className="text-sm text-[#FF5252]">Tech, Growth, Asset-light</div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d]">
              <h3 className="font-semibold text-white mb-3">🏦 Top Graham Picks (Banks)</h3>
              {ANALYSIS_DATA.banks.map((stock) => (
                <Link href={`/stock/${stock.symbol}/valuation/graham`} key={stock.symbol}>
                  <div className="bg-[#0d1421] rounded-lg p-3 mb-2 flex items-center justify-between hover:bg-[#243447] transition-colors">
                    <div>
                      <span className="font-bold text-white">{stock.symbol}</span>
                      <p className="text-xs text-[#8b9eb3]">2024: {stock.opportunity2024}</p>
                    </div>
                    <span className="text-[#00C853] font-bold">{stock.returnSince}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="bg-[#00C853]/10 rounded-xl p-4 border border-[#00C853]/30">
              <h3 className="font-semibold text-white mb-2">💡 Graham Insight</h3>
              <p className="text-sm text-[#8b9eb3]">
                Graham Number showed perfect buying signals for banks in 2024. JPM, GS, and WFC were all at or below Graham Number - and returned 33-89% since then.
              </p>
            </div>
          </>
        )}

        {activeTab === 'lynch' && (
          <>
            <div className="bg-gradient-to-br from-orange-500/20 to-[#1a2332] rounded-xl p-5 border border-orange-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-8 h-8 text-orange-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Peter Lynch Fair Value</h2>
                  <p className="text-sm text-[#8b9eb3]">GARP - Growth at Reasonable Price</p>
                </div>
              </div>
              
              <div className="bg-[#0d1421] rounded-lg p-4 mb-4 font-mono text-sm text-center">
                Fair Value = EPS × (8.5 + 2 × Growth Rate)
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#0d1421] rounded-lg p-3">
                  <div className="text-xs text-[#5a6b7d] mb-1">Best For</div>
                  <div className="text-sm text-white">Tech, Growth, Consumer</div>
                </div>
                <div className="bg-[#0d1421] rounded-lg p-3">
                  <div className="text-xs text-[#5a6b7d] mb-1">Not For</div>
                  <div className="text-sm text-[#FF5252]">Banks, No Growth</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#00C853]/20 to-[#1a2332] rounded-xl p-4 border border-[#00C853]/30">
              <h3 className="font-semibold text-white mb-3">🔥 Lynch Opportunity NOW</h3>
              <Link href="/stock/DIS/valuation/peter-lynch">
                <div className="bg-[#0d1421] rounded-lg p-4 hover:bg-[#1a2332] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-white">DIS</span>
                      <span className="text-sm text-[#8b9eb3] ml-2">Walt Disney</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#00C853]">+24%</div>
                      <div className="text-xs text-[#5a6b7d]">Below Fair Value!</div>
                    </div>
                  </div>
                  <div className="text-sm text-[#8b9eb3] mt-2">
                    Lynch FV: $141 vs Price: $114
                  </div>
                </div>
              </Link>
            </div>

            <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d]">
              <h3 className="font-semibold text-white mb-3">✅ Near Fair (Lynch)</h3>
              <div className="space-y-2">
                {['META', 'CRM', 'AMZN'].map((symbol) => {
                  const stock = ANALYSIS_DATA.nearFair.find(s => s.symbol === symbol)
                  return (
                    <Link href={`/stock/${symbol}/valuation/peter-lynch`} key={symbol}>
                      <div className="bg-[#0d1421] rounded-lg p-3 flex items-center justify-between hover:bg-[#243447] transition-colors">
                        <span className="font-bold text-white">{symbol}</span>
                        <span className="text-[#4CAF50]">{stock?.premium}% premium</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="bg-[#FF9800]/10 rounded-xl p-4 border border-[#FF9800]/30">
              <h3 className="font-semibold text-white mb-2">⚠️ Lynch Warning: When = 0</h3>
              <p className="text-sm text-[#8b9eb3] mb-3">
                When Peter Lynch Fair Value goes to 0, it means growth collapsed. This happened to:
              </p>
              <div className="space-y-2">
                <div className="bg-[#0d1421] rounded-lg p-2 flex items-center justify-between">
                  <span className="text-white">NKE</span>
                  <span className="text-[#FF9800] text-sm">Lynch = 0, -36% since</span>
                </div>
                <div className="bg-[#0d1421] rounded-lg p-2 flex items-center justify-between">
                  <span className="text-white">INTC</span>
                  <span className="text-[#FF5252] text-sm">Lynch = 0, Value Trap</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'dcf' && (
          <>
            <div className="bg-gradient-to-br from-[#00C853]/20 to-[#1a2332] rounded-xl p-5 border border-[#00C853]/30">
              <div className="flex items-center gap-3 mb-4">
                <Calculator className="w-8 h-8 text-[#00C853]" />
                <div>
                  <h2 className="text-xl font-bold text-white">DCF - Intrinsic Value</h2>
                  <p className="text-sm text-[#8b9eb3]">Discounted Cash Flow Analysis</p>
                </div>
              </div>
              
              <div className="bg-[#0d1421] rounded-lg p-4 mb-4 text-sm text-center text-[#8b9eb3]">
                Present Value of Future Free Cash Flows
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#0d1421] rounded-lg p-3">
                  <div className="text-xs text-[#5a6b7d] mb-1">Best For</div>
                  <div className="text-sm text-white">FCF Positive, Mature</div>
                </div>
                <div className="bg-[#0d1421] rounded-lg p-3">
                  <div className="text-xs text-[#5a6b7d] mb-1">Not For</div>
                  <div className="text-sm text-[#FF5252]">Negative FCF, Hypergrowth</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#00C853]/20 to-[#1a2332] rounded-xl p-4 border border-[#00C853]/30">
              <h3 className="font-semibold text-white mb-3">🔥 DCF Opportunity NOW</h3>
              <Link href="/stock/PYPL/valuation/dcf">
                <div className="bg-[#0d1421] rounded-lg p-4 hover:bg-[#1a2332] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-white">PYPL</span>
                      <span className="text-sm text-[#8b9eb3] ml-2">PayPal</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#00C853]">+72%</div>
                      <div className="text-xs text-[#5a6b7d]">Below Fair Value!</div>
                    </div>
                  </div>
                  <div className="text-sm text-[#8b9eb3] mt-2">
                    DCF: $100 vs Price: $58 - FCF still growing!
                  </div>
                </div>
              </Link>
            </div>

            <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d]">
              <h3 className="font-semibold text-white mb-2">💡 DCF Key Insight</h3>
              <p className="text-sm text-[#8b9eb3]">
                <strong className="text-white">PYPL vs INTC:</strong> Both looked &quot;cheap&quot; but PYPL&apos;s FCF is growing while INTC&apos;s was declining. 
                DCF + Growing FCF = Opportunity. DCF + Declining FCF = Trap.
              </p>
            </div>
          </>
        )}

        {activeTab === 'gfValue' && (
          <>
            <div className="bg-gradient-to-br from-emerald-500/20 to-[#1a2332] rounded-xl p-5 border border-emerald-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-emerald-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">GF Value™</h2>
                  <p className="text-sm text-[#8b9eb3]">GuruFocus Proprietary Model</p>
                </div>
              </div>
              
              <div className="bg-[#0d1421] rounded-lg p-4 mb-4 text-sm text-center text-[#8b9eb3]">
                Historical Multiples × Adjustment × Future Estimates
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#0d1421] rounded-lg p-3">
                  <div className="text-xs text-[#5a6b7d] mb-1">Best For</div>
                  <div className="text-sm text-white">All stocks with history</div>
                </div>
                <div className="bg-[#0d1421] rounded-lg p-3">
                  <div className="text-xs text-[#5a6b7d] mb-1">Not For</div>
                  <div className="text-sm text-[#FF5252]">IPOs, Turnarounds</div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d]">
              <h3 className="font-semibold text-white mb-3">📊 GF Value Top Picks</h3>
              <div className="space-y-2">
                {['NVDA', 'AAPL', 'META'].map((symbol) => (
                  <Link href={`/stock/${symbol}/valuation/gf-value`} key={symbol}>
                    <div className="bg-[#0d1421] rounded-lg p-3 flex items-center justify-between hover:bg-[#243447] transition-colors">
                      <span className="font-bold text-white">{symbol}</span>
                      <span className="text-emerald-400">View GF Value →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
              <h3 className="font-semibold text-white mb-2">💡 GF Value Insight</h3>
              <p className="text-sm text-[#8b9eb3]">
                GF Value is adaptive - it learns what premium the market historically pays for a stock. 
                Best for stocks that don&apos;t fit traditional value models (like high-growth tech).
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
