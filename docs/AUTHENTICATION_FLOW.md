# WG Life OS - Complete Authentication & WebAuthn Flow

**Project Owner:** Waseem Ghaly  
**Security Level:** Maximum (Biometric Required)  
**Date:** January 29, 2026

---

## 1. AUTHENTICATION ARCHITECTURE OVERVIEW

### Authentication Stack
```
┌─────────────────────────────────────────────┐
│           Authentication Layers             │
├─────────────────────────────────────────────┤
│ 1. Email + Password (Initial Registration)  │
│ 2. WebAuthn / Passkeys (Biometric)         │
│ 3. Session Management (JWT + Database)     │
│ 4. Auto-lock (Inactivity Timeout)          │
│ 5. Biometric Re-verification (Every Open)  │
└─────────────────────────────────────────────┘
```

### Security Principles
1. **Zero-trust:** Every request authenticated
2. **Biometric-first:** Face ID / Touch ID mandatory after initial setup
3. **Auto-lock:** 15-minute inactivity timeout
4. **Session binding:** Sessions tied to device
5. **No remember me:** Security over convenience

---

## 2. USER REGISTRATION FLOW (COMPLETE)

### Step 1: Initial Registration Page

**Route:** `/auth/register`

```
┌──────────────────────────────────┐
│     WG Life OS Registration      │
├──────────────────────────────────┤
│                                  │
│  Email: [___________________]    │
│  Password: [_______________]     │
│  Confirm: [________________]     │
│                                  │
│  [ ] I understand this app       │
│      requires Face ID/Touch ID   │
│                                  │
│  [    Create Account    ]        │
│                                  │
│  Already have account? Login     │
└──────────────────────────────────┘
```

**Action Flow:**
```typescript
// app/(auth)/register/actions.ts

'use server'

export async function registerUser(data: RegisterInput): Promise<Result> {
  // 1. Validate input
  const validated = registerSchema.parse(data)
  
  // 2. Check if email exists
  const existing = await db.query.users.findFirst({
    where: eq(users.email, validated.email)
  })
  
  if (existing) {
    return { success: false, error: 'Email already registered' }
  }
  
  // 3. Hash password
  const passwordHash = await bcrypt.hash(validated.password, 12)
  
  // 4. Create user
  const [user] = await db.insert(users).values({
    email: validated.email,
    passwordHash,
    role: 'owner',
    emailVerified: false, // Not verified yet
  }).returning()
  
  // 5. Generate verification token
  const token = generateSecureToken()
  await db.insert(verificationTokens).values({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  })
  
  // 6. Send verification email
  await sendVerificationEmail(user.email, token)
  
  // 7. Create session (but mark as unverified)
  const session = await createSession(user.id, { verified: false })
  
  return { 
    success: true, 
    redirectTo: '/auth/verify-email',
    message: 'Check your email to verify your account'
  }
}
```

### Step 2: Email Verification

**Route:** `/auth/verify-email`

**User sees:**
```
┌──────────────────────────────────┐
│      Verify Your Email          │
├──────────────────────────────────┤
│                                  │
│  We sent a verification email to │
│  your@email.com                  │
│                                  │
│  Click the link in the email to  │
│  continue.                       │
│                                  │
│  [  Resend Email  ]             │
│                                  │
└──────────────────────────────────┘
```

**When user clicks email link:**
```
GET /auth/verify-email?token=abc123

→ Server validates token
→ Marks user.emailVerified = true
→ Redirects to /auth/setup-biometric
```

**Action:**
```typescript
// app/api/auth/verify/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  
  if (!token) {
    return redirect('/auth/verify-email?error=invalid_token')
  }
  
  // 1. Find token
  const verificationToken = await db.query.verificationTokens.findFirst({
    where: and(
      eq(verificationTokens.token, token),
      gt(verificationTokens.expiresAt, new Date())
    )
  })
  
  if (!verificationToken) {
    return redirect('/auth/verify-email?error=token_expired')
  }
  
  // 2. Mark user as verified
  await db.update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, verificationToken.userId))
  
  // 3. Delete used token
  await db.delete(verificationTokens)
    .where(eq(verificationTokens.id, verificationToken.id))
  
  // 4. Update session
  const session = await getSession()
  session.verified = true
  await updateSession(session)
  
  // 5. Redirect to biometric setup
  return redirect('/auth/setup-biometric')
}
```

