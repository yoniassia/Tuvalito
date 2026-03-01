import { NextResponse } from 'next/server'

const ETORO_USER_KEY = process.env.ETORO_USER_KEY || 'eyJlYW4iOiJVbnJlZ2lzdGVyZWRBcHBsaWNhdGlvbiIsImVrIjoiWTBmSWlEYnQ5eE1CQ1h6UlR0UFl5Z0p6cXlNMVhLMUR0OWZDVzBnakxXbFAxQzc4SW5TbndpSHJkckcxM2pWbTlzNTAuLklBZmR3bXAzWVlFZ1hvOHVSUm1KU3FRaGY0alM0NDJVWWJTdjBfIn0_'
const ETORO_API_KEY = process.env.ETORO_API_KEY || 'sdgdskldFPLGfjHn1421dgnlxdGTbngdflg6290bRjslfihsjhSDsdgGHH25hjf'

async function fetchStockData(symbol: string) {
  try {
    const fields = 'instrumentId,displayname,internalSymbolFull,currentRate,dailyPriceChange,isExchangeOpen'
    // Add assetClass filter for ETFs
    const searchUrl = `https://www.etoro.com/api/public/v1/market-data/search?internalSymbolFull=${symbol}&assetClass=ETF&pageSize=10&fields=${fields}`
    
    const res = await fetch(searchUrl, {
      headers: {
        'x-request-id': crypto.randomUUID(),
        'x-user-key': ETORO_USER_KEY,
        'x-api-key': ETORO_API_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
    })
    
    if (res.ok) {
      const data = await res.json()
      // Find exact match for symbol
      const item = data?.items?.find((i: any) => i.internalSymbolFull === symbol) || data?.items?.[0]
      if (item) {
        return {
          symbol: symbol, // Use the requested symbol, not the API response
          name: item.displayname,
          price: item.currentRate || 0,
          change: item.dailyPriceChange || 0,
          isOpen: item.isExchangeOpen || false,
        }
      }
    }
  } catch (e) {
    console.error(`Failed to fetch ${symbol}:`, e)
  }
  return null
}

// Fallback: Fetch from Yahoo Finance if eToro fails
async function fetchFromYahoo(symbol: string) {
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
          name: meta.shortName || meta.symbol,
          price: currentPrice,
          change,
          isOpen: meta.marketState === 'REGULAR',
        }
      }
    }
  } catch (e) {
    console.error(`Yahoo fallback failed for ${symbol}:`, e)
  }
  return null
}

export async function GET() {
  try {
    // Major US indices
    const indices = ['SPY', 'QQQ', 'DIA', 'IWM']
    
    // Map to friendly names
    const indexNames: Record<string, string> = {
      'SPY': 'S&P 500',
      'QQQ': 'Nasdaq 100',
      'DIA': 'Dow Jones',
      'IWM': 'Russell 2000',
    }
    
    // Try eToro first, fallback to Yahoo
    const indexData = await Promise.all(
      indices.map(async (symbol) => {
        let data = await fetchStockData(symbol)
        if (!data) {
          data = await fetchFromYahoo(symbol)
        }
        return data
      })
    )
    
    const markets = indexData
      .filter(Boolean)
      .map(item => ({
        ...item,
        displayName: indexNames[item!.symbol] || item!.name,
      }))
    
    // Determine if market is open (from SPY data)
    const spyData = markets.find(m => m.symbol === 'SPY')
    const isMarketOpen = spyData?.isOpen || false
    
    return NextResponse.json({
      markets,
      isMarketOpen,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch markets:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
