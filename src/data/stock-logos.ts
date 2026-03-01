// Pre-loaded stock logos from eToro CDN
// Pattern: https://etoro-cdn.etorostatic.com/market-avatars/{symbol}/150x150.png
// Fallback to letter avatar if logo doesn't exist

const ETORO_CDN = 'https://etoro-cdn.etorostatic.com/market-avatars';

// Verified working logos on eToro CDN (lowercase)
const VERIFIED_LOGOS = new Set([
  'aapl', 'nvda', 'tsla', 'msft', 'amzn', 'amd', 'intc', 'ibm',
  'nflx', 'dis', 'ba', 'cat', 'ko', 'pep', 'jnj', 'pg', 'wmt',
  'jpm', 'bac', 'gs', 'v', 'ma', 'pypl', 'xom', 'cvx',
  'spy', 'qqq', 'iwm', 'btc', 'eth', 'ltc', 'xrp',
]);

// Alternative CDN URLs for stocks not on eToro CDN
const CUSTOM_LOGOS: Record<string, string> = {
  // Tech
  'googl': 'https://www.google.com/favicon.ico',
  'goog': 'https://www.google.com/favicon.ico',
  'meta': 'https://static.xx.fbcdn.net/rsrc.php/v3/y5/r/FPWJ-5WGeuP.png',
  'coin': 'https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Wordmark.svg',
  'crwd': 'https://www.crowdstrike.com/wp-content/uploads/2020/01/cs-logo-red.svg',
  'ddog': 'https://imgix.datadoghq.com/img/dd_logo_70x75.png',
  'zm': 'https://st1.zoom.us/zoom.ico',
  'snow': 'https://www.snowflake.com/wp-content/themes/flavor/flavor/favicon/favicon-32x32.png',
  'pltr': 'https://www.palantir.com/favicon.ico',
  'shop': 'https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451dd0330bcdae304f.svg',
  'sq': 'https://squareup.com/favicon.ico',
  'uber': 'https://www.uber.com/favicon.ico',
  'lyft': 'https://www.lyft.com/favicon.ico',
  'snap': 'https://www.snap.com/favicon.ico',
  'spot': 'https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico',
  'rblx': 'https://images.rbxcdn.com/0dfc5a8bd8ae7c3e4e0b1bf7eacd7bb6.ico',
  'hood': 'https://robinhood.com/favicon.ico',
  'sofi': 'https://www.sofi.com/favicon.ico',
  'rivn': 'https://rivian.com/favicon.ico',
  'lcid': 'https://www.lucidmotors.com/favicon.ico',
  'nio': 'https://www.nio.com/favicon.ico',
  'mdb': 'https://www.mongodb.com/assets/images/global/favicon.ico',
  'net': 'https://www.cloudflare.com/favicon.ico',
  'okta': 'https://www.okta.com/sites/default/files/Okta_Logo_BrightBlue_Medium-thumbnail.png',
  'roku': 'https://www.roku.com/favicon.ico',
  'enph': 'https://enphase.com/favicon.ico',
  'fslr': 'https://www.firstsolar.com/favicon.ico',
};

export function getStockLogo(symbol: string): string {
  const s = symbol.toLowerCase();
  
  // Check custom logos first
  if (CUSTOM_LOGOS[s]) {
    return CUSTOM_LOGOS[s];
  }
  
  // Check if verified on eToro CDN
  if (VERIFIED_LOGOS.has(s)) {
    return `${ETORO_CDN}/${s}/150x150.png`;
  }
  
  // Try eToro CDN anyway (might work)
  return `${ETORO_CDN}/${s}/150x150.png`;
}