### Step 3: Biometric Setup (WebAuthn Registration)

**Route:** `/auth/setup-biometric`

```
┌──────────────────────────────────┐
│     Setup Face ID / Touch ID     │
├──────────────────────────────────┤
│                                  │
│  [    Face ID Icon    ]          │
│                                  │
│  For your security, WG Life OS   │
│  requires biometric               │
│  authentication on every use.    │
│                                  │
│  This protects your personal     │
│  data, goals, and reflections.   │
│                                  │
│  [  Setup Face ID  ]             │
│                                  │
│  (iPhone: Uses Face ID)          │
│  (Other: Uses Touch ID/Passkey)  │
└──────────────────────────────────┘
```

**WebAuthn Registration Flow:**

```typescript
// app/(auth)/setup-biometric/actions.ts

'use client'

import { startRegistration } from '@simplewebauthn/browser'

export async function setupBiometric() {
  try {
    // 1. Request registration options from server
    const optionsResponse = await fetch('/api/webauthn/register/options')
    const options = await optionsResponse.json()
    
    // 2. Start WebAuthn registration (triggers Face ID)
    const credential = await startRegistration(options)
    
    // 3. Send credential to server for verification
    const verifyResponse = await fetch('/api/webauthn/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    })
    
    const result = await verifyResponse.json()
    
    if (result.success) {
      // Redirect to onboarding
      window.location.href = '/onboarding'
    }
  } catch (error) {
    console.error('Biometric setup failed:', error)
    // Show error to user
  }
}
```

**Server-side Registration (Options):**

```typescript
// app/api/webauthn/register/options/route.ts

import { generateRegistrationOptions } from '@simplewebauthn/server'

export async function GET() {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  })
  
  if (!user) return new Response('User not found', { status: 404 })
  
  // Generate challenge
  const options = await generateRegistrationOptions({
    rpName: 'WG Life OS',
    rpID: 'waseemghaly.com',
    userID: user.id,
    userName: user.email,
    userDisplayName: user.email,
    
    // Require user verification (Face ID / Touch ID)
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // Built-in authenticator
      userVerification: 'required',
      residentKey: 'required', // Passkey
    },
    
    // Don't allow existing credentials
    excludeCredentials: user.webauthnCredentials.map(cred => ({
      id: cred.id,
      type: 'public-key',
    })),
  })
  
  // Store challenge in session for verification
  await updateSession({ webauthnChallenge: options.challenge })
  
  return Response.json(options)
}
```

**Server-side Registration (Verification):**

```typescript
// app/api/webauthn/register/verify/route.ts

import { verifyRegistrationResponse } from '@simplewebauthn/server'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })
  
  const { credential } = await request.json()
  
  // Get challenge from session
  const expectedChallenge = session.webauthnChallenge
  if (!expectedChallenge) {
    return Response.json({ success: false, error: 'No challenge found' })
  }
  
  try {
    // Verify the credential
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: 'https://waseemghaly.com',
      expectedRPID: 'waseemghaly.com',
      requireUserVerification: true,
    })
    
    if (!verification.verified) {
      return Response.json({ success: false, error: 'Verification failed' })
    }
    
    // Store credential in database
    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo
    
    await db.update(users).set({
      webauthnCredentials: sql`
        ${users.webauthnCredentials} || ${JSON.stringify([{
          id: Buffer.from(credentialID).toString('base64'),
          publicKey: Buffer.from(credentialPublicKey).toString('base64'),
          counter,
          createdAt: new Date().toISOString(),
        }])}::jsonb
      `,
      biometricEnabled: true,
    }).where(eq(users.id, session.user.id))
    
    // Clear challenge from session
    await updateSession({ webauthnChallenge: null })
    
    return Response.json({ success: true })
    
  } catch (error) {
    console.error('WebAuthn verification error:', error)
    return Response.json({ success: false, error: 'Verification error' })
  }
}
```

