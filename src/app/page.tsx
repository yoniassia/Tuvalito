'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";

interface Mover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  logo: string;
}

interface Market {
  symbol: string;
  displayName: string;
  price: number;
  change: number;
}

import { STOCK_LOGOS } from '@/data/stock-logos';

// Helper to get stock logo URL
const getStockLogo = (symbol: string) => 
  STOCK_LOGOS[symbol.toUpperCase()] || `https://etoro-cdn.etorostatic.com/market-avatars/${symbol.toLowerCase()}/150x150.png`;

// Static data for Explore Markets (portfolios don't change frequently)
const exploreMarkets = [
  {
    id: 1,
    name: "Quantum Computing",
    return: 460.24,
    period: "2Y",
    trending: true,
    stocks: [
      { symbol: "NVDA", logo: getStockLogo("nvda") },
      { symbol: "GOOGL", logo: getStockLogo("googl") },
      { symbol: "IBM", logo: getStockLogo("ibm") },
    ],
    totalStocks: 20,
    bgGradient: "from-purple-900/80 via-blue-900/60 to-cyan-900/40",
    bgImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
  },
  {
    id: 2,
    name: "AI Revolution",
    return: 185.50,
    period: "1Y",
    trending: false,
    stocks: [
      { symbol: "MSFT", logo: getStockLogo("msft") },
      { symbol: "NVDA", logo: getStockLogo("nvda") },
      { symbol: "META", logo: getStockLogo("meta") },
    ],
    totalStocks: 15,
    bgGradient: "from-emerald-900/80 via-teal-900/60 to-blue-900/40",
    bgImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
  },
  {
    id: 3,
    name: "Clean Energy",
    return: 89.30,
    period: "1Y",
    trending: false,
    stocks: [
      { symbol: "TSLA", logo: getStockLogo("tsla") },
      { symbol: "ENPH", logo: getStockLogo("enph") },
      { symbol: "FSLR", logo: getStockLogo("fslr") },
    ],
    totalStocks: 12,
    bgGradient: "from-green-900/80 via-emerald-900/60 to-teal-900/40",
    bgImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
  },
];

