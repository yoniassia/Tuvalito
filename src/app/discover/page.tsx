'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Flame, BarChart3, Zap, Building2, Heart, Cpu, Car, ShoppingBag } from 'lucide-react'
import { getStockLogoFast } from '@/data/stock-logos'

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
}

// Categories with their stocks
const CATEGORIES = [
  { 
    id: 'tech', 
    name: 'Technology', 
    icon: Cpu, 
    color: 'from-blue-500 to-cyan-500',
    stocks: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD']
  },
  { 
    id: 'finance', 
    name: 'Finance', 
    icon: Building2, 
    color: 'from-green-500 to-emerald-500',
    stocks: ['JPM', 'BAC', 'GS', 'V', 'MA', 'COIN']
  },
  { 
    id: 'healthcare', 
    name: 'Healthcare', 
    icon: Heart, 
    color: 'from-red-500 to-pink-500',
    stocks: ['JNJ', 'UNH', 'PFE', 'ABBV', 'MRK', 'LLY']
  },
  { 
    id: 'auto', 
    name: 'Automotive', 
    icon: Car, 
    color: 'from-orange-500 to-amber-500',
    stocks: ['TSLA', 'F', 'GM', 'RIVN', 'TM', 'NIO']
  },
  { 
    id: 'retail', 
    name: 'Retail', 
    icon: ShoppingBag, 
    color: 'from-purple-500 to-violet-500',
    stocks: ['AMZN', 'WMT', 'COST', 'TGT', 'HD', 'LOW']
  },
]

// Featured collections
const COLLECTIONS = [
  { 
    id: 'ai', 
    name: 'AI Revolution', 
    description: 'Companies leading the AI wave',
    stocks: ['NVDA', 'MSFT', 'GOOGL', 'META', 'AMD', 'PLTR'],
    emoji: '🤖'
  },
  { 
    id: 'dividend', 
    name: 'Dividend Kings', 
    description: 'High-yield dividend stocks',
    stocks: ['JNJ', 'KO', 'PG', 'PEP', 'MCD', 'VZ'],
    emoji: '👑'
  },
  { 
    id: 'growth', 
    name: 'High Growth', 
    description: 'Fast-growing companies',
    stocks: ['TSLA', 'SHOP', 'SQ', 'CRWD', 'DDOG', 'NET'],
    emoji: '🚀'
  },
]

export default function DiscoverPage() {
  const [trending, setTrending] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrending()
  }, [])

  async function fetchTrending() {
    try {
      // Get top movers as trending
      const res = await fetch('/api/movers')
      if (res.ok) {
        const data = await res.json()
        setTrending(data.movers || [])
      }
    } catch (error) {
      console.error('Failed to fetch trending:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1421] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d1421]/95 backdrop-blur-sm border-b border-[#2a3a4d]">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <Link href="/" className="flex items-center gap-2 text-[#8b9eb3] hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Home</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold text-white">Discover</h1>
          <p className="text-sm text-[#8b9eb3]">Explore stocks, categories, and collections</p>
        </div>
      </div>

      <div className="p-4 space-y-8">
        {/* Trending Now */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-white">Trending Now</h2>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32 bg-[#1a2332] rounded-xl p-4">
                  <div className="w-10 h-10 rounded-full bg-[#243447] animate-pulse mb-3" />
                  <div className="h-4 w-16 bg-[#243447] rounded animate-pulse mb-2" />
                  <div className="h-3 w-12 bg-[#243447] rounded animate-pulse" />
                </div>
              ))
            ) : (
              trending.slice(0, 6).map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/stock/${stock.symbol}`}
                  className="flex-shrink-0 w-32 bg-[#1a2332] rounded-xl p-4 hover:bg-[#243447] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center mb-3">
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
                        target.parentElement!.innerHTML = `<span class="text-black font-bold">${stock.symbol[0]}</span>`
                      }}
                    />
                  </div>
                  <div className="font-semibold text-white text-sm">{stock.symbol}</div>
                  <div className={`text-xs flex items-center gap-1 ${stock.change >= 0 ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                    {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#2ecc71]" />
            <h2 className="text-lg font-bold text-white">Categories</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d] hover:border-[#2ecc71]/30 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-semibold text-white mb-2">{cat.name}</div>
                  <div className="flex -space-x-2">
                    {cat.stocks.slice(0, 4).map((symbol) => (
                      <Link
                        key={symbol}
                        href={`/stock/${symbol}`}
                        className="w-6 h-6 rounded-full bg-white overflow-hidden flex items-center justify-center border-2 border-[#1a2332] hover:scale-110 transition-transform"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getStockLogoFast(symbol)}
                          alt={symbol}
                          width={24}
                          height={24}
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = `<span class="text-black font-bold text-[10px]">${symbol[0]}</span>`
                          }}
                        />
                      </Link>
                    ))}
                    <div className="w-6 h-6 rounded-full bg-[#243447] flex items-center justify-center border-2 border-[#1a2332] text-[10px] text-[#8b9eb3]">
                      +{cat.stocks.length - 4}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Collections */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-white">Collections</h2>
          </div>
          
          <div className="space-y-3">
            {COLLECTIONS.map((collection) => (
              <Link
                key={collection.id}
                href={`/collection/${collection.id}`}
                className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d] hover:border-[#2ecc71]/30 transition-colors cursor-pointer block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{collection.emoji}</span>
                      <span className="font-semibold text-white">{collection.name}</span>
                    </div>
                    <p className="text-sm text-[#8b9eb3]">{collection.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {collection.stocks.slice(0, 5).map((symbol) => (
                      <Link
                        key={symbol}
                        href={`/stock/${symbol}`}
                        className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center border-2 border-[#1a2332] hover:scale-110 transition-transform"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getStockLogoFast(symbol)}
                          alt={symbol}
                          width={32}
                          height={32}
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = `<span class="text-black font-bold text-xs">${symbol[0]}</span>`
                          }}
                        />
                      </Link>
                    ))}
                  </div>
                  <span className="text-xs text-[#8b9eb3]">{collection.stocks.length} stocks</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/watchlist"
              className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d] hover:border-[#2ecc71]/30 transition-colors flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2ecc71]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#2ecc71]" />
              </div>
              <div>
                <div className="font-semibold text-white">Watchlist</div>
                <div className="text-xs text-[#8b9eb3]">Track your favorites</div>
              </div>
            </Link>
            <Link 
              href="/alpha"
              className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d] hover:border-[#2ecc71]/30 transition-colors flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2ecc71]/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#2ecc71]" />
              </div>
              <div>
                <div className="font-semibold text-white">Alpha</div>
                <div className="text-xs text-[#8b9eb3]">Portfolio signals</div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
