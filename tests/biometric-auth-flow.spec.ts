import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://wg-growth-app.vercel.app';

test.describe('Biometric Setup - Authenticated User Flow', () => {
  test('Full flow: Login and setup biometrics', async ({ page }) => {
    console.log('\n=== STEP 1: Navigate to Login ===\n');
    await page.goto(`${BASE_URL}/auth/login`);
    await page.waitForLoadState('networkidle');
    console.log('✓ On login page:', page.url());
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/01-login-page.png', fullPage: true });
    
    console.log('\n=== STEP 2: Check Login Form ===\n');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    const hasEmail = await emailInput.isVisible();
    const hasPassword = await passwordInput.isVisible();
    const hasSubmit = await submitButton.isVisible();
    
    console.log('✓ Email input visible:', hasEmail);
    console.log('✓ Password input visible:', hasPassword);
    console.log('✓ Submit button visible:', hasSubmit);
    
    if (!hasEmail || !hasPassword) {
      console.log('\n⚠️  Login form not found. Checking page content...');
      const pageContent = await page.content();
      console.log('Page title:', await page.title());
      await page.screenshot({ path: 'tests/screenshots/login-form-issue.png', fullPage: true });
      return;
    }
    
    console.log('\n=== STEP 3: Attempt Login (will fail without real credentials) ===\n');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('TestPassword123!');
    await page.screenshot({ path: 'tests/screenshots/02-login-filled.png', fullPage: true });
    
    // Click submit
    await submitButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✓ After submit, URL:', page.url());
    await page.screenshot({ path: 'tests/screenshots/03-after-submit.png', fullPage: true });
    
    // Check for errors
    const errorElement = page.locator('[role="alert"]');
    const hasError = await errorElement.count() > 0;
    if (hasError) {
      const errorText = await errorElement.first().textContent();
      console.log('⚠️  Error message:', errorText);
    }
    
    console.log('\n=== STEP 4: Try Direct Navigation to Biometric Setup ===\n');
    await page.goto(`${BASE_URL}/auth/setup-biometric`);
    await page.waitForTimeout(2000);
    console.log('✓ Current URL:', page.url());
    
    if (page.url().includes('/login')) {
      console.log('⚠️  Redirected back to login - authentication required');
      await page.screenshot({ path: 'tests/screenshots/04-needs-auth.png', fullPage: true });
    } else if (page.url().includes('/setup-biometric')) {
      console.log('✅ On biometric setup page!');
      await page.screenshot({ path: 'tests/screenshots/04-biometric-page.png', fullPage: true });
      
      // Check for setup button
      const setupButton = page.locator('button:has-text("Setup Biometric")');
      const buttonVisible = await setupButton.isVisible().catch(() => false);
      console.log('✓ Setup button visible:', buttonVisible);
      
      if (buttonVisible) {
        const isDisabled = await setupButton.isDisabled();
        console.log('✓ Button disabled:', isDisabled);
        
        // Check for any warnings/errors
        const alerts = await page.locator('[role="alert"]').all();
        console.log('✓ Alert count:', alerts.length);
        
        for (const alert of alerts) {
          const text = await alert.textContent();
          console.log('  Alert:', text);
        }
      }
    }
    
    console.log('\n=== STEP 5: Check WebAuthn Configuration from Server ===\n');
    // Try to fetch options (will fail if not authenticated)
    const response = await page.request.post(`${BASE_URL}/api/webauthn/register/options`);
    console.log('✓ API Status:', response.status());
    const body = await response.text();
    console.log('✓ API Response:', body);
    
    console.log('\n=== TEST COMPLETE ===\n');
    console.log('Check screenshots in tests/screenshots/ for visual debugging');
  });

  test('Check WebAuthn browser capabilities', async ({ page, browser }) => {
    console.log('\n=== Browser WebAuthn Capabilities ===\n');
    
    await page.goto(`${BASE_URL}`);
    
    const capabilities = await page.evaluate(async () => {
      const results: any = {
        hasPublicKeyCredential: typeof window.PublicKeyCredential !== 'undefined',
        hasPlatformAuthenticator: false,
        hasConditionalMediation: false,
        userAgent: navigator.userAgent,
        platform: navigator.platform
      };
      
      if (results.hasPublicKeyCredential) {
        try {
          results.hasPlatformAuthenticator = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        } catch (e: any) {
          results.platformAuthenticatorError = e.message;
        }
        
        try {
          results.hasConditionalMediation = await PublicKeyCredential.isConditionalMediationAvailable();
        } catch (e: any) {
          results.conditionalMediationError = e.message;
        }
      }
      
      return results;
    });
    
    console.log('Browser:', browser.browserType().name());
    console.log('User Agent:', capabilities.userAgent);
    console.log('Platform:', capabilities.platform);
    console.log('Has PublicKeyCredential:', capabilities.hasPublicKeyCredential);
    console.log('Has Platform Authenticator:', capabilities.hasPlatformAuthenticator);
    console.log('Has Conditional Mediation:', capabilities.hasConditionalMediation);
    
    if (capabilities.platformAuthenticatorError) {
      console.log('Platform Authenticator Error:', capabilities.platformAuthenticatorError);
    }
    if (capabilities.conditionalMediationError) {
      console.log('Conditional Mediation Error:', capabilities.conditionalMediationError);
    }
    
    if (!capabilities.hasPlatformAuthenticator) {
      console.log('\n⚠️  WARNING: Platform authenticator not available!');
      console.log('This means Touch ID/Face ID/Windows Hello is not detected.');
      console.log('Possible reasons:');
      console.log('  1. Testing in headless browser (no real biometric hardware)');
      console.log('  2. Browser running in virtual machine');
      console.log('  3. Biometric hardware not configured on device');
      console.log('  4. Browser security context issue');
    }
  });
});