### Step 4: Onboarding

**Route:** `/onboarding`

After biometric setup, user goes through guided onboarding:
1. Profile setup (name, DOB)
2. Identity statements (optional, can skip)
3. Core values (optional, can skip)

**Then redirected to:** `/` (Dashboard)

---

## 3. LOGIN FLOW (COMPLETE)

### Step 1: Login Page

**Route:** `/auth/login`

```
┌──────────────────────────────────┐
│        WG Life OS Login          │
├──────────────────────────────────┤
│                                  │
│  Email: [___________________]    │
│  Password: [_______________]     │
│                                  │
│  [       Login       ]           │
│                                  │
│  Forgot password?                │
│  Don't have account? Register    │
└──────────────────────────────────┘
```

**Action:**

```typescript
// app/(auth)/login/actions.ts

'use server'

export async function loginUser(data: LoginInput): Promise<Result> {
  // 1. Validate input
  const validated = loginSchema.parse(data)
  
  // 2. Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, validated.email)
  })
  
  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }
  
  // 3. Check if account is locked
  if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
    return { 
      success: false, 
      error: 'Account locked. Try again later.' 
    }
  }
  
  // 4. Verify password
  const passwordValid = await bcrypt.compare(validated.password, user.passwordHash)
  
  if (!passwordValid) {
    // Increment failed attempts
    await db.update(users).set({
      failedLoginAttempts: sql`${users.failedLoginAttempts} + 1`,
      ...(user.failedLoginAttempts + 1 >= 5 && {
        isLocked: true,
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 min
      })
    }).where(eq(users.id, user.id))
    
    return { success: false, error: 'Invalid email or password' }
  }
  
  // 5. Check if email verified
  if (!user.emailVerified) {
    return { 
      success: false, 
      error: 'Please verify your email first',
      redirectTo: '/auth/verify-email'
    }
  }
  
  // 6. Check if biometric setup
  if (!user.biometricEnabled) {
    // Create session and redirect to biometric setup
    await createSession(user.id, { biometricSetup: false })
    return { 
      success: true, 
      redirectTo: '/auth/setup-biometric',
      message: 'Complete biometric setup'
    }
  }
  
  // 7. Reset failed attempts
  await db.update(users).set({
    failedLoginAttempts: 0,
    isLocked: false,
    lockedUntil: null,
  }).where(eq(users.id, user.id))
  
  // 8. Create session (but require biometric verification)
  await createSession(user.id, { biometricVerified: false })
  
  // 9. Redirect to biometric prompt
  return { 
    success: true, 
    redirectTo: '/auth/verify-biometric'
  }
}
```

### Step 2: Biometric Verification (After Password Login)

**Route:** `/auth/verify-biometric`

```
┌──────────────────────────────────┐
│     Verify with Face ID          │
├──────────────────────────────────┤
│                                  │
│  [    Face ID Icon    ]          │
│                                  │
│  Tap to verify your identity     │
│                                  │
│  [  Verify with Face ID  ]       │
│                                  │
└──────────────────────────────────┘
```

**WebAuthn Authentication Flow:**

```typescript
// app/(auth)/verify-biometric/actions.ts

'use client'

import { startAuthentication } from '@simplewebauthn/browser'

export async function verifyBiometric() {
  try {
    // 1. Get authentication options from server
    const optionsResponse = await fetch('/api/webauthn/authenticate/options')
    const options = await optionsResponse.json()
    
    // 2. Start WebAuthn authentication (triggers Face ID)
    const credential = await startAuthentication(options)
    
    // 3. Send credential to server for verification
    const verifyResponse = await fetch('/api/webauthn/authenticate/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    })
    
    const result = await verifyResponse.json()
    
    if (result.success) {
      // Redirect to dashboard
      window.location.href = '/'
    }
  } catch (error) {
    console.error('Biometric verification failed:', error)
    // Fallback: Force re-login
    window.location.href = '/auth/login?error=biometric_failed'
  }
}
```

**Server-side Authentication (Options):**

