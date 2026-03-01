import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Cache for the loaded data
let cachedData: Record<string, unknown> | null = null;
let lastLoadTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function loadGuruFocusData() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedData && (now - lastLoadTime) < CACHE_DURATION) {
    return cachedData;
  }
  
  try {
    // Load full data for historical charts
    const dataPath = path.join(process.cwd(), 'data', 'gurufocus_all_data.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    cachedData = JSON.parse(data);
    lastLoadTime = now;
    return cachedData;
  } catch (error) {
    console.error('Failed to load GuruFocus data:', error);
    return null;
  }
}

interface GuruFocusStock {
  symbol: string;
  profile?: {
    basic_information?: {
      company?: string;
    };
    fundamental?: Record<string, number>;
    dividends?: Record<string, number>;
  };
  rankings?: {
    guru_focus_rankings?: {
      gf_score?: number;
      gf_value?: number;
      margin_gf_value?: number;
      gf_value_est_12m?: number;
      rank_growth?: number;
      rank_profitability?: number;
      rank_momentum?: number;
      rank_balancesheet?: number;
      rank_gf_value?: number;
      predictability?: number;
    };
  };
  fundamentals?: Record<string, unknown>;
  valuations?: {
    annually?: Array<{
      date: string;
      valuationand_quality?: {
        graham_number?: number;
        peter_lynch_fair_value?: number;
        intrinsic_value_projected_fcf?: number;
        month_end_stock_price?: number;
        epv?: number;
      };
      valuation_ratios?: {
        pe_ratio?: number;
        pb_ratio?: number;
        ps_ratio?: number;
        peg_ratio?: number;
        shiller_pe_ratio?: number;
        enterprise_value_to_ebit?: number;
        enterprise_value_to_ebitda?: number;
      };
    }>;
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();
  
  const data = await loadGuruFocusData();
  
  if (!data || !data.stocks) {
    return NextResponse.json(
      { error: 'GuruFocus data not available' },
      { status: 503 }
    );
  }
  
  const stocks = data.stocks as Record<string, GuruFocusStock>;
  const stockData = stocks[upperSymbol];
  
  if (!stockData) {
    return NextResponse.json(
      { error: 'Stock not found in GuruFocus data' },
      { status: 404 }
    );
  }
  
  // Extract and format the most useful data
  const rankings = stockData.rankings?.guru_focus_rankings || {};
  const profile = stockData.profile || {};
  const fundamentals = stockData.fundamentals || {};
  
  // Get latest valuation data if available
  const valuations = stockData.valuations?.annually || [];
  const latestValuation = valuations[valuations.length - 1] || {};
  
  // Get latest valuation values for top-level access
  const latestGraham = latestValuation.valuationand_quality?.graham_number || 0;
  const latestLynch = latestValuation.valuationand_quality?.peter_lynch_fair_value || 0;
  const latestDCF = latestValuation.valuationand_quality?.intrinsic_value_projected_fcf || 0;
  const latestPEG = latestValuation.valuation_ratios?.peg_ratio || 0;
  
  const response = {
    symbol: upperSymbol,
    name: profile.basic_information?.company || upperSymbol,
    
    // GF Rankings
    gfScore: rankings.gf_score,
    gfValue: rankings.gf_value,
    gfValueMargin: rankings.margin_gf_value, // % difference from current price
    gfValue12m: rankings.gf_value_est_12m, // 12-month estimate
    
    // TOP LEVEL valuation values (for pages that expect them here)
    grahamNumber: latestGraham,
    peterLynchFairValue: latestLynch,
    dcfValue: latestDCF,
    pegRatio: latestPEG,
    
    // Ranks (1-10)
    ranks: {
      growth: rankings.rank_growth,
      profitability: rankings.rank_profitability,
      momentum: rankings.rank_momentum,
      balanceSheet: rankings.rank_balancesheet,
      gfValue: rankings.rank_gf_value,
    },
    
    // Predictability (1-5 stars)
    predictability: rankings.predictability,
    
    // Fundamentals
    fundamental: profile.fundamental || {},
    
    // Dividends
    dividends: profile.dividends || {},
    
    // Latest Valuation Metrics (also nested for backward compat)
    valuationMetrics: {
      grahamNumber: latestGraham,
      peterLynchFairValue: latestLynch,
      dcfValue: latestDCF,
      peRatio: latestValuation.valuation_ratios?.pe_ratio,
      pbRatio: latestValuation.valuation_ratios?.pb_ratio,
      psRatio: latestValuation.valuation_ratios?.ps_ratio,
      pegRatio: latestPEG,
      shillerPE: latestValuation.valuation_ratios?.shiller_pe_ratio,
      evToEbit: latestValuation.valuation_ratios?.enterprise_value_to_ebit,
      evToEbitda: latestValuation.valuation_ratios?.enterprise_value_to_ebitda,
    },
    
    // Historical data for charts (last 15 years)
    historicalValuations: valuations.slice(-15).map(v => ({
      date: v.date,
      price: v.valuationand_quality?.month_end_stock_price,
      grahamNumber: v.valuationand_quality?.graham_number,
      peterLynchFairValue: v.valuationand_quality?.peter_lynch_fair_value, // Fixed naming
      dcf: v.valuationand_quality?.intrinsic_value_projected_fcf,
      gfValue: v.valuationand_quality?.epv, // EPV is close to GF Value
      pe: v.valuation_ratios?.pe_ratio,
      pb: v.valuation_ratios?.pb_ratio,
      evToEbit: v.valuation_ratios?.enterprise_value_to_ebit,
    })),
    
    // Meta
    dataSource: 'GuruFocus',
    lastUpdated: (data._meta as { lastUpdated?: string })?.lastUpdated,
  };
  
  return NextResponse.json(response);
}
