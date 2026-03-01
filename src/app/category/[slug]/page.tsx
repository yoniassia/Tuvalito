'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Cpu, Building2, Heart, Car, ShoppingBag } from 'lucide-react'
import { getStockLogoFast } from '@/data/stock-logos'

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
}

// Categories data (shared with discover page)
const CATEGORIES: Record<string, {
  name: string
  icon: typeof Cpu
  color: string
  description: string
  stocks: string[]
}> = {
  tech: {
    name: 'Technology',
    icon: Cpu,
    color: 'from-blue-500 to-cyan-500',
    description: 'Software, hardware, and tech giants',
    stocks: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD', 'INTC', 'ORCL', 'CRM', 'ADBE', 'CSCO', 'IBM']
  },
  finance: {
    name: 'Finance',
    icon: Building2,
    color: 'from-green-500 to-emerald-500',
    description: 'Banks, payments, and financial services',
    stocks: ['JPM', 'BAC', 'GS', 'V', 'MA', 'COIN', 'WFC', 'MS', 'AXP', 'BLK', 'SCHW', 'C']
  },
  healthcare: {
    name: 'Healthcare',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    description: 'Pharmaceuticals, biotech, and healthcare',
    stocks: ['JNJ', 'UNH', 'PFE', 'ABBV', 'MRK', 'LLY', 'TMO', 'ABT', 'DHR', 'BMY', 'AMGN', 'GILD']
  },
  auto: {
    name: 'Automotive',
    icon: Car,
    color: 'from-orange-500 to-amber-500',
    description: 'Electric vehicles and traditional automakers',
    stocks: ['TSLA', 'F', 'GM', 'RIVN', 'TM', 'NIO', 'LCID', 'LI', 'XPEV', 'STLA', 'HMC', 'RACE']
  },
  retail: {
    name: 'Retail',
    icon: ShoppingBag,
    color: 'from-purple-500 to-violet-500',
    description: 'E-commerce and brick-and-mortar retail',
    stocks: ['AMZN', 'WMT', 'COST', 'TGT', 'HD', 'LOW', 'EBAY', 'ETSY', 'DG', 'DLTR', 'BBY', 'KR']
  },
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  
  const category = CATEGORIES[slug]

  useEffect(() => {
    if (!category) return
    fetchStocks()
  }, [category])

  async function fetchStocks() {
    try {
      // Fetch prices for all stocks in category
      const prices = await Promise.all(
        category.stocks.map(async (symbol) => {
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
      
      setStocks(prices.filter((s): s is Stock => s !== null))
    } catch (error) {
      console.error('Failed to fetch stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#0d1421] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-2">Category not found</h1>
          <Link href="/discover" className="text-[#2ecc71] hover:underline">
            Back to Discover
          </Link>
        </div>
      </div>
    )
  }

  const Icon = category.icon

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
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{category.name}</h1>
              <p className="text-sm text-[#8b9eb3]">{category.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stocks List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[#8b9eb3]">{category.stocks.length} stocks</span>
          <span className="text-xs text-[#5a6b7d]">Sorted by market cap</span>
        </div>

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