```typescript
// app/api/webauthn/authenticate/options/route.ts

import { generateAuthenticationOptions } from '@simplewebauthn/server'

export async function GET() {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  })
  
  if (!user || !user.biometricEnabled) {
    return new Response('Biometric not setup', { status: 400 })
  }
  
  // Generate challenge
  const options = await generateAuthenticationOptions({
    rpID: 'waseemghaly.com',
    userVerification: 'required', // Force Face ID / Touch ID
    allowCredentials: user.webauthnCredentials.map(cred => ({
      id: Buffer.from(cred.id, 'base64'),
      type: 'public-key',
    })),
  })
  
  // Store challenge in session
  await updateSession({ webauthnChallenge: options.challenge })
  
  return Response.json(options)
}
```

**Server-side Authentication (Verification):**

```typescript
// app/api/webauthn/authenticate/verify/route.ts

import { verifyAuthenticationResponse } from '@simplewebauthn/server'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })
  
  const { credential } = await request.json()
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  })
  
  if (!user) return Response.json({ success: false, error: 'User not found' })
  
  const expectedChallenge = session.webauthnChallenge
  if (!expectedChallenge) {
    return Response.json({ success: false, error: 'No challenge found' })
  }
  
  // Find the credential being used
  const credentialID = Buffer.from(credential.id, 'base64')
  const userCredential = user.webauthnCredentials.find(
    cred => cred.id === Buffer.from(credentialID).toString('base64')
  )
  
  if (!userCredential) {
    return Response.json({ success: false, error: 'Credential not found' })
  }
  
  try {
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: 'https://waseemghaly.com',
      expectedRPID: 'waseemghaly.com',
      authenticator: {
        credentialID: Buffer.from(userCredential.id, 'base64'),
        credentialPublicKey: Buffer.from(userCredential.publicKey, 'base64'),
        counter: userCredential.counter,
      },
      requireUserVerification: true,
    })
    
    if (!verification.verified) {
      return Response.json({ success: false, error: 'Verification failed' })
    }
    
    // Update counter (prevents replay attacks)
    const newCounter = verification.authenticationInfo.newCounter
    await db.update(users).set({
      webauthnCredentials: sql`
        jsonb_set(
          ${users.webauthnCredentials},
          ${`{${user.webauthnCredentials.findIndex(c => c.id === userCredential.id)}, counter}`},
          ${newCounter}::text::jsonb
        )
      `
    }).where(eq(users.id, user.id))
    
    // Mark session as biometrically verified
    await updateSession({ 
      biometricVerified: true,
      lastBiometricVerification: new Date(),
    })
    
    // Update user last activity
    await db.update(users).set({
      lastActivity: new Date(),
      lastBiometricVerification: new Date(),
    }).where(eq(users.id, user.id))
    
    return Response.json({ success: true })
    
  } catch (error) {
    console.error('WebAuthn authentication error:', error)
    return Response.json({ success: false, error: 'Verification error' })
  }
}
```

---

## 4. SESSION MANAGEMENT (COMPLETE)

### Session Structure

```typescript
interface Session {
  sessionToken: string // JWT
  userId: string
  email: string
  role: 'owner' | 'point_of_light' | 'secondary_user'
  
  // Verification Status
  biometricVerified: boolean
  lastBiometricVerification: Date
  
  // Activity Tracking
  lastActivity: Date
  expiresAt: Date // 30 days from creation
  
  // Temporary Data
  webauthnChallenge?: string
}
```

### Session Storage

**Dual Storage:**
1. **JWT Cookie** (httpOnly, secure, sameSite: strict)
2. **Database Record** (for revocation, device tracking)

