import { NextResponse } from 'next/server';

// Stock database for search
const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'UNH', name: 'UnitedHealth Group' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'MA', name: 'Mastercard Inc.' },
  { symbol: 'PG', name: 'Procter & Gamble' },
  { symbol: 'HD', name: 'The Home Depot' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation' },
  { symbol: 'CVX', name: 'Chevron Corporation' },
  { symbol: 'COST', name: 'Costco Wholesale' },
  { symbol: 'ABBV', name: 'AbbVie Inc.' },
  { symbol: 'KO', name: 'The Coca-Cola Company' },
  { symbol: 'PEP', name: 'PepsiCo Inc.' },
  { symbol: 'MRK', name: 'Merck & Co.' },
  { symbol: 'AVGO', name: 'Broadcom Inc.' },
  { symbol: 'LLY', name: 'Eli Lilly and Company' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific' },
  { symbol: 'ORCL', name: 'Oracle Corporation' },
  { symbol: 'CSCO', name: 'Cisco Systems' },
  { symbol: 'ACN', name: 'Accenture plc' },
  { symbol: 'MCD', name: "McDonald's Corporation" },
  { symbol: 'ABT', name: 'Abbott Laboratories' },
  { symbol: 'NKE', name: 'Nike Inc.' },
  { symbol: 'DIS', name: 'The Walt Disney Company' },
  { symbol: 'CRM', name: 'Salesforce Inc.' },
  { symbol: 'ADBE', name: 'Adobe Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'PYPL', name: 'PayPal Holdings' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.' },
  { symbol: 'TXN', name: 'Texas Instruments' },
  { symbol: 'IBM', name: 'International Business Machines' },
  { symbol: 'NOW', name: 'ServiceNow Inc.' },
  { symbol: 'UBER', name: 'Uber Technologies' },
  { symbol: 'SHOP', name: 'Shopify Inc.' },
  { symbol: 'SQ', name: 'Block Inc.' },
  { symbol: 'PLTR', name: 'Palantir Technologies' },
  { symbol: 'COIN', name: 'Coinbase Global' },
  { symbol: 'SNOW', name: 'Snowflake Inc.' },
  { symbol: 'NET', name: 'Cloudflare Inc.' },
  { symbol: 'ZM', name: 'Zoom Video Communications' },
  { symbol: 'ROKU', name: 'Roku Inc.' },
  { symbol: 'RIVN', name: 'Rivian Automotive' },
  { symbol: 'LCID', name: 'Lucid Group' },
  // Crypto
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'XRP', name: 'Ripple' },
  { symbol: 'DOGE', name: 'Dogecoin' },
  { symbol: 'ADA', name: 'Cardano' },
  // ETFs
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF' },
];

import { STOCK_LOGOS } from '@/data/stock-logos';

function getStockLogo(symbol: string): string {
  return STOCK_LOGOS[symbol.toUpperCase()] || 
    `https://etoro-cdn.etorostatic.com/market-avatars/${symbol.toLowerCase()}/150x150.png`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  
  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }
  
  // Search by symbol or name
  const results = STOCKS
    .filter(stock => 
      stock.symbol.toLowerCase().includes(query) ||
      stock.name.toLowerCase().includes(query)
    )
    .slice(0, 8) // Limit to 8 results
    .map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      logo: getStockLogo(stock.symbol),
    }));
  
  return NextResponse.json({ results });
}
