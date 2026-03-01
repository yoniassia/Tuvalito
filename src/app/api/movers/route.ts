import { NextResponse } from 'next/server'

const ETORO_USER_KEY = process.env.ETORO_USER_KEY || 'eyJlYW4iOiJVbnJlZ2lzdGVyZWRBcHBsaWNhdGlvbiIsImVrIjoiWTBmSWlEYnQ5eE1CQ1h6UlR0UFl5Z0p6cXlNMVhLMUR0OWZDVzBnakxXbFAxQzc4SW5TbndpSHJkckcxM2pWbTlzNTAuLklBZmR3bXAzWVlFZ1hvOHVSUm1KU3FRaGY0alM0NDJVWWJTdjBfIn0_'
const ETORO_API_KEY = process.env.ETORO_API_KEY || 'sdgdskldFPLGfjHn1421dgnlxdGTbngdflg6290bRjslfihsjhSDsdgGHH25hjf'

// Domain mapping for logos
const LOGO_DOMAINS: Record<string, string> = {
  'AAPL': 'apple.com', 'MSFT': 'microsoft.com', 'GOOGL': 'google.com', 'GOOG': 'google.com',
  'AMZN': 'amazon.com', 'META': 'meta.com', 'NVDA': 'nvidia.com', 'TSLA': 'tesla.com',
  'AMD': 'amd.com', 'INTC': 'intel.com', 'NFLX': 'netflix.com', 'DIS': 'disney.com',
  'PYPL': 'paypal.com', 'COIN': 'coinbase.com', 'PLTR': 'palantir.com', 'SHOP': 'shopify.com',
  'SQ': 'squareup.com', 'UBER': 'uber.com', 'LYFT': 'lyft.com', 'SNAP': 'snap.com',
  'PINS': 'pinterest.com', 'SPOT': 'spotify.com', 'RBLX': 'roblox.com', 'HOOD': 'robinhood.com',
  'SOFI': 'sofi.com', 'RIVN': 'rivian.com', 'LCID': 'lucidmotors.com', 'NIO': 'nio.com',
  'BABA': 'alibaba.com', 'JD': 'jd.com', 'CRM': 'salesforce.com', 'ORCL': 'oracle.com',
  'IBM': 'ibm.com', 'NOW': 'servicenow.com', 'ADBE': 'adobe.com', 'INTU': 'intuit.com',
  'MU': 'micron.com', 'AVGO': 'broadcom.com', 'QCOM': 'qualcomm.com', 'ARM': 'arm.com',
  'SMCI': 'supermicro.com', 'DELL': 'dell.com', 'PANW': 'paloaltonetworks.com',
  'CRWD': 'crowdstrike.com', 'NET': 'cloudflare.com', 'DDOG': 'datadoghq.com',
  'SNOW': 'snowflake.com', 'MDB': 'mongodb.com', 'ZM': 'zoom.us', 'OKTA': 'okta.com',
  'ROKU': 'roku.com', 'WMT': 'walmart.com', 'TGT': 'target.com', 'COST': 'costco.com',
  'HD': 'homedepot.com', 'NKE': 'nike.com', 'SBUX': 'starbucks.com', 'MCD': 'mcdonalds.com',
  'KO': 'coca-cola.com', 'PEP': 'pepsico.com', 'JNJ': 'jnj.com', 'PFE': 'pfizer.com',
  'MRK': 'merck.com', 'LLY': 'lilly.com', 'MRNA': 'modernatx.com', 'JPM': 'jpmorganchase.com',
  'BAC': 'bankofamerica.com', 'GS': 'goldmansachs.com', 'MS': 'morganstanley.com',
  'V': 'visa.com', 'MA': 'mastercard.com', 'AXP': 'americanexpress.com',
  'XOM': 'exxonmobil.com', 'CVX': 'chevron.com', 'BA': 'boeing.com', 'CAT': 'caterpillar.com',
}

import { getStockLogoFast } from '@/data/stock-logos'

function getLogoUrl(symbol: string): string {
  return getStockLogoFast(symbol)
}

// Popular US stocks to track for movers
const POPULAR_STOCKS = [
  'NVDA', 'TSLA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD', 'NFLX',
  'COIN', 'PLTR', 'RIVN', 'LCID', 'NIO', 'SOFI', 'HOOD', 'SNAP', 'UBER',
  'ROKU', 'CRWD', 'SNOW', 'DDOG', 'NET', 'MDB', 'ZM', 'SHOP', 'SQ',
  'BA', 'DIS', 'PYPL', 'INTC', 'MU', 'ARM', 'SMCI', 'AVGO', 'QCOM'
]

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  logo: string
}