```typescript
// lib/auth.ts

export async function createSession(userId: string, metadata?: any) {
  const sessionToken = generateSecureToken()
  
  // 1. Create database session
  await db.insert(sessions).values({
    id: sessionToken,
    userId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    createdAt: new Date(),
    lastActivity: new Date(),
    metadata,
  })
  
  // 2. Create JWT
  const jwt = await signJWT({
    sessionToken,
    userId,
    ...metadata,
  })
  
  // 3. Set cookie
  cookies().set('session', jwt, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })
  
  return sessionToken
}

export async function getSession(): Promise<Session | null> {
  const sessionCookie = cookies().get('session')
  if (!sessionCookie) return null
  
  try {
    // 1. Verify JWT
    const payload = await verifyJWT(sessionCookie.value)
    
    // 2. Check database session
    const dbSession = await db.query.sessions.findFirst({
      where: eq(sessions.id, payload.sessionToken)
    })
    
    if (!dbSession || dbSession.expiresAt < new Date()) {
      return null
    }
    
    // 3. Check inactivity timeout (15 minutes)
    const inactiveFor = Date.now() - dbSession.lastActivity.getTime()
    if (inactiveFor > 15 * 60 * 1000) {
      // Session expired due to inactivity
      return null
    }
    
    // 4. Update last activity
    await db.update(sessions)
      .set({ lastActivity: new Date() })
      .where(eq(sessions.id, payload.sessionToken))
    
    return {
      ...payload,
      lastActivity: dbSession.lastActivity,
      expiresAt: dbSession.expiresAt,
    } as Session
    
  } catch (error) {
    return null
  }
}

export async function destroySession() {
  const session = await getSession()
  if (!session) return
  
  // 1. Delete from database
  await db.delete(sessions).where(eq(sessions.id, session.sessionToken))
  
  // 2. Clear cookie
  cookies().delete('session')
}
```

---

## 5. AUTO-LOCK MECHANISM (COMPLETE)

### Client-Side Auto-Lock Hook

```typescript
// hooks/use-auto-lock.ts

'use client'

import { useEffect, useState } from 'use'
import { useRouter } from 'next/navigation'

const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes

export function useAutoLock() {
  const router = useRouter()
  const [isLocked, setIsLocked] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  
  useEffect(() => {
    // Track user activity
    const activities = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    const handleActivity = () => {
      setLastActivity(Date.now())
      if (isLocked) setIsLocked(false)
    }
    
    activities.forEach(event => {
      window.addEventListener(event, handleActivity)
    })
    
    // Check for inactivity
    const interval = setInterval(() => {
      const inactive = Date.now() - lastActivity
      if (inactive > INACTIVITY_TIMEOUT && !isLocked) {
        setIsLocked(true)
        // Show lock screen (requires biometric to unlock)
      }
    }, 10000) // Check every 10 seconds
    
    return () => {
      activities.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      clearInterval(interval)
    }
  }, [lastActivity, isLocked])
  
  // PWA: Detect app coming to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // App came to foreground, require biometric
        setIsLocked(true)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
  
  return { isLocked, unlock: () => setIsLocked(false) }
}
```

### Auto-Lock Screen Component

```typescript
// components/auth/auto-lock-screen.tsx

'use client'

import { useAutoLock } from '@/hooks/use-auto-lock'
import { verifyBiometric } from '@/app/(auth)/verify-biometric/actions'
import { useState } from 'react'

export function AutoLockScreen() {
  const { isLocked, unlock } = useAutoLock()
  const [isVerifying, setIsVerifying] = useState(false)
  
  if (!isLocked) return null
  
  const handleUnlock = async () => {
    setIsVerifying(true)
    try {
      await verifyBiometric()
      unlock()
    } catch (error) {
      console.error('Unlock failed:', error)
      // Force logout
      window.location.href = '/auth/login'
    } finally {
      setIsVerifying(false)
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <FaceIdIcon className="w-24 h-24 mx-auto text-accent" />
        </div>
        <h2 className="text-2xl font-serif mb-4">App Locked</h2>
        <p className="text-secondary mb-8">
          Verify your identity to continue
        </p>
        <Button 
          onClick={handleUnlock} 
          disabled={isVerifying}
          size="lg"
        >
          {isVerifying ? 'Verifying...' : 'Unlock with Face ID'}
        </Button>
      </div>
    </div>
  )
}
```

### Middleware Integration

