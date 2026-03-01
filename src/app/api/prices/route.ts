import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')?.split(',') || []
  
  if (symbols.length === 0) {
    return NextResponse.json({ error: 'No symbols provided' }, { status: 400 })
  }
  
  try {
    const results: Record<string, { price: number; change: number }> = {}
    
    // Fetch prices for all symbols
    const promises = symbols.map(async (symbol) => {
      try {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`,
          { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cache: 'no-store'
          }
        )
        
        if (res.ok) {
          const data = await res.json()
          const result = data.chart?.result?.[0]
          if (result) {
            const meta = result.meta
            const prevClose = meta.previousClose || meta.chartPreviousClose
            const currentPrice = meta.regularMarketPrice
            const change = prevClose ? ((currentPrice - prevClose) / prevClose) * 100 : 0
            
            results[symbol] = {
              price: currentPrice || 0,
              change: change || 0,
            }
          }
        }
      } catch (e) {
        console.error(`Failed to fetch ${symbol}:`, e)
        results[symbol] = { price: 0, change: 0 }
      }
    })
    
    await Promise.all(promises)
    
    return NextResponse.json({
      prices: results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch prices:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
