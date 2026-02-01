# Server-Side Error Logging Setup

## ✅ Error Logging System Implemented

I've added a comprehensive server-side error logging system so you can see what's happening when you test biometric setup on your phone.

## What Was Added

### 1. Client Error Logging API (`/api/logs/client-errors`)

**POST** - Log errors from client
- Captures error details, user info, user agent, URL
- Logs to Vercel console for easy viewing
- Stores last 100 errors in memory

**GET** - View logged errors
- Returns recent errors in JSON format
- Requires authentication

### 2. Enhanced Error Reporting in `useWebAuthn` Hook

- Automatically sends all WebAuthn errors to server
- Includes error name, message, stack trace
- Logs both registration and authentication errors
- Non-blocking (won't break the app if logging fails)

### 3. Error Logs Viewer Page (`/debug/error-logs`)

- Visual interface to view all logged errors
- Shows timestamp, user, context, error details
- Expandable stack traces
- Refresh button to get latest errors
- Auto-loads on page visit

### 4. Enhanced Server Logging

Added detailed logging in WebAuthn API routes:
- Environment configuration
- Request details
- Step-by-step processing
- Success/failure states

## How to Use

### On Your Phone:

1. **Open the app**: `https://wg-growth-app.vercel.app`
2. **Login** with your credentials
3. **Navigate to**: `/auth/setup-biometric`
4. **Try to setup** biometric authentication
5. **If it fails**, the error is automatically logged to the server

### To View Errors:

#### Option 1: Debug Page (Easiest)
Visit: `https://wg-growth-app.vercel.app/debug/error-logs`
- See all errors in a nice UI
- Filter by time, user, context
- View full error details and stack traces

#### Option 2: Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click on latest deployment
4. Click "View Function Logs"
5. Look for lines starting with `[CLIENT ERROR]`

#### Option 3: Vercel CLI
```bash
vercel logs wg-growth-app --follow
```

Look for:
```
[CLIENT ERROR] {
  "timestamp": "2026-02-01T...",
  "context": "WebAuthn Registration",
  "error": {
    "name": "SecurityError",
    "message": "..."
  },
  "userAgent": "...",
  "url": "..."
}
```

## What Gets Logged

When an error occurs, you'll see:

```json
{
  "timestamp": "2026-02-01T18:30:00.000Z",
  "userId": "user-id",
  "userEmail": "your@email.com",
  "context": "WebAuthn Registration",
  "error": {
    "name": "SecurityError",
    "message": "The operation is insecure",
    "stack": "Error: ...\n  at ..."
  },
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0...)",
  "url": "https://wg-growth-app.vercel.app/auth/setup-biometric"
}
```

## Common Errors You Might See

### `SecurityError`
- **Cause**: HTTPS/Origin mismatch, insecure context
- **Fix**: Check RP_ID matches domain exactly

### `NotAllowedError`
- **Cause**: User cancelled, permission denied
- **Fix**: User needs to allow biometric access

### `InvalidStateError`
- **Cause**: Authenticator already registered
- **Fix**: User already has biometric set up

### `NotSupportedError`
- **Cause**: Browser/device doesn't support WebAuthn
- **Fix**: Use different browser or device

### `AbortError`
- **Cause**: Operation timed out or cancelled
- **Fix**: Try again with faster response

## Testing Flow

1. **Deploy these changes** (already committed)
2. **Wait for Vercel deployment** (~1 minute)
3. **Test on your phone**:
   - Open Safari on iPhone
   - Go to the app
   - Login
   - Try biometric setup
4. **Check logs immediately**:
   - Visit `/debug/error-logs` on any device
   - Or check Vercel dashboard
5. **Share the error details** so we can fix the exact issue

## Files Modified

- ✅ `app/api/logs/client-errors/route.ts` - Error logging API
- ✅ `app/debug/error-logs/page.tsx` - Error viewer page
- ✅ `hooks/useWebAuthn.ts` - Auto error reporting
- ✅ `app/api/webauthn/register/options/route.ts` - Enhanced logging
- ✅ `app/api/webauthn/register/verify/route.ts` - Enhanced logging

## Next Steps

1. **Commit and push** these changes
2. **Test on your phone**
3. **Check the logs** at `/debug/error-logs` or Vercel dashboard
4. **Share the error message** you see, and we can fix the exact issue!

---

**Pro Tip**: Keep the `/debug/error-logs` page open on your computer while testing on your phone - errors will show up there within seconds!