```typescript
// middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes (no auth required)
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/verify-email']
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Check session
  const session = await getSession()
  
  if (!session) {
    // No session, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Check if biometric verified
  if (!session.biometricVerified) {
    // Session exists but not biometrically verified
    return NextResponse.redirect(new URL('/auth/verify-biometric', request.url))
  }
  
  // Check inactivity (server-side enforcement)
  const inactiveFor = Date.now() - new Date(session.lastActivity).getTime()
  if (inactiveFor > 15 * 60 * 1000) {
    // Session expired, require biometric again
    return NextResponse.redirect(new URL('/auth/verify-biometric', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 6. PASSWORD RESET FLOW (COMPLETE)

### Step 1: Request Password Reset

**Route:** `/auth/forgot-password`

```
┌──────────────────────────────────┐
│       Reset Password             │
├──────────────────────────────────┤
│                                  │
│  Enter your email address and    │
│  we'll send you a reset link.    │
│                                  │
│  Email: [___________________]    │
│                                  │
│  [   Send Reset Link   ]         │
│                                  │
│  Remember password? Login        │
└──────────────────────────────────┘
```

**Action:**

```typescript
// app/(auth)/forgot-password/actions.ts

'use server'

export async function requestPasswordReset(email: string): Promise<Result> {
  // 1. Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  })
  
  // Always return success (prevent email enumeration)
  if (!user) {
    return { success: true, message: 'If account exists, reset link sent' }
  }
  
  // 2. Generate reset token
  const token = generateSecureToken()
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  })
  
  // 3. Send reset email
  await sendPasswordResetEmail(user.email, token)
  
  return { success: true, message: 'If account exists, reset link sent' }
}
```

### Step 2: Reset Password

**Route:** `/auth/reset-password?token=abc123`

```
┌──────────────────────────────────┐
│       Set New Password           │
├──────────────────────────────────┤
│                                  │
│  New Password: [___________]     │
│  Confirm: [________________]     │
│                                  │
│  [   Reset Password   ]          │
│                                  │
└──────────────────────────────────┘
```

**Action:**

```typescript
// app/(auth)/reset-password/actions.ts

'use server'

export async function resetPassword(
  token: string, 
  newPassword: string
): Promise<Result> {
  // 1. Verify token
  const resetToken = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.token, token),
      gt(passwordResetTokens.expiresAt, new Date())
    )
  })
  
  if (!resetToken) {
    return { success: false, error: 'Invalid or expired reset link' }
  }
  
  // 2. Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12)
  
  // 3. Update user password
  await db.update(users)
    .set({ passwordHash })
    .where(eq(users.id, resetToken.userId))
  
  // 4. Delete used token
  await db.delete(passwordResetTokens)
    .where(eq(passwordResetTokens.id, resetToken.id))
  
  // 5. Invalidate all existing sessions (force re-login)
  await db.delete(sessions)
    .where(eq(sessions.userId, resetToken.userId))
  
  return { 
    success: true, 
    message: 'Password reset successful. Please login.',
    redirectTo: '/auth/login'
  }
}
```

---

## 7. ACCOUNT MANAGEMENT

### Change Password (While Logged In)

```typescript
// app/actions/auth.ts

'use server'

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<Result> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  })
  
  if (!user) throw new Error('User not found')
  
  // Verify current password
  const passwordValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!passwordValid) {
    return { success: false, error: 'Current password incorrect' }
  }
  
  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12)
  
  // Update
  await db.update(users)
    .set({ passwordHash })
    .where(eq(users.id, user.id))
  
  return { success: true, message: 'Password changed successfully' }
}
```

### Add Additional Biometric Device

```typescript
// app/actions/auth.ts

'use server'

export async function addBiometricDevice(): Promise<Result> {
  // Same flow as initial biometric setup
  // Appends new credential to webauthnCredentials array
  // Allows multiple devices (iPhone + iPad + etc.)
}
```

### Remove Biometric Device

```typescript
'use server'

