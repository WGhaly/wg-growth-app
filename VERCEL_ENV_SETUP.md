# Vercel Environment Variables Setup

## Required Environment Variables for Biometric Authentication

Go to your Vercel project settings and add these environment variables:

### 1. WebAuthn Configuration (Critical for Biometrics)

```bash
WEBAUTHN_RP_NAME=WG Life OS
WEBAUTHN_RP_ID=wg-growth-app.vercel.app
WEBAUTHN_ORIGIN=https://wg-growth-app.vercel.app
```

**Important**: 
- Remove any trailing spaces!
- RP_ID should be the domain WITHOUT https:// or trailing /
- ORIGIN should be the FULL URL with https://

### 2. NextAuth URL (Should already be set)

```bash
NEXTAUTH_URL=https://wg-growth-app.vercel.app
```

### 3. Database URL (Should already be set)

```bash
DATABASE_URL=your-postgres-connection-string
```

## How to Add in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project: **wg-growth-app**
3. Go to: **Settings** → **Environment Variables**
4. Add each variable with these settings:
   - **Environment**: Production, Preview, Development (select all)
   - **Value**: Copy exactly as shown above (no quotes needed in Vercel UI)

## After Adding Variables

1. **Redeploy**: Go to Deployments → Latest → Click "..." → Redeploy
2. **Or**: Push a new commit to trigger automatic deployment

## Verification

After deployment, check the logs:
```bash
vercel logs wg-growth-app --follow
```

Look for these lines:
```
[WebAuthn] Configuration loaded: { 
  RP_NAME: 'WG Life OS', 
  RP_ID: 'wg-growth-app.vercel.app', 
  ORIGIN: 'https://wg-growth-app.vercel.app' 
}
```

## Testing After Setup

1. Visit: https://wg-growth-app.vercel.app/auth/setup-biometric
2. Open browser console (F12)
3. Click "Setup Biometric Authentication"
4. Should see Face ID/Touch ID prompt
5. Should NOT see "Security error" anymore

## Troubleshooting

### Still seeing "Security error"?

Check these:
1. ✅ Variables are set in Vercel (no typos)
2. ✅ Variables are set for "Production" environment
3. ✅ You redeployed after adding variables
4. ✅ No trailing spaces in WEBAUTHN_RP_ID
5. ✅ HTTPS is being used (check browser URL bar)

### Check Vercel logs for WebAuthn config:
```bash
vercel logs wg-growth-app | grep WebAuthn
```

Should show the configuration being loaded.

## Quick Fix Command

If you have Vercel CLI installed:
```bash
vercel env add WEBAUTHN_RP_NAME production
# Enter: WG Life OS

vercel env add WEBAUTHN_RP_ID production
# Enter: wg-growth-app.vercel.app

vercel env add WEBAUTHN_ORIGIN production
# Enter: https://wg-growth-app.vercel.app
```

Then redeploy:
```bash
vercel --prod
```
