import { chromium, Frame } from 'playwright';

const BASE_URL = 'https://tuval.clawz.org';
const ETORO_USERNAME = 'maratkoss';
const ETORO_PASSWORD = 'maratkoss';

async function runQA() {
  console.log('🚀 Starting QA for tuval.clawz.org\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  try {
    // 1. Go to login page
    console.log('📍 Step 1: Loading login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/qa-01-login-page.png' });
    console.log('✅ Login page loaded');
    
    // 2. Click login button
    console.log('\n📍 Step 2: Clicking eToro login...');
    await page.click('button:has-text("Login with eToro")');
    await page.waitForURL(/etoro\.com/, { timeout: 15000 });
    console.log('   Redirected to eToro SSO');
    
    // Wait for page to stabilize
    console.log('   Waiting for login form...');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: '/tmp/qa-02-etoro.png' });
    
    // Find the login iframe
    let loginFrame: Frame | null = null;
    const frames = page.frames();
    console.log(`   Found ${frames.length} frames`);
    
    for (const frame of frames) {
      const url = frame.url();
      if (url.includes('/embed/login') || url.includes('etoro.com/login')) {
        loginFrame = frame;
        console.log(`   ✅ Found login frame: ${url.substring(0, 60)}`);
        break;
      }
    }
    
    if (!loginFrame) {
      throw new Error('Login iframe not found');
    }
    
    // Wait for inputs in the iframe
    await loginFrame.waitForSelector('input', { timeout: 30000 });
    
    // Debug: list inputs in frame
    const inputs = await loginFrame.$$('input');
    console.log(`   Found ${inputs.length} inputs in login frame`);
    
    // Handle cookie consent if on main page
    try {
      await page.click('button:has-text("Accept All")', { timeout: 2000 });
      console.log('   Accepted cookies');
    } catch {}
    
    // 3. Fill credentials in the iframe
    console.log('\n📍 Step 3: Filling credentials...');
    
    // Find username and password inputs
    const allInputs = await loginFrame.$$('input');
    for (const input of allInputs) {
      const type = await input.getAttribute('type');
      const autocomplete = await input.getAttribute('autocomplete');
      console.log(`   Input: type=${type}, autocomplete=${autocomplete}`);
    }
    
    // Fill username (first text/email input)
    const usernameInput = await loginFrame.$('input[type="text"], input[type="email"], input:not([type="password"]):not([type="checkbox"]):not([type="hidden"])');
    if (usernameInput) {
      await usernameInput.fill(ETORO_USERNAME);
      console.log('   ✅ Filled username');
    }
    
    // Fill password
    const passwordInput = await loginFrame.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill(ETORO_PASSWORD);
      console.log('   ✅ Filled password');
    }
    
    await page.screenshot({ path: '/tmp/qa-03-filled.png' });
    
    // 4. Submit
    console.log('\n📍 Step 4: Submitting...');
    const signInBtn = await loginFrame.$('button[type="submit"], button:has-text("Sign in")');
    if (signInBtn) {
      await signInBtn.click();
      console.log('   Clicked Sign in');
    } else {
      await loginFrame.press('input[type="password"]', 'Enter');
      console.log('   Pressed Enter');
    }
    
    // Wait for result
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/tmp/qa-04-after-submit.png' });
    
    // Poll for redirect or error
    let attempts = 0;
    while (attempts < 10) {
      const url = page.url();
      console.log(`   [${attempts}] ${url.substring(0, 70)}`);
      
      if (url.includes(BASE_URL) && !url.includes('/login')) {
        break;
      }
      
      // Check for error
      try {
        const bodyText = await loginFrame.textContent('body') || '';
        if (bodyText.includes('Invalid') || bodyText.includes('incorrect') || bodyText.includes('wrong')) {
          console.log('   ❌ Invalid credentials');
          await page.screenshot({ path: '/tmp/qa-error-credentials.png' });
          break;
        }
      } catch {}
      
      await page.waitForTimeout(2000);
      attempts++;
    }
    
    console.log('   Final URL:', page.url());
    await page.screenshot({ path: '/tmp/qa-05-final.png' });
    
    // Check success
    if (page.url().includes(BASE_URL) && !page.url().includes('/login')) {
      console.log('✅ Successfully logged in!\n');
      
      // Test pages
      console.log('📍 Step 5: Testing pages...');
      const pagesToTest = ['/', '/alpha', '/watchlist', '/discover', '/stock/AAPL'];
      
      for (const path of pagesToTest) {
        try {
          await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await page.waitForTimeout(2000);
          const name = path === '/' ? 'home' : path.slice(1).replace('/', '-');
          await page.screenshot({ path: `/tmp/qa-page-${name}.png` });
          console.log(`   ✅ ${path}`);
        } catch (e: any) {
          console.log(`   ❌ ${path}: ${e.message}`);
        }
      }
      
      console.log('\n✅ QA Complete!');
    } else {
      console.log('❌ Login failed or still pending');
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: '/tmp/qa-error.png' });
  } finally {
    await browser.close();
  }
}

runQA();
