#!/usr/bin/env node

/**
 * VAPID Keys Generator
 * 
 * This script generates VAPID keys for Web Push notifications.
 * Run this script to generate keys and add them to your .env.local file.
 * 
 * Usage:
 *   node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

console.log('\n🔐 Generating VAPID Keys for Push Notifications...\n');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys Generated Successfully!\n');
console.log('================================================');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key:');
console.log(vapidKeys.privateKey);
console.log('================================================\n');

// Prepare .env content
const envContent = `
# VAPID Keys for Push Notifications
# Generated on ${new Date().toISOString()}
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_SUBJECT=mailto:your-email@example.com
`;

const envPath = path.join(process.cwd(), '.env.local');

// Check if .env.local exists
if (fs.existsSync(envPath)) {
  console.log('📝 .env.local file exists. Please add these keys manually:\n');
  console.log(envContent);
  console.log('\n⚠️  Make sure to replace "mailto:your-email@example.com" with your actual email.\n');
} else {
  // Create .env.local with VAPID keys
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local with VAPID keys!\n');
    console.log('⚠️  Make sure to replace "mailto:your-email@example.com" with your actual email.\n');
  } catch (error) {
    console.error('❌ Error creating .env.local:', error);
    console.log('\nPlease create .env.local manually and add the keys above.\n');
  }
}

console.log('📋 Next Steps:\n');
console.log('1. Update VAPID_SUBJECT in .env.local with your email');
console.log('2. Add these keys to your Vercel environment variables:');
console.log('   - NEXT_PUBLIC_VAPID_PUBLIC_KEY');
console.log('   - VAPID_PRIVATE_KEY');
console.log('   - VAPID_SUBJECT');
console.log('3. Restart your development server');
console.log('4. Test push notifications in your app\n');

console.log('🔒 Security Note:');
console.log('   - NEVER commit .env.local to version control');
console.log('   - Keep your private key secure');
console.log('   - The public key can be safely exposed to clients\n');