export default function HomePage() {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch movers and markets in parallel
        const [moversRes, marketsRes] = await Promise.all([
          fetch('/api/movers'),
          fetch('/api/markets'),
        ]);
        
        if (moversRes.ok) {
          const moversData = await moversRes.json();
          setMovers(moversData.movers || []);
        }
        
        if (marketsRes.ok) {
          const marketsData = await marketsRes.json();
          setMarkets(marketsData.markets || []);
          setIsMarketOpen(marketsData.isMarketOpen || false);
        }
        
        setError(null);
      } catch (e) {
        console.error('Failed to fetch data:', e);
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const spyData = markets.find(m => m.symbol === 'SPY');

  return (
    <div className="min-h-screen bg-[#0d1421]">
      {/* Tabs */}
      <nav className="px-4 border-b border-[#2a3a4d]">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {["Overview", "Stocks", "Crypto", "Pro Investors", "Smart Portfolios"].map((tab, i) => (
            <button
              key={tab}
              className={`py-3 text-sm whitespace-nowrap transition-colors ${
                i === 0 
                  ? "text-white border-b-2 border-white font-medium" 
                  : "text-[#5a6b7d] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="px-4 py-6 space-y-8">
        {/* Explore Markets */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Explore Markets</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {exploreMarkets.map((market) => (
              <Card 
                key={market.id}
                className="flex-shrink-0 w-72 border-none rounded-2xl overflow-hidden relative shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-shadow cursor-pointer group"
              >
                {/* Background Image with Overlay */}
                <div className="h-48 relative">
                  <Image
                    src={market.bgImage}
                    alt={market.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${market.bgGradient}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {market.trending && (
                    <Badge className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white border-none text-xs">
                      Trending
                    </Badge>
                  )}
                  
                  {/* Content */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#2ecc71] transition-colors">
                      {market.name}
                    </h3>
                    <div className="text-2xl font-bold text-[#2ecc71]">
                      {market.return}%
                    </div>
                    <div className="text-xs text-white/70">
                      Return ({market.period})
                    </div>
                    
                    {/* Stock logos */}
                    <div className="flex items-center gap-1 mt-3">
                      {market.stocks.map((stock) => (
                        <div 
                          key={stock.symbol} 
                          className="w-6 h-6 rounded-full bg-white overflow-hidden flex items-center justify-center"
                        >
                          <Image
                            src={stock.logo}
                            alt={stock.symbol}
                            width={24}
                            height={24}
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      ))}
                      <span className="text-xs text-white/70 ml-1">
                        +{market.totalStocks - 3} MORE
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Daily Movers */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Daily Movers</h2>
              <p className="text-sm text-[#8b9eb3] flex items-center gap-2">
                Today&apos;s biggest gainers and losers
                <span className="w-4 h-4 rounded-full border border-[#5a6b7d] flex items-center justify-center text-[10px]">
                  i
                </span>
              </p>
            </div>
            <button className="text-[#5a6b7d] hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          
          <div className="bg-[#1a2332] rounded-2xl overflow-hidden shadow-lg shadow-black/10">
            {loading ? (
              // Loading skeleton
              <div className="space-y-0">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`flex items-center p-4 ${i < 5 ? "border-b border-[#2a3a4d]" : ""}`}>
                    <div className="w-10 h-10 rounded-full bg-[#243447] animate-pulse mr-3" />
                    <div className="flex-1">
                      <div className="h-4 w-16 bg-[#243447] rounded animate-pulse mb-2" />
                      <div className="h-3 w-32 bg-[#243447] rounded animate-pulse" />
                    </div>
                    <div className="h-5 w-16 bg-[#243447] rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : error ? (
              // Error state
              <div className="p-8 text-center">
                <div className="text-[#e74c3c] mb-2">⚠️</div>
                <div className="text-[#8b9eb3]">{error}</div>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 text-[#2ecc71] hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : movers.length === 0 ? (
              // Empty state
              <div className="p-8 text-center">
                <div className="text-[#8b9eb3]">No market data available</div>
              </div>
            ) : (
              // Data
              movers.map((stock, i) => (
                <Link 
                  key={stock.symbol}
                  href={`/stock/${stock.symbol}`}
                  className={`flex items-center p-4 hover:bg-[#243447] transition-colors cursor-pointer ${
                    i < movers.length - 1 ? "border-b border-[#2a3a4d]" : ""
                  }`}
                >
                  {/* Logo */}
                  <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center mr-3 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={stock.logo}
                      alt={stock.symbol}
                      width={40}
                      height={40}
                      className="object-contain w-full h-full"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to first letter if logo fails
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<span class="text-black font-bold text-lg">${stock.symbol[0]}</span>`;
                      }}
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white">{stock.symbol}</div>
                    <div className="text-sm text-[#8b9eb3] truncate">{stock.name}</div>
                  </div>
                  
                  {/* Change */}
                  <div className={`text-lg font-semibold ${
                    stock.change >= 0 ? "text-[#2ecc71]" : "text-[#e74c3c]"
                  }`}>
                    {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Alpha Banner */}
        <section>
          <Link href="/alpha">
            <Card className="bg-gradient-to-r from-[#1a2332] to-[#243447] border border-[#2ecc71]/30 rounded-2xl p-4 shadow-lg shadow-black/10 hover:border-[#2ecc71]/50 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Alpha</span>
                      <span className="px-1.5 py-0.5 bg-[#2ecc71]/20 rounded text-[10px] font-bold text-[#2ecc71]">NEW</span>
                    </div>
                    <p className="text-xs text-[#8b9eb3]">Portfolio signals & analytics</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#5a6b7d] group-hover:text-[#2ecc71] group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 gap-4">
          <Card className="bg-[#1a2332] border-none rounded-2xl p-4 shadow-lg shadow-black/10">
            <div className="text-[#8b9eb3] text-sm mb-1">Market Status</div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-[#2ecc71] animate-pulse' : 'bg-[#e74c3c]'}`}></span>
              <span className="text-white font-semibold">{isMarketOpen ? 'Open' : 'Closed'}</span>
            </div>
          </Card>
          <Card className="bg-[#1a2332] border-none rounded-2xl p-4 shadow-lg shadow-black/10">
            <div className="text-[#8b9eb3] text-sm mb-1">S&P 500</div>
            {loading ? (
              <div className="h-5 w-16 bg-[#243447] rounded animate-pulse" />
            ) : spyData ? (
              <div className={`font-semibold ${spyData.change >= 0 ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                {spyData.change >= 0 ? '+' : ''}{spyData.change.toFixed(2)}%
              </div>
            ) : (
              <div className="text-[#8b9eb3]">--</div>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}
