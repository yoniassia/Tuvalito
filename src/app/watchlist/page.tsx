'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Search, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { getStockLogoFast } from '@/data/stock-logos'

interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
  addedAt: number
}

// Default watchlist for new users
const DEFAULT_WATCHLIST = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL']

// Popular stocks for quick add
const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla Inc' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'AMZN', name: 'Amazon.com Inc' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'NFLX', name: 'Netflix Inc' },
  { symbol: 'COIN', name: 'Coinbase Global' },
]

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('watchlist')
    if (saved) {
      const symbols = JSON.parse(saved) as string[]
      fetchPrices(symbols)
    } else {
      // First time user - use default watchlist
      localStorage.setItem('watchlist', JSON.stringify(DEFAULT_WATCHLIST))
      fetchPrices(DEFAULT_WATCHLIST)
    }
  }, [])

  async function fetchPrices(symbols: string[]) {
    if (symbols.length === 0) {
      setWatchlist([])
      setLoading(false)
      return
    }

    setRefreshing(true)
    
    try {
      const res = await fetch(`/api/prices?symbols=${symbols.join(',')}`)
      
      if (res.ok) {
        const data = await res.json()
        const prices = data.prices || {}
        
        const items: WatchlistItem[] = symbols.map(symbol => ({
          symbol,
          name: POPULAR_STOCKS.find(s => s.symbol === symbol)?.name || symbol,
          price: prices[symbol]?.price || 0,
          change: prices[symbol]?.change || 0,
          addedAt: Date.now(),
        }))
        
        setWatchlist(items)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function addToWatchlist(symbol: string) {
    const saved = localStorage.getItem('watchlist')
    const symbols = saved ? JSON.parse(saved) as string[] : []
    
    if (!symbols.includes(symbol)) {
      const updated = [...symbols, symbol]
      localStorage.setItem('watchlist', JSON.stringify(updated))
      fetchPrices(updated)
    }
    
    setShowAddModal(false)
    setSearchQuery('')
  }

  function removeFromWatchlist(symbol: string) {
    const saved = localStorage.getItem('watchlist')
    const symbols = saved ? JSON.parse(saved) as string[] : []
    const updated = symbols.filter(s => s !== symbol)
    localStorage.setItem('watchlist', JSON.stringify(updated))
    setWatchlist(prev => prev.filter(item => item.symbol !== symbol))
  }

  function refresh() {
    const saved = localStorage.getItem('watchlist')
    const symbols = saved ? JSON.parse(saved) as string[] : []
    fetchPrices(symbols)
  }

  const filteredPopular = POPULAR_STOCKS.filter(stock => 
    !watchlist.some(w => w.symbol === stock.symbol) &&
    (stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
     stock.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-[#0d1421]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d1421]/95 backdrop-blur-sm border-b border-[#2a3a4d]">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2 text-[#8b9eb3] hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <button 
                onClick={refresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2332] rounded-lg text-sm text-[#8b9eb3] hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#2ecc71] rounded-lg text-sm text-black font-medium hover:bg-[#27ae60] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
          
          <h1 className="text-xl font-bold text-white">Watchlist</h1>
          {lastUpdated && (
            <p className="text-xs text-[#5a6b7d] mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Watchlist */}
      <div className="p-4">
        {loading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-[#1a2332] rounded-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#243447] animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-16 bg-[#243447] rounded animate-pulse mb-2" />
                  <div className="h-3 w-24 bg-[#243447] rounded animate-pulse" />
                </div>
                <div className="h-5 w-20 bg-[#243447] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-white mb-2">Your watchlist is empty</h3>
            <p className="text-[#8b9eb3] mb-6">Add stocks to track their prices</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[#2ecc71] rounded-xl text-black font-semibold hover:bg-[#27ae60] transition-colors"
            >
              Add Your First Stock
            </button>
          </div>
        ) : (
          // Watchlist items
          <div className="space-y-3">
            {watchlist.map((item) => (
              <Link 
                key={item.symbol}
                href={`/stock/${item.symbol}`}
                className="bg-[#1a2332] rounded-xl p-4 flex items-center gap-3 group"
              >
                {/* Logo */}
                <div className="w-12 h-12 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getStockLogoFast(item.symbol)}
                    alt={item.symbol}
                    width={48}
                    height={48}
                    className="object-contain w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = `<span class="text-black font-bold text-xl">${item.symbol[0]}</span>`
                    }}
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{item.symbol}</div>
                  <div className="text-sm text-[#8b9eb3] truncate">{item.name}</div>
                </div>
                
                {/* Price */}
                <div className="text-right">
                  <div className="font-semibold text-white">${item.price.toFixed(2)}</div>
                  <div className={`text-sm flex items-center justify-end gap-1 ${item.change >= 0 ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                    {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                  </div>
                </div>
                
                {/* Remove button */}
                <button 
                  onClick={(e) => { e.preventDefault(); removeFromWatchlist(item.symbol); }}
                  className="p-2 text-[#5a6b7d] hover:text-[#e74c3c] opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-[#1a2332] w-full max-w-lg rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add to Watchlist</h2>
              <button 
                onClick={() => { setShowAddModal(false); setSearchQuery(''); }}
                className="p-2 text-[#8b9eb3] hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a6b7d]" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1421] border border-[#2a3a4d] rounded-xl py-3 pl-10 pr-4 text-white placeholder-[#5a6b7d] focus:outline-none focus:border-[#2ecc71]"
                autoFocus
              />
            </div>
            
            {/* Popular stocks */}
            <div>
              <h3 className="text-sm font-medium text-[#8b9eb3] mb-3">Popular Stocks</h3>
              <div className="space-y-2">
                {filteredPopular.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => addToWatchlist(stock.symbol)}
                    className="w-full flex items-center gap-3 p-3 bg-[#0d1421] rounded-xl hover:bg-[#243447] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center">
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
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">{stock.symbol}</div>
                      <div className="text-sm text-[#8b9eb3]">{stock.name}</div>
                    </div>
                    <Plus className="w-5 h-5 text-[#2ecc71]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
