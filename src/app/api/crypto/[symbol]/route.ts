import { NextResponse } from 'next/server'

// Map common symbols to CoinGecko IDs
const CRYPTO_IDS: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'AVAX': 'avalanche-2',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'SHIB': 'shiba-inu',
  'APT': 'aptos',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'NEAR': 'near',
  'FTM': 'fantom',
}

const CRYPTO_NAMES: Record<string, string> = {
  'BTC': 'Bitcoin',
  'ETH': 'Ethereum',
  'SOL': 'Solana',
  'XRP': 'XRP',
  'ADA': 'Cardano',
  'DOGE': 'Dogecoin',
  'DOT': 'Polkadot',
  'MATIC': 'Polygon',
  'LINK': 'Chainlink',
  'AVAX': 'Avalanche',
  'UNI': 'Uniswap',
  'ATOM': 'Cosmos',
  'LTC': 'Litecoin',
  'BCH': 'Bitcoin Cash',
  'SHIB': 'Shiba Inu',
  'APT': 'Aptos',
  'ARB': 'Arbitrum',
  'OP': 'Optimism',
  'NEAR': 'NEAR Protocol',
  'FTM': 'Fantom',
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const upperSymbol = symbol?.toUpperCase()
  
  if (!upperSymbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
  }
  
  const coinId = CRYPTO_IDS[upperSymbol] || upperSymbol.toLowerCase()
  
  try {
    // Fetch from CoinGecko
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
      { 
        headers: { 
          'Accept': 'application/json',
        },
        cache: 'no-store'
      }
    )
    
    if (!res.ok) {
      // Try Yahoo Finance as fallback for crypto
      const yahooSymbol = `${upperSymbol}-USD`
      const yahooRes = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=5d`,
        { 
          headers: { 'User-Agent': 'Mozilla/5.0' },
          cache: 'no-store'
        }
      )
      
      if (yahooRes.ok) {
        const yahooData = await yahooRes.json()
        const result = yahooData.chart?.result?.[0]
        if (result) {
          const meta = result.meta
          const previousClose = meta.previousClose || meta.chartPreviousClose || 0
          const currentPrice = meta.regularMarketPrice || 0
          const change = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0
          
          return NextResponse.json({
            symbol: upperSymbol,
            name: CRYPTO_NAMES[upperSymbol] || upperSymbol,
            price: currentPrice,
            change,
            previousClose,
            high24h: meta.regularMarketDayHigh || 0,
            low24h: meta.regularMarketDayLow || 0,
            volume24h: meta.regularMarketVolume || 0,
            marketCap: 0,
            circulatingSupply: 0,
            totalSupply: 0,
            ath: 0,
            athDate: null,
          })
        }
      }
      
      return NextResponse.json({ error: 'Crypto not found' }, { status: 404 })
    }
    
    const data = await res.json()
    
    const currentPrice = data.market_data?.current_price?.usd || 0
    const previousClose = currentPrice / (1 + (data.market_data?.price_change_percentage_24h || 0) / 100)
    
    return NextResponse.json({
      symbol: upperSymbol,
      name: data.name || CRYPTO_NAMES[upperSymbol] || upperSymbol,
      price: currentPrice,
      change: data.market_data?.price_change_percentage_24h || 0,
      previousClose,
      high24h: data.market_data?.high_24h?.usd || 0,
      low24h: data.market_data?.low_24h?.usd || 0,
      volume24h: data.market_data?.total_volume?.usd || 0,
      marketCap: data.market_data?.market_cap?.usd || 0,
      circulatingSupply: data.market_data?.circulating_supply || 0,
      totalSupply: data.market_data?.total_supply || 0,
      ath: data.market_data?.ath?.usd || 0,
      athDate: data.market_data?.ath_date?.usd || null,
      athChangePercentage: data.market_data?.ath_change_percentage?.usd || 0,
      image: data.image?.large || data.image?.small || null,
      description: data.description?.en?.slice(0, 500) || null,
    })
  } catch (error) {
    console.error('Failed to fetch crypto data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
