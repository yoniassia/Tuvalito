'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import { getStockLogoFast } from '@/data/stock-logos'

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
}

// Collections data (shared with discover page)
const COLLECTIONS: Record<string, {
  name: string
  description: string
  emoji: string
  longDescription: string
  stocks: string[]
}> = {
  ai: {
    name: 'AI Revolution',
    description: 'Companies leading the AI wave',
    emoji: '🤖',
    longDescription: 'The most influential companies shaping the future of artificial intelligence, from chip makers to software platforms.',
    stocks: ['NVDA', 'MSFT', 'GOOGL', 'META', 'AMD', 'PLTR', 'CRM', 'NOW', 'SNOW', 'AI', 'PATH', 'DDOG']
  },
  dividend: {
    name: 'Dividend Kings',
    description: 'High-yield dividend stocks',
    emoji: '👑',
    longDescription: 'Blue-chip companies with long histories of consistent dividend payments and growth.',
    stocks: ['JNJ', 'KO', 'PG', 'PEP', 'MCD', 'VZ', 'T', 'XOM', 'CVX', 'PM', 'MO', 'IBM']
  },
  growth: {
    name: 'High Growth',
    description: 'Fast-growing companies',
    emoji: '🚀',
    longDescription: 'High-potential companies with strong revenue growth and innovative business models.',
    stocks: ['TSLA', 'SHOP', 'SQ', 'CRWD', 'DDOG', 'NET', 'SNOW', 'COIN', 'UBER', 'ABNB', 'RBLX', 'ROKU']
  },
  'clean-energy': {
    name: 'Clean Energy',
    description: 'Sustainable energy future',
    emoji: '🌱',
    longDescription: 'Companies leading the transition to renewable energy and sustainable solutions.',
    stocks: ['TSLA', 'ENPH', 'FSLR', 'RUN', 'PLUG', 'BE', 'NEE', 'AES', 'SEDG', 'NOVA', 'ARRY', 'MAXN']
  },
  'quantum-computing': {
    name: 'Quantum Computing',
    description: 'The next computing frontier',
    emoji: '⚛️',
    longDescription: 'Companies at the forefront of quantum computing research and development.',
    stocks: ['NVDA', 'GOOGL', 'IBM', 'MSFT', 'IONQ', 'RGTI', 'QUBT', 'QBTS', 'AMD', 'INTC', 'HON', 'RTX']
  },
  fintech: {
    name: 'Fintech Disruptors',
    description: 'Revolutionizing finance',
    emoji: '💳',
    longDescription: 'Innovative financial technology companies changing how we bank, pay, and invest.',
    stocks: ['SQ', 'PYPL', 'COIN', 'SOFI', 'AFRM', 'HOOD', 'NU', 'UPST', 'BILL', 'FOUR', 'TOST', 'MELI']
  }
}

export default function CollectionPage() {
  const params = useParams()
  const slug = params.slug as string
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [avgChange, setAvgChange] = useState(0)
  
  const collection = COLLECTIONS[slug]

  useEffect(() => {
    if (!collection) return
    fetchStocks()
  }, [collection])

  async function fetchStocks() {
    try {
      // Fetch prices for all stocks in collection
      const prices = await Promise.all(
        collection.stocks.map(async (symbol) => {
          try {
            const res = await fetch(`/api/stock/${symbol}`)
            if (res.ok) {
              const data = await res.json()
              return {
                symbol,
                name: data.name || symbol,
                price: data.price || 0,
                change: data.change || 0
              }
            }
          } catch {
            // Skip failed fetches
          }
          return null
        })
      )
      
      const validStocks = prices.filter((s): s is Stock => s !== null)
      setStocks(validStocks)
      
      // Calculate average change
      if (validStocks.length > 0) {
        const totalChange = validStocks.reduce((sum, s) => sum + s.change, 0)
        setAvgChange(totalChange / validStocks.length)
      }
    } catch (error) {
      console.error('Failed to fetch stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#0d1421] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-2">Collection not found</h1>
          <Link href="/discover" className="text-[#2ecc71] hover:underline">
            Back to Discover
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1421] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d1421]/95 backdrop-blur-sm border-b border-[#2a3a4d]">
        <div className="px-4 py-4">
          <Link href="/discover" className="flex items-center gap-2 text-[#8b9eb3] hover:text-white transition-colors mb-3">
            <ArrowLeft className="w-5 h-5" />
            <span>Discover</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl">
              {collection.emoji}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{collection.name}</h1>
              <p className="text-sm text-[#8b9eb3]">{collection.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Info */}
      <div className="p-4 space-y-4">
        {/* Stats Card */}
        <div className="bg-[#1a2332] rounded-2xl p-4 border border-[#2a3a4d]">
          <p className="text-[#8b9eb3] text-sm mb-4">{collection.longDescription}</p>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#5a6b7d] mb-1">Stocks in collection</div>
              <div className="font-semibold text-white">{collection.stocks.length}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#5a6b7d] mb-1">Avg. Change Today</div>
              {loading ? (
                <div className="h-5 w-12 bg-[#243447] rounded animate-pulse" />
              ) : (
                <div className={`font-semibold flex items-center justify-end gap-1 ${
                  avgChange >= 0 ? "text-[#2ecc71]" : "text-[#e74c3c]"
                }`}>
                  <Sparkles className="w-4 h-4" />
                  {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stocks List */}
        <div className="bg-[#1a2332] rounded-2xl overflow-hidden">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`flex items-center p-4 ${i < 5 ? "border-b border-[#2a3a4d]" : ""}`}>
                <div className="w-10 h-10 rounded-full bg-[#243447] animate-pulse mr-3" />
                <div className="flex-1">
                  <div className="h-4 w-16 bg-[#243447] rounded animate-pulse mb-2" />
                  <div className="h-3 w-24 bg-[#243447] rounded animate-pulse" />
                </div>
                <div className="text-right">
                  <div className="h-4 w-16 bg-[#243447] rounded animate-pulse mb-2" />
                  <div className="h-3 w-12 bg-[#243447] rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : stocks.length === 0 ? (
            <div className="p-8 text-center text-[#8b9eb3]">
              No stocks available
            </div>
          ) : (
            stocks.map((stock, i) => (
              <Link
                key={stock.symbol}
                href={`/stock/${stock.symbol}`}
                className={`flex items-center p-4 hover:bg-[#243447] transition-colors ${
                  i < stocks.length - 1 ? "border-b border-[#2a3a4d]" : ""
                }`}
              >
                {/* Logo */}
                <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center mr-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getStockLogoFast(stock.symbol)}
                    alt={stock.symbol}
                    width={40}
                    height={40}
                    className="object-contain w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = `<span class="text-black font-bold text-lg">${stock.symbol[0]}</span>`
                    }}
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{stock.symbol}</div>
                  <div className="text-sm text-[#8b9eb3] truncate">{stock.name}</div>
                </div>
                
                {/* Price & Change */}
                <div className="text-right">
                  <div className="font-semibold text-white">${stock.price.toFixed(2)}</div>
                  <div className={`text-sm flex items-center justify-end gap-1 ${
                    stock.change >= 0 ? "text-[#2ecc71]" : "text-[#e74c3c]"
                  }`}>
                    {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
