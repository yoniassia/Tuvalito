import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
  }
  
  try {
    // Fetch quote data from Yahoo Finance
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=1d&range=5d&includePrePost=false`,
      { 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        cache: 'no-store'
      }
    )
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }
    
    const data = await res.json()
    const result = data.chart?.result?.[0]
    
    if (!result) {
      return NextResponse.json({ error: 'Symbol not found' }, { status: 404 })
    }
    
    const meta = result.meta
    const quote = result.indicators?.quote?.[0] || {}
    
    // Get the latest values
    const latestClose = quote.close?.filter((v: number | null) => v !== null).pop() || 0
    const latestHigh = quote.high?.filter((v: number | null) => v !== null).pop() || 0
    const latestLow = quote.low?.filter((v: number | null) => v !== null).pop() || 0
    const latestOpen = quote.open?.filter((v: number | null) => v !== null).pop() || 0
    const latestVolume = quote.volume?.filter((v: number | null) => v !== null).pop() || 0
    
    const previousClose = meta.previousClose || meta.chartPreviousClose || 0
    const currentPrice = meta.regularMarketPrice || latestClose
    const change = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0
    
    // Fetch additional data (fundamentals) using v6 quote endpoint
    let fundamentals: {
      marketCap?: number
      pe?: number
      eps?: number
      fiftyTwoWeekHigh?: number
      fiftyTwoWeekLow?: number
      avgVolume?: number
      beta?: number
    } = {}
    
    try {
      const quoteRes = await fetch(
        `https://query1.finance.yahoo.com/v6/finance/quote?symbols=${symbol.toUpperCase()}`,
        { 
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          cache: 'no-store'
        }
      )
      
      if (quoteRes.ok) {
        const quoteData = await quoteRes.json()
        const q = quoteData.quoteResponse?.result?.[0] || {}
        
        fundamentals = {
          marketCap: q.marketCap || 0,
          pe: q.trailingPE || q.forwardPE || 0,
          eps: q.epsTrailingTwelveMonths || 0,
          fiftyTwoWeekHigh: q.fiftyTwoWeekHigh || 0,
          fiftyTwoWeekLow: q.fiftyTwoWeekLow || 0,
          avgVolume: q.averageDailyVolume10Day || q.averageVolume || 0,
          beta: q.beta || 0,
        }
      }
    } catch (e) {
      console.error('Failed to fetch fundamentals:', e)
    }
    
    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      name: meta.longName || meta.shortName || symbol.toUpperCase(),
      price: currentPrice,
      change,
      previousClose,
      open: latestOpen || meta.regularMarketOpen || 0,
      dayHigh: latestHigh || meta.regularMarketDayHigh || 0,
      dayLow: latestLow || meta.regularMarketDayLow || 0,
      volume: latestVolume || meta.regularMarketVolume || 0,
      ...fundamentals,
    })
  } catch (error) {
    console.error('Failed to fetch stock data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