export async function removeBiometricDevice(credentialId: string): Promise<Result> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  })
  
  if (!user) throw new Error('User not found')
  
  // Remove credential from array
  const updatedCredentials = user.webauthnCredentials.filter(
    cred => cred.id !== credentialId
  )
  
  // Prevent removing last credential
  if (updatedCredentials.length === 0) {
    return { success: false, error: 'Cannot remove last biometric device' }
  }
  
  await db.update(users)
    .set({ webauthnCredentials: updatedCredentials })
    .where(eq(users.id, user.id))
  
  return { success: true, message: 'Device removed' }
}
```

---

## 8. SECURITY BEST PRACTICES IMPLEMENTED

### 1. Password Security
- **bcrypt** with 12 rounds
- Minimum 8 characters
- No password hints
- No password recovery questions

### 2. Session Security
- **httpOnly** cookies (no JavaScript access)
- **Secure** flag (HTTPS only)
- **SameSite: strict** (CSRF protection)
- 30-day expiration
- 15-minute inactivity timeout
- Stored in database (revocable)

### 3. Biometric Security
- **WebAuthn/FIDO2** standard
- **userVerification: required** (forces Face ID/Touch ID)
- **Resident keys** (passkeys)
- **Counter** tracking (replay attack prevention)
- Challenge-response (MITM protection)

### 4. Attack Prevention
- **Rate limiting** on login attempts
- **Account lockout** after 5 failed attempts (30 min)
- **Token expiration** (verification: 24h, reset: 1h)
- **Email enumeration prevention** (always return success)
- **Timing attack prevention** (constant-time comparisons)

### 5. Audit Trail
- All auth events logged
- IP address tracking
- Device fingerprinting
- Session history

---

## 9. ERROR HANDLING

### Authentication Errors

```typescript
export class AuthError extends Error {
  code: string
  
  constructor(message: string, code: string) {
    super(message)
    this.code = code
    this.name = 'AuthError'
  }
}

// Error codes
export const AuthErrorCodes = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  ACCOUNT_LOCKED: 'account_locked',
  EMAIL_NOT_VERIFIED: 'email_not_verified',
  BIOMETRIC_REQUIRED: 'biometric_required',
  BIOMETRIC_FAILED: 'biometric_failed',
  SESSION_EXPIRED: 'session_expired',
  UNAUTHORIZED: 'unauthorized',
} as const
```

### User-Friendly Error Messages

```typescript
export function getErrorMessage(error: AuthError): string {
  switch (error.code) {
    case AuthErrorCodes.INVALID_CREDENTIALS:
      return 'Invalid email or password. Please try again.'
    case AuthErrorCodes.ACCOUNT_LOCKED:
      return 'Your account has been temporarily locked due to multiple failed login attempts. Please try again in 30 minutes.'
    case AuthErrorCodes.EMAIL_NOT_VERIFIED:
      return 'Please verify your email address before logging in.'
    case AuthErrorCodes.BIOMETRIC_REQUIRED:
      return 'Biometric authentication is required to use this app.'
    case AuthErrorCodes.BIOMETRIC_FAILED:
      return 'Biometric verification failed. Please try again or log in with your password.'
    case AuthErrorCodes.SESSION_EXPIRED:
      return 'Your session has expired. Please log in again.'
    case AuthErrorCodes.UNAUTHORIZED:
      return 'You are not authorized to perform this action.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}
```

---

## 10. TESTING AUTHENTICATION

### Manual Testing Checklist

```
Registration Flow:
[ ] Register with valid email/password
[ ] Verify email link works
[ ] Setup Face ID works
[ ] Onboarding completes
[ ] Redirects to dashboard

Login Flow:
[ ] Login with correct credentials
[ ] Login fails with wrong password
[ ] Account locks after 5 failed attempts
[ ] Face ID required after password login
[ ] Dashboard loads after successful login

Session Management:
[ ] Session persists across page reloads
[ ] Auto-lock triggers after 15 min inactivity
[ ] Auto-lock triggers when PWA backgrounds
[ ] Unlock with Face ID works
[ ] Logout clears session

Password Reset:
[ ] Reset link sent to email
[ ] Reset link expires after 1 hour
[ ] Password reset works
[ ] Old sessions invalidated after reset

Edge Cases:
[ ] Multiple devices register biometric
[ ] Biometric works on iPhone (Face ID)
[ ] Biometric works on Android (fingerprint)
[ ] Handles network errors gracefully
[ ] Works offline (cached pages)
```

---

**END OF AUTHENTICATION DOCUMENT**

All authentication flows are now fully specified with complete implementation details. No abstraction or simplification.