// Pre-computed map for common stocks (for fastest lookup)
export const STOCK_LOGOS: Record<string, string> = {
  // Big Tech
  'AAPL': `${ETORO_CDN}/aapl/150x150.png`,
  'MSFT': `${ETORO_CDN}/msft/150x150.png`,
  'GOOGL': 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png',
  'AMZN': `${ETORO_CDN}/amzn/150x150.png`,
  'META': 'https://companieslogo.com/img/orig/META-bef95f02.png',
  'NVDA': `${ETORO_CDN}/nvda/150x150.png`,
  'TSLA': `${ETORO_CDN}/tsla/150x150.png`,
  
  // Semiconductors
  'AMD': `${ETORO_CDN}/amd/150x150.png`,
  'INTC': `${ETORO_CDN}/intc/150x150.png`,
  'AVGO': `${ETORO_CDN}/avgo/150x150.png`,
  'QCOM': `${ETORO_CDN}/qcom/150x150.png`,
  
  // Fintech (using reliable CDN sources)
  'COIN': 'https://companieslogo.com/img/orig/COIN-6a246d41.png',
  'PYPL': `${ETORO_CDN}/pypl/150x150.png`,
  'SQ': 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://squareup.com&size=128',
  'HOOD': 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://robinhood.com&size=128',
  'SOFI': 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://sofi.com&size=128',
  
  // Cloud/SaaS (using reliable CDN sources)
  'CRWD': 'https://companieslogo.com/img/orig/CRWD-e8ded7de.png',
  'DDOG': 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://datadoghq.com&size=128',
  'ZM': 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://zoom.us&size=128',
  'SNOW': 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://snowflake.com&size=128',
  'NET': 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://cloudflare.com&size=128',
  'MDB': 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://mongodb.com&size=128',
  'PLTR': 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://palantir.com&size=128',
  
  // EV
  'RIVN': 'https://rivian.com/favicon.ico',
  'LCID': 'https://www.lucidmotors.com/favicon.ico',
  'NIO': 'https://www.nio.com/favicon.ico',
  
  // Social/Entertainment
  'NFLX': `${ETORO_CDN}/nflx/150x150.png`,
  'DIS': `${ETORO_CDN}/dis/150x150.png`,
  'SNAP': 'https://www.snap.com/favicon.ico',
  'SPOT': 'https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico',
  'ROKU': 'https://www.roku.com/favicon.ico',
  
  // Energy
  'ENPH': 'https://enphase.com/favicon.ico',
  'FSLR': 'https://www.firstsolar.com/favicon.ico',
  
  // Traditional
  'IBM': `${ETORO_CDN}/ibm/150x150.png`,
  'BA': `${ETORO_CDN}/ba/150x150.png`,
  'JPM': `${ETORO_CDN}/jpm/150x150.png`,
  'GS': `${ETORO_CDN}/gs/150x150.png`,
  'V': `${ETORO_CDN}/v/150x150.png`,
  'MA': `${ETORO_CDN}/ma/150x150.png`,
  'WMT': `${ETORO_CDN}/wmt/150x150.png`,
  'KO': `${ETORO_CDN}/ko/150x150.png`,
  'PEP': `${ETORO_CDN}/pep/150x150.png`,
  
  // ETFs
  'SPY': `${ETORO_CDN}/spy/150x150.png`,
  'QQQ': `${ETORO_CDN}/qqq/150x150.png`,
  'IWM': `${ETORO_CDN}/iwm/150x150.png`,
  
  // Crypto
  'BTC': `${ETORO_CDN}/btc/150x150.png`,
  'ETH': `${ETORO_CDN}/eth/150x150.png`,
};

// Domain mapping for Google Favicon fallback
const COMPANY_DOMAINS: Record<string, string> = {
  'COIN': 'coinbase.com', 'DDOG': 'datadoghq.com', 'CRWD': 'crowdstrike.com',
  'ZM': 'zoom.us', 'SNOW': 'snowflake.com', 'NET': 'cloudflare.com',
  'MDB': 'mongodb.com', 'PLTR': 'palantir.com', 'HOOD': 'robinhood.com',
  'SOFI': 'sofi.com', 'SQ': 'squareup.com', 'SHOP': 'shopify.com',
  'UBER': 'uber.com', 'LYFT': 'lyft.com', 'SNAP': 'snap.com',
  'SPOT': 'spotify.com', 'RBLX': 'roblox.com', 'ROKU': 'roku.com',
  'RIVN': 'rivian.com', 'LCID': 'lucidmotors.com', 'NIO': 'nio.com',
  'OKTA': 'okta.com', 'ENPH': 'enphase.com', 'FSLR': 'firstsolar.com',
};

function getGoogleFavicon(domain: string): string {
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`;
}

export function getStockLogoFast(symbol: string): string {
  const upper = symbol.toUpperCase();
  
  // Check pre-computed map first
  if (STOCK_LOGOS[upper]) {
    return STOCK_LOGOS[upper];
  }
  
  // Try Google Favicon as fallback
  if (COMPANY_DOMAINS[upper]) {
    return getGoogleFavicon(COMPANY_DOMAINS[upper]);
  }
  
  // Last resort: eToro CDN
  return getStockLogo(symbol);
}
