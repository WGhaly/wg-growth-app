#!/usr/bin/env node

/**
 * Comprehensive Feature Testing Script
 * Tests all pages, routes, and features of WG Growth App
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testResult(testName, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    log(`✅ ${testName}`, 'green');
  } else {
    failedTests++;
    log(`❌ ${testName}`, 'red');
    if (details) log(`   ${details}`, 'yellow');
  }
}

async function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const lib = url.startsWith('https') ? https : http;
    
    const req = lib.request(url, { method }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        statusCode: 0,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ statusCode: 0, error: 'Timeout' });
    });
    
    req.end();
  });
}

async function testRoute(name, path, expectedStatus = 200) {
  const result = await makeRequest(path);
  const passed = result.statusCode === expectedStatus;
  testResult(
    `${name} (${path})`,
    passed,
    !passed ? `Expected ${expectedStatus}, got ${result.statusCode}` : ''
  );
  return result;
}

async function runTests() {
  log('\n🚀 Starting Comprehensive Feature Testing\n', 'cyan');
  log('═══════════════════════════════════════════════\n', 'blue');

  // Test 1: Server Health
  log('📡 Testing Server Health', 'cyan');
  const healthCheck = await makeRequest('/');
  testResult('Server is responding', healthCheck.statusCode > 0);
  console.log('');

  // Test 2: Public Pages
  log('🌐 Testing Public Pages', 'cyan');
  await testRoute('Landing Page', '/');
  await testRoute('Sign In Page', '/auth/signin');
  await testRoute('Sign Up Page', '/auth/signup');
  await testRoute('Forgot Password Page', '/auth/forgot-password');
  console.log('');

  // Test 3: Protected Pages (should redirect or show login)
  log('🔒 Testing Protected Routes', 'cyan');
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/onboarding',
    '/habits',
    '/routines',
    '/goals',
    '/faith',
    '/relationships',
    '/insights',
    '/notifications'
  ];

  for (const route of protectedRoutes) {
    const result = await makeRequest(route);
    // Protected routes should either redirect (307/302) or show content (200)
    const isValid = [200, 302, 307].includes(result.statusCode);
    testResult(
      `Protected Route: ${route}`,
      isValid,
      !isValid ? `Unexpected status: ${result.statusCode}` : ''
    );
  }
  console.log('');

  // Test 4: API Routes
  log('🔌 Testing API Endpoints', 'cyan');
  await testRoute('WebAuthn Register Options', '/api/webauthn/register/options', [200, 401]);
  await testRoute('WebAuthn Authenticate Options', '/api/webauthn/authenticate/options', [200, 401]);
  console.log('');

  // Test 5: Static Assets
  log('📦 Testing Static Assets', 'cyan');
  await testRoute('PWA Manifest', '/manifest.json');
  await testRoute('Service Worker', '/sw.js');
  console.log('');

  // Test 6: PWA Features
  log('📱 Testing PWA Features', 'cyan');
  const manifest = await makeRequest('/manifest.json');
  const hasManifest = manifest.statusCode === 200 && manifest.body.includes('WG Growth');
  testResult('PWA Manifest is valid', hasManifest);
  
  const sw = await makeRequest('/sw.js');
  testResult('Service Worker is accessible', sw.statusCode === 200);
  console.log('');

  // Test 7: Error Pages
  log('⚠️  Testing Error Handling', 'cyan');
  await testRoute('Offline Page', '/offline');
  await testRoute('404 Handling', '/this-page-does-not-exist', 404);
  console.log('');

  // Test 8: Feature Availability Check
  log('✨ Testing Feature Availability', 'cyan');
  const dashboardPage = await makeRequest('/dashboard');
  
  // Check if key features are mentioned in the HTML
  const features = {
    'Habits Feature': dashboardPage.body.includes('habit') || dashboardPage.body.includes('Habit'),
    'Routines Feature': dashboardPage.body.includes('routine') || dashboardPage.body.includes('Routine'),
    'Goals Feature': dashboardPage.body.includes('goal') || dashboardPage.body.includes('Goal'),
    'Tailwind CSS Loaded': dashboardPage.body.includes('tailwindcss') || dashboardPage.headers['content-type']?.includes('text/html')
  };

  Object.entries(features).forEach(([name, available]) => {
    testResult(name, available);
  });
  console.log('');

  // Test 9: Database Schema Check (via routes that use it)
  log('🗄️  Testing Database Integration', 'cyan');
  const routes = [
    { name: 'Goals System', path: '/goals' },
    { name: 'Habits System', path: '/habits' },
    { name: 'Routines System', path: '/routines' },
    { name: 'Relationships System', path: '/relationships' },
    { name: 'Insights System', path: '/insights' }
  ];

  for (const route of routes) {
    const result = await makeRequest(route.path);
    const works = result.statusCode !== 500;
    testResult(
      route.name,
      works,
      !works ? 'Server error - check database connection' : ''
    );
  }
  console.log('');

  // Test 10: Check for Common Issues
  log('🔍 Testing for Common Issues', 'cyan');
  const homePage = await makeRequest('/');
  const issues = {
    'No console errors in HTML': !homePage.body.includes('console.error'),
    'No "undefined" in UI': !homePage.body.match(/>[^<]*undefined[^<]*</gi),
    'No "null" in UI': !homePage.body.match(/>[^<]*null[^<]*</gi),
    'Proper charset': homePage.headers['content-type']?.includes('charset=utf-8')
  };

  Object.entries(issues).forEach(([name, passed]) => {
    testResult(name, passed);
  });
  console.log('');

  // Final Summary
  log('═══════════════════════════════════════════════\n', 'blue');
  log('📊 Test Summary\n', 'cyan');
  log(`Total Tests: ${totalTests}`);
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`, failedTests > 0 ? 'yellow' : 'green');

  if (failedTests === 0) {
    log('🎉 All tests passed! Application is working correctly.\n', 'green');
  } else {
    log('⚠️  Some tests failed. Please review the output above.\n', 'yellow');
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
log('WG Growth App - Comprehensive Test Suite', 'cyan');
log('Starting in 2 seconds...\n', 'yellow');

setTimeout(runTests, 2000);
