import { test, expect } from '@playwright/test';

// Test against production Vercel deployment
const BASE_URL = process.env.BASE_URL || 'https://wg-growth-app.vercel.app';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123!';

test.describe('Biometric Setup Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        console.log(`[Browser ${type.toUpperCase()}]`, msg.text());
      } else {
        console.log(`[Browser]`, msg.text());
      }
    });

    // Log page errors
    page.on('pageerror', error => {
      console.error('[Page Error]', error.message);
    });

    // Log failed requests
    page.on('requestfailed', request => {
      console.error('[Request Failed]', request.url(), request.failure()?.errorText);
    });
  });

  test('Check WebAuthn Browser Support', async ({ page }) => {
    console.log('\n=== Testing WebAuthn Browser Support ===\n');
    
    await page.goto(`${BASE_URL}/auth/setup-biometric`);
    
    // Check if PublicKeyCredential is available
    const hasWebAuthn = await page.evaluate(() => {
      return typeof window.PublicKeyCredential !== 'undefined';
    });
    
    console.log('✓ WebAuthn supported:', hasWebAuthn);
    expect(hasWebAuthn).toBe(true);
    
    // Check platform authenticator
    const hasPlatformAuthenticator = await page.evaluate(async () => {
      if (window.PublicKeyCredential) {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
      return false;
    });
    
    console.log('✓ Platform authenticator available:', hasPlatformAuthenticator);
  });

  test('Navigate to Biometric Setup Page', async ({ page }) => {
    console.log('\n=== Testing Navigation to Biometric Setup ===\n');
    
    await page.goto(`${BASE_URL}/auth/setup-biometric`);
    
    // Should redirect to login if not authenticated
    await page.waitForURL(/\/auth\/(login|setup-biometric)/);
    const currentUrl = page.url();
    console.log('✓ Current URL:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      console.log('⚠ Not authenticated - redirected to login (expected)');
      expect(currentUrl).toContain('/login');
    } else {
      console.log('✓ Already authenticated - on setup page');
      expect(currentUrl).toContain('/setup-biometric');
    }
  });

  test('Check API Endpoint - Register Options', async ({ page, request }) => {
    console.log('\n=== Testing Register Options API ===\n');
    
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Try to call the API endpoint
    const response = await request.post(`${BASE_URL}/api/webauthn/register/options`, {
      failOnStatusCode: false
    });
    
    console.log('✓ API Response Status:', response.status());
    console.log('✓ API Response Headers:', response.headers());
    
    const responseBody = await response.text();
    console.log('✓ API Response Body:', responseBody.substring(0, 500));
    
    if (response.status() === 401) {
      console.log('✓ Correctly returns 401 when not authenticated');
      expect(response.status()).toBe(401);
    } else {
      console.log('Response:', await response.json().catch(() => responseBody));
    }
  });

  test('Test Biometric Setup UI Elements', async ({ page }) => {
    console.log('\n=== Testing Biometric Setup UI ===\n');
    
    await page.goto(`${BASE_URL}/auth/setup-biometric`);
    await page.waitForLoadState('networkidle');
    
    // Check for main elements
    const hasTitle = await page.locator('text=/Setup Biometric|Biometric/i').isVisible();
    console.log('✓ Has biometric title:', hasTitle);
    
    const hasButton = await page.locator('button:has-text("Setup Biometric")').isVisible()
      .catch(() => false);
    console.log('✓ Has setup button:', hasButton);
    
    // Check for any error messages
    const errorAlert = await page.locator('[role="alert"]').count();
    if (errorAlert > 0) {
      const errorText = await page.locator('[role="alert"]').first().textContent();
      console.log('⚠ Error alert found:', errorText);
    } else {
      console.log('✓ No error alerts on page load');
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'tests/screenshots/biometric-setup.png', fullPage: true });
    console.log('✓ Screenshot saved to tests/screenshots/biometric-setup.png');
  });

  test('Test Network Requests to WebAuthn API', async ({ page }) => {
    console.log('\n=== Testing WebAuthn API Network Calls ===\n');
    
    const requests: any[] = [];
    const responses: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/webauthn/')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
        console.log('→ Request:', request.method(), request.url());
      }
    });
    
    page.on('response', async response => {
      if (response.url().includes('/webauthn/')) {
        const body = await response.text().catch(() => 'Unable to read body');
        responses.push({
          url: response.url(),
          status: response.status(),
          body: body.substring(0, 500)
        });
        console.log('← Response:', response.status(), response.url());
        console.log('  Body:', body.substring(0, 200));
      }
    });
    
    await page.goto(`${BASE_URL}/auth/setup-biometric`);
    await page.waitForTimeout(2000);
    
    console.log('\n✓ Total WebAuthn requests:', requests.length);
    console.log('✓ Total WebAuthn responses:', responses.length);
    
    // Log all captured data
    if (responses.length > 0) {
      console.log('\n=== Response Details ===');
      responses.forEach((res, i) => {
        console.log(`\nResponse ${i + 1}:`);
        console.log('  Status:', res.status);
        console.log('  URL:', res.url);
        console.log('  Body:', res.body);
      });
    }
  });

  test('Test WebAuthn Configuration Detection', async ({ page }) => {
    console.log('\n=== Testing WebAuthn Configuration ===\n');
    
    await page.goto(`${BASE_URL}/auth/setup-biometric`);
    
    // Check what configuration the page is using
    const pageInfo = await page.evaluate(() => {
      return {
        hostname: window.location.hostname,
        origin: window.location.origin,
        protocol: window.location.protocol,
        href: window.location.href
      };
    });
    
    console.log('✓ Page hostname:', pageInfo.hostname);
    console.log('✓ Page origin:', pageInfo.origin);
    console.log('✓ Page protocol:', pageInfo.protocol);
    console.log('✓ Page full URL:', pageInfo.href);
    
    // Check if HTTPS
    if (pageInfo.protocol !== 'https:' && pageInfo.hostname !== 'localhost') {
      console.log('⚠ WARNING: Not using HTTPS! WebAuthn requires HTTPS or localhost');
    } else {
      console.log('✓ Using secure connection (HTTPS or localhost)');
    }
  });

  test('Simulate Biometric Setup Click', async ({ page }) => {
    console.log('\n=== Testing Biometric Setup Button Click ===\n');
    
    await page.goto(`${BASE_URL}/auth/setup-biometric`);
    await page.waitForLoadState('networkidle');
    
    // Find and click the setup button
    const setupButton = page.locator('button:has-text("Setup Biometric")');
    const isVisible = await setupButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      console.log('⚠ Setup button not found or not visible');
      // List all buttons on page
      const allButtons = await page.locator('button').all();
      console.log(`Found ${allButtons.length} buttons on page`);
      for (const btn of allButtons) {
        const text = await btn.textContent();
        console.log('  -', text);
      }
      return;
    }
    
    console.log('✓ Setup button found');
    
    const isDisabled = await setupButton.isDisabled();
    console.log('✓ Button disabled:', isDisabled);
    
    if (!isDisabled) {
      console.log('✓ Clicking setup button...');
      
      // Wait for API call
      const apiPromise = page.waitForResponse(
        response => response.url().includes('/webauthn/register/options'),
        { timeout: 5000 }
      ).catch(() => null);
      
      await setupButton.click();
      
      const apiResponse = await apiPromise;
      if (apiResponse) {
        console.log('✓ API called:', apiResponse.status());
        const body = await apiResponse.text();
        console.log('✓ API response:', body.substring(0, 500));
        
        if (apiResponse.status() !== 200) {
          console.log('⚠ API returned non-200 status');
        }
      } else {
        console.log('⚠ No API call detected within timeout');
      }
      
      // Wait a bit for any errors to show
      await page.waitForTimeout(2000);
      
      // Check for error messages
      const errorAlert = page.locator('[role="alert"]');
      const hasError = await errorAlert.count() > 0;
      
      if (hasError) {
        const errorText = await errorAlert.first().textContent();
        console.log('⚠ Error displayed:', errorText);
      } else {
        console.log('✓ No errors displayed');
      }
      
      // Take screenshot of result
      await page.screenshot({ 
        path: 'tests/screenshots/biometric-after-click.png', 
        fullPage: true 
      });
      console.log('✓ Screenshot saved after click');
    }
  });
});