async function fetchFromYahoo(symbols: string[]): Promise<StockData[]> {
  try {
    const results: StockData[] = []
    
    // Fetch in batches of 10
    for (let i = 0; i < symbols.length; i += 10) {
      const batch = symbols.slice(i, i + 10)
      const promises = batch.map(async (symbol) => {
        try {
          const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
          )
          
          if (res.ok) {
            const data = await res.json()
            const result = data.chart?.result?.[0]
            if (result) {
              const meta = result.meta
              const prevClose = meta.previousClose || meta.chartPreviousClose
              const currentPrice = meta.regularMarketPrice
              const change = prevClose ? ((currentPrice - prevClose) / prevClose) * 100 : 0
              
              return {
                symbol,
                name: meta.shortName || meta.longName || symbol,
                price: currentPrice,
                change,
                logo: getLogoUrl(symbol),
              }
            }
          }
        } catch {
          return null
        }
        return null
      })
      
      const batchResults = await Promise.all(promises)
      results.push(...batchResults.filter(Boolean) as StockData[])
    }
    
    return results
  } catch (error) {
    console.error('Yahoo fetch failed:', error)
    return []
  }
}

async function fetchFromEtoro(): Promise<{ gainers: StockData[], losers: StockData[] }> {
  try {
    const fields = 'instrumentId,displayname,internalSymbolFull,currentRate,dailyPriceChange'
    const headers = {
      'x-request-id': crypto.randomUUID(),
      'x-user-key': ETORO_USER_KEY,
      'x-api-key': ETORO_API_KEY,
      'User-Agent': 'Mozilla/5.0',
    }
    
    // Get gainers - US stocks only
    const gainersUrl = `https://www.etoro.com/api/public/v1/market-data/search?assetClass=Stocks&exchange=NASDAQ&pageSize=20&sortField=dailyPriceChange&sortOrder=desc&fields=${fields}`
    const losersUrl = `https://www.etoro.com/api/public/v1/market-data/search?assetClass=Stocks&exchange=NASDAQ&pageSize=20&sortField=dailyPriceChange&sortOrder=asc&fields=${fields}`
    
    const [gainersRes, losersRes] = await Promise.all([
      fetch(gainersUrl, { headers, cache: 'no-store' }),
      fetch(losersUrl, { headers, cache: 'no-store' }),
    ])
    
    const formatItem = (item: any): StockData => ({
      symbol: item.internalSymbolFull || '',
      name: item.displayname || '',
      price: item.currentRate || 0,
      change: item.dailyPriceChange || 0,
      logo: getLogoUrl(item.internalSymbolFull || ''),
    })
    
    const gainersData = gainersRes.ok ? await gainersRes.json() : { items: [] }
    const losersData = losersRes.ok ? await losersRes.json() : { items: [] }
    
    return {
      gainers: (gainersData.items || []).filter((i: any) => i.dailyPriceChange > 0).slice(0, 5).map(formatItem),
      losers: (losersData.items || []).filter((i: any) => i.dailyPriceChange < 0).slice(0, 5).map(formatItem),
    }
  } catch {
    return { gainers: [], losers: [] }
  }
}

export async function GET() {
  try {
    // Try eToro first
    let { gainers, losers } = await fetchFromEtoro()
    
    // If eToro returns empty or forex, use Yahoo Finance
    const hasValidData = gainers.length > 0 && 
      gainers.some(g => !g.symbol.includes('USD') && !g.symbol.includes('/'))
    
    if (!hasValidData) {
      // Fallback: fetch popular stocks from Yahoo and sort by change
      const allStocks = await fetchFromYahoo(POPULAR_STOCKS)
      
      const sorted = allStocks
        .filter(s => s.change !== 0)
        .sort((a, b) => b.change - a.change)
      
      gainers = sorted.filter(s => s.change > 0).slice(0, 5)
      losers = sorted.filter(s => s.change < 0).slice(-5).reverse()
    }
    
    // Mixed movers: top 3 gainers + top 2 losers
    const movers = [...gainers.slice(0, 3), ...losers.slice(0, 2)]
    
    return NextResponse.json({
      gainers,
      losers,
      movers,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch movers:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
