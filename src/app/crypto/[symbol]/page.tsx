'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Star, StarOff, ExternalLink } from 'lucide-react'

interface CryptoData {
  symbol: string
  name: string
  price: number
  change: number
  previousClose: number
  high24h: number
  low24h: number
  volume24h: number
  marketCap: number
  circulatingSupply: number
  totalSupply: number
  ath: number
  athDate: string | null
  athChangePercentage: number
  image: string | null
  description: string | null
}

const CRYPTO_COLORS: Record<string, string> = {
  'BTC': '#F7931A',
  'ETH': '#627EEA',
  'SOL': '#00FFA3',
  'XRP': '#23292F',
  'ADA': '#0033AD',
  'DOGE': '#C2A633',
  'DOT': '#E6007A',
  'MATIC': '#8247E5',
  'LINK': '#2A5ADA',
  'AVAX': '#E84142',
}

export default function CryptoPage() {
  const params = useParams()
  const symbol = (params.symbol as string)?.toUpperCase() || ''
  
  const [crypto, setCrypto] = useState<CryptoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [inWatchlist, setInWatchlist] = useState(false)

  useEffect(() => {
    if (symbol) {
      fetchCryptoData()
      checkWatchlist()
    }
  }, [symbol])

  function checkWatchlist() {
    const saved = localStorage.getItem('crypto-watchlist')
    const symbols = saved ? JSON.parse(saved) as string[] : []
    setInWatchlist(symbols.includes(symbol))
  }

  function toggleWatchlist() {
    const saved = localStorage.getItem('crypto-watchlist')
    const symbols = saved ? JSON.parse(saved) as string[] : []
    
    if (inWatchlist) {
      const updated = symbols.filter(s => s !== symbol)
      localStorage.setItem('crypto-watchlist', JSON.stringify(updated))
      setInWatchlist(false)
    } else {
      const updated = [...symbols, symbol]
      localStorage.setItem('crypto-watchlist', JSON.stringify(updated))
      setInWatchlist(true)
    }
  }

  async function fetchCryptoData() {
    setRefreshing(true)
    
    try {
      const res = await fetch(`/api/crypto/${symbol}`)
      
      if (res.ok) {
        const data = await res.json()
        setCrypto(data)
      } else {
        setCrypto(null)
      }
    } catch (error) {
      console.error('Failed to fetch crypto:', error)
      setCrypto(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function formatNumber(num: number, decimals = 2): string {
    if (num >= 1e12) return (num / 1e12).toFixed(decimals) + 'T'
    if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K'
    return num.toFixed(decimals)
  }

  function formatPrice(price: number): string {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(2)
    if (price >= 0.01) return price.toFixed(4)
    return price.toFixed(8)
  }

  const brandColor = CRYPTO_COLORS[symbol] || '#00C896'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00C896]"></div>
      </div>
    )
  }

  if (!crypto) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center">
        <p className="text-gray-400 text-lg mb-4">Crypto not found: {symbol}</p>
        <Link href="/" className="text-[#00C896] hover:underline">
          ← Back to Home
        </Link>
      </div>
    )
  }

  const isPositive = crypto.change >= 0

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0D1117]/95 backdrop-blur-lg border-b border-[#30363D]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleWatchlist}
                className="p-2 rounded-lg hover:bg-[#161B22] transition-colors"
              >
                {inWatchlist ? (
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ) : (
                  <StarOff className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <button
                onClick={fetchCryptoData}
                disabled={refreshing}
                className="p-2 rounded-lg hover:bg-[#161B22] transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Crypto Header */}
        <div className="flex items-start gap-4 mb-8">
          {crypto.image && (
            <img src={crypto.image} alt={crypto.name} className="w-16 h-16 rounded-full" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{crypto.name}</h1>
              <span className="text-xl text-gray-500">{crypto.symbol}</span>
            </div>
            <div className="flex items-baseline gap-4 mt-2">
              <span className="text-4xl font-bold text-white">
                ${formatPrice(crypto.price)}
              </span>
              <div className={`flex items-center gap-1 text-lg font-medium ${isPositive ? 'text-[#00C896]' : 'text-[#F45B69]'}`}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span>{isPositive ? '+' : ''}{crypto.change.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Market Cap</div>
            <div className="text-white font-semibold">${formatNumber(crypto.marketCap)}</div>
          </div>
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">24h Volume</div>
            <div className="text-white font-semibold">${formatNumber(crypto.volume24h)}</div>
          </div>
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">24h High</div>
            <div className="text-[#00C896] font-semibold">${formatPrice(crypto.high24h)}</div>
          </div>
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">24h Low</div>
            <div className="text-[#F45B69] font-semibold">${formatPrice(crypto.low24h)}</div>
          </div>
        </div>

        {/* Supply Info */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Supply Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm mb-1">Circulating Supply</div>
              <div className="text-white font-medium">{formatNumber(crypto.circulatingSupply, 0)} {crypto.symbol}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Total Supply</div>
              <div className="text-white font-medium">
                {crypto.totalSupply ? `${formatNumber(crypto.totalSupply, 0)} ${crypto.symbol}` : '∞'}
              </div>
            </div>
          </div>
        </div>

        {/* ATH Info */}
        {crypto.ath > 0 && (
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">All-Time High</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">${formatPrice(crypto.ath)}</div>
                {crypto.athDate && (
                  <div className="text-gray-400 text-sm mt-1">
                    {new Date(crypto.athDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                )}
              </div>
              {crypto.athChangePercentage && (
                <div className="text-[#F45B69] font-medium">
                  {crypto.athChangePercentage.toFixed(1)}% from ATH
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {crypto.description && (
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">About {crypto.name}</h2>
            <p className="text-gray-300 leading-relaxed" 
               dangerouslySetInnerHTML={{ __html: crypto.description }} />
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`https://www.coingecko.com/en/coins/${crypto.symbol.toLowerCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#161B22] border border-[#30363D] rounded-lg text-gray-300 hover:border-[#00C896] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            CoinGecko
          </a>
          <a
            href={`https://www.tradingview.com/chart/?symbol=BINANCE:${crypto.symbol}USDT`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#161B22] border border-[#30363D] rounded-lg text-gray-300 hover:border-[#00C896] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            TradingView
          </a>
        </div>
      </div>
    </div>
  )
}
