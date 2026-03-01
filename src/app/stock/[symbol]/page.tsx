'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Star, StarOff, ExternalLink, Calculator, ChevronRight } from 'lucide-react'
import { getStockLogoFast } from '@/data/stock-logos'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  previousClose: number
  open: number
  dayHigh: number
  dayLow: number
  volume: number
  avgVolume: number
  marketCap: number
  pe: number
  eps: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  beta: number
}

// Stock names mapping
const STOCK_NAMES: Record<string, string> = {
  'AAPL': 'Apple Inc',
  'NVDA': 'NVIDIA Corporation',
  'TSLA': 'Tesla Inc',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc',
  'META': 'Meta Platforms',
  'AMZN': 'Amazon.com Inc',
  'AMD': 'Advanced Micro Devices',
  'NFLX': 'Netflix Inc',
  'COIN': 'Coinbase Global',
  'DDOG': 'Datadog Inc',
  'CRWD': 'CrowdStrike Holdings',
  'ZM': 'Zoom Video Communications',
}

// Time range options for chart
const TIME_RANGES = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
]

export default function StockPage() {
  const params = useParams()
  const symbol = (params.symbol as string)?.toUpperCase() || ''
  
  const [stock, setStock] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedRange, setSelectedRange] = useState('1mo')
  const [inWatchlist, setInWatchlist] = useState(false)

  useEffect(() => {
    if (symbol) {
      fetchStockData()
      checkWatchlist()
    }
  }, [symbol])

  function checkWatchlist() {
    const saved = localStorage.getItem('watchlist')
    const symbols = saved ? JSON.parse(saved) as string[] : []
    setInWatchlist(symbols.includes(symbol))
  }

  function toggleWatchlist() {
    const saved = localStorage.getItem('watchlist')
    const symbols = saved ? JSON.parse(saved) as string[] : []
    
    if (inWatchlist) {
      const updated = symbols.filter(s => s !== symbol)
      localStorage.setItem('watchlist', JSON.stringify(updated))
      setInWatchlist(false)
    } else {
      const updated = [...symbols, symbol]
      localStorage.setItem('watchlist', JSON.stringify(updated))
      setInWatchlist(true)
    }
  }

  async function fetchStockData() {
    setRefreshing(true)
    
    try {
      const res = await fetch(`/api/stock/${symbol}`)
      
      if (res.ok) {
        const data = await res.json()
        setStock(data)
      }
    } catch (error) {
      console.error('Failed to fetch stock data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function formatNumber(num: number): string {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toLocaleString()}`
  }

  function formatVolume(num: number): string {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toLocaleString()
  }

  const isPositive = (stock?.change || 0) >= 0

  return (
    <div className="min-h-screen bg-[#0d1421] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d1421]/95 backdrop-blur-sm border-b border-[#2a3a4d]">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-[#8b9eb3] hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleWatchlist}
                className={`p-2 rounded-lg transition-colors ${inWatchlist ? 'text-[#f1c40f]' : 'text-[#8b9eb3] hover:text-white'}`}
              >
                {inWatchlist ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
              </button>
              <button 
                onClick={fetchStockData}
                disabled={refreshing}
                className="p-2 text-[#8b9eb3] hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        // Loading skeleton
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1a2332] animate-pulse" />
            <div>
              <div className="h-6 w-20 bg-[#1a2332] rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-[#1a2332] rounded animate-pulse" />
            </div>
          </div>
          <div className="h-64 bg-[#1a2332] rounded-xl animate-pulse" />
        </div>
      ) : stock ? (
        <div className="p-4 space-y-6">
          {/* Stock Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getStockLogoFast(symbol)}
                alt={symbol}
                width={64}
                height={64}
                className="object-contain w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = `<span class="text-black font-bold text-2xl">${symbol[0]}</span>`
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{symbol}</h1>
              <p className="text-[#8b9eb3]">{STOCK_NAMES[symbol] || symbol}</p>
            </div>
          </div>

          {/* Price Section */}
          <div className="bg-[#1a2332] rounded-xl p-6 border border-[#2a3a4d]">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-bold text-white">${stock.price.toFixed(2)}</span>
              <div className={`flex items-center gap-1 text-lg ${isPositive ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span>{isPositive ? '+' : ''}{stock.change.toFixed(2)}%</span>
              </div>
            </div>
            <p className="text-sm text-[#5a6b7d]">
              {isPositive ? '+' : ''}{((stock.price * stock.change) / (100 + stock.change)).toFixed(2)} today
            </p>
          </div>

          {/* Chart Section */}
          <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d] overflow-hidden">
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 p-4 border-b border-[#2a3a4d]">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedRange(range.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedRange === range.value
                      ? 'bg-[#2ecc71] text-black'
                      : 'bg-[#0d1421] text-[#8b9eb3] hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            {/* TradingView Chart */}
            <div className="h-[300px] relative">
              <iframe
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${symbol}&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=0d1421&studies=%5B%5D&theme=dark&style=1&timezone=exchange&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${symbol}`}
                className="w-full h-full border-0"
                allowTransparency
              />
            </div>
          </div>

          {/* Valuation Card - Link to Valuation page */}
          <Link href={`/stock/${symbol}/valuation`}>
            <div className="bg-gradient-to-r from-[#1a2332] to-[#243447] rounded-xl p-5 border border-[#2ecc71]/30 hover:border-[#2ecc71]/60 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2ecc71]/20 flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-[#2ecc71]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#2ecc71] transition-colors">
                      Valuation Analysis
                    </h3>
                    <p className="text-sm text-[#8b9eb3]">
                      Graham Number • Peter Lynch • DCF • GF Value
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-[#5a6b7d] group-hover:text-[#2ecc71] group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>

          {/* Signal Columns (Empty) */}
          <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d]">
            <h3 className="text-sm font-semibold text-white mb-4">Signals</h3>
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-[#0d1421] rounded-xl p-4 text-center">
                  <div className="text-xs text-[#5a6b7d] mb-2">Signal {i}</div>
                  <div className="w-8 h-8 rounded-full bg-[#243447] mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Fundamentals */}
          <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d]">
            <h3 className="text-sm font-semibold text-white mb-4">Fundamentals</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between py-2 border-b border-[#2a3a4d]">
                <span className="text-[#8b9eb3]">Open</span>
                <span className="text-white font-medium">${stock.open?.toFixed(2) || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2a3a4d]">
                <span className="text-[#8b9eb3]">Prev Close</span>
                <span className="text-white font-medium">${stock.previousClose?.toFixed(2) || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2a3a4d]">
                <span className="text-[#8b9eb3]">Day High</span>
                <span className="text-white font-medium">${stock.dayHigh?.toFixed(2) || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2a3a4d]">
                <span className="text-[#8b9eb3]">Day Low</span>
                <span className="text-white font-medium">${stock.dayLow?.toFixed(2) || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2a3a4d]">
                <span className="text-[#8b9eb3]">52W High</span>
                <span className="text-white font-medium">${stock.fiftyTwoWeekHigh?.toFixed(2) || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2a3a4d]">
                <span className="text-[#8b9eb3]">52W Low</span>
                <span className="text-white font-medium">${stock.fiftyTwoWeekLow?.toFixed(2) || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2a3a4d]">
                <span className="text-[#8b9eb3]">Volume</span>
                <span className="text-white font-medium">{formatVolume(stock.volume || 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2a3a4d]">
                <span className="text-[#8b9eb3]">Avg Volume</span>
                <span className="text-white font-medium">{formatVolume(stock.avgVolume || 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2a3a4d]">
                <span className="text-[#8b9eb3]">Market Cap</span>
                <span className="text-white font-medium">{formatNumber(stock.marketCap || 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2a3a4d]">
                <span className="text-[#8b9eb3]">P/E Ratio</span>
                <span className="text-white font-medium">{stock.pe?.toFixed(2) || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2a3a4d]">
                <span className="text-[#8b9eb3]">EPS</span>
                <span className="text-white font-medium">${stock.eps?.toFixed(2) || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#2a3a4d]">
                <span className="text-[#8b9eb3]">Beta</span>
                <span className="text-white font-medium">{stock.beta?.toFixed(2) || '—'}</span>
              </div>
            </div>
          </div>

          {/* News Section */}
          <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d]">
            <h3 className="text-sm font-semibold text-white mb-4">Latest News</h3>
            <div className="space-y-4">
              <a 
                href={`https://www.google.com/search?q=${symbol}+stock+news&tbm=nws`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#2ecc71] hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View latest news on Google</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        // Error state
        <div className="p-4 text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-white mb-2">Stock not found</h3>
          <p className="text-[#8b9eb3]">Could not find data for {symbol}</p>
        </div>
      )}
    </div>
  )
}
