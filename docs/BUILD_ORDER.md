# WG Life OS - Step-by-Step Build Order

**Project Owner:** Waseem Ghaly  
**Build Strategy:** Sequential, testable, production-ready  
**Date:** January 29, 2026

---

## TABLE OF CONTENTS

1. [Overview](#1-overview)
2. [Phase 1: Foundation](#phase-1-foundation)
3. [Phase 2: Authentication](#phase-2-authentication)
4. [Phase 3: Core Features](#phase-3-core-features)
5. [Phase 4: Advanced Features](#phase-4-advanced-features)
6. [Phase 5: Edge Functions](#phase-5-edge-functions)
7. [Phase 6: PWA & Notifications](#phase-6-pwa--notifications)
8. [Phase 7: Testing & Optimization](#phase-7-testing--optimization)
9. [Phase 8: Production Deployment](#phase-8-production-deployment)

---

## 1. OVERVIEW

### Build Philosophy

1. **Sequential** - Each phase builds on the previous
2. **Testable** - Every feature is tested before moving forward
3. **Incremental** - Deploy to staging after each phase
4. **No Shortcuts** - Complete implementation, no placeholders

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ (local or Vercel Postgres)
- Git installed
- Vercel CLI installed (`npm i -g vercel`)
- Code editor (VS Code recommended)

### Estimated Timeline

- **Phase 1-2:** 2-3 days (Foundation + Auth)
- **Phase 3:** 4-5 days (Core Features)
- **Phase 4:** 3-4 days (Advanced Features)
- **Phase 5:** 2-3 days (Edge Functions)
- **Phase 6:** 2-3 days (PWA + Notifications)
- **Phase 7:** 2-3 days (Testing)
- **Phase 8:** 1 day (Deployment)

**Total: 16-24 days** (solo developer, full-time)

---

## PHASE 1: FOUNDATION

**Goal:** Set up project structure, database, and core utilities

### Step 1.1: Initialize Next.js Project

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest wg-life-os --typescript --tailwind --app --no-src

cd wg-life-os

# Install core dependencies
npm install drizzle-orm @vercel/postgres dotenv zod bcryptjs
npm install -D drizzle-kit @types/bcryptjs

# Install UI dependencies
npm install lucide-react
npm install dexie  # IndexedDB
npm install workbox-window  # Service Worker

# Install auth dependencies
npm install next-auth@beta @simplewebauthn/server @simplewebauthn/browser
npm install jose  # JWT handling

# Install push notification dependencies
npm install web-push
```

**Verify:** `npm run dev` starts development server

---

### Step 1.2: Set Up Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wg_life_os"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# WebAuthn
WEBAUTHN_RP_NAME="WG Life OS"
WEBAUTHN_RP_ID="localhost"
WEBAUTHN_ORIGIN="http://localhost:3000"

# VAPID Keys (generate later)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_SUBJECT="mailto:you@example.com"

# Email (use Resend or similar)
EMAIL_FROM="noreply@wglifeos.com"
EMAIL_API_KEY=""
```

**Verify:** Environment variables load correctly

---

### Step 1.3: Configure Drizzle ORM

Create `drizzle.config.ts`:

```typescript
import type { Config } from 'drizzle-kit'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
```

**Verify:** Config file has no TypeScript errors

---

### Step 1.4: Create Database Schema

Copy content from `DATABASE_SCHEMA.sql` and create `db/schema.ts`:

```typescript
// Convert SQL to Drizzle schema
// Full implementation in DATABASE_SCHEMA.sql
import { pgTable, serial, text, timestamp, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core'

// Example: users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  emailVerified: boolean('email_verified').default(false),
  biometricEnabled: boolean('biometric_enabled').default(false),
  // ... all other fields from SQL schema
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Export all tables, enums, relations
```

**Verify:** No TypeScript errors in schema file

---

### Step 1.5: Run Database Migration

```bash
# Generate migration
npx drizzle-kit generate:pg

# Apply migration
npx drizzle-kit push:pg

# Or if using migrations folder:
npx drizzle-kit migrate
```

**Verify:** Database tables exist:

```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# List tables
\dt

# Should see: users, profiles, goals, routines, habits, etc.
```

---

### Step 1.6: Set Up Tailwind Configuration

Copy content from `UI_COMPONENTS_BRANDING.md` section 10:

**File:** `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F0F0F',
          secondary: '#1A1A1A',
          tertiary: '#2A2A2A',
        },
        // ... rest from UI_COMPONENTS_BRANDING.md
      },
    },
  },
}

export default config
```

**File:** `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border-default;
  }
  
  body {
    @apply bg-bg-primary text-text-primary;
    font-family: 'Inter', sans-serif;
  }
}
```

**Verify:** Development server applies dark theme

---

### Step 1.7: Create Core Utilities

**File:** `lib/db.ts`

```typescript
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import * as schema from '@/db/schema'

export const db = drizzle(sql, { schema })
```

**File:** `lib/validators.ts`

```typescript
import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email address')
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')

// Export all validation schemas used in API_SERVER_ACTIONS.md
```

**File:** `lib/crypto.ts`

```typescript
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}
```

**Verify:** Import utilities in test file - no errors

---

### Step 1.8: Create Base UI Components

Create components from `UI_COMPONENTS_BRANDING.md`:

**Files to create:**
- `components/ui/Button.tsx` (Primary, Secondary, Text variants)
- `components/ui/Input.tsx`
- `components/ui/Textarea.tsx`
- `components/ui/Select.tsx`
- `components/ui/Card.tsx`
- `components/ui/Modal.tsx`
- `components/ui/Alert.tsx`
- `components/ui/ProgressBar.tsx`

**Verify:** Create test page rendering all components

---

### Step 1.9: Create Root Layout

**File:** `app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WG Life OS',
  description: 'Personal Life Operating System',
  manifest: '/manifest.json',
  themeColor: '#0F0F0F',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

**Verify:** No console errors, dark theme applied

---

### Phase 1 Checklist

- [ ] Next.js project initialized
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database schema created and migrated
- [ ] Tailwind configured with custom theme
- [ ] Core utilities (db, validators, crypto) created
- [ ] Base UI components built
- [ ] Root layout configured

**Deploy to staging:** `vercel --prod`

---

## PHASE 2: AUTHENTICATION

**Goal:** Complete authentication system with WebAuthn

### Step 2.1: Configure NextAuth

**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword } from '@/lib/crypto'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        })

        if (!user || !user.emailVerified) {
          return null
        }

        const valid = await verifyPassword(
          credentials.password,
          user.passwordHash
        )

        if (!valid) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})

export { handler as GET, handler as POST }
```

**Verify:** Auth endpoints respond correctly

---

### Step 2.2: Create WebAuthn API Routes

**File:** `app/api/webauthn/register/options/route.ts`

```typescript
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { getServerSession } from 'next-auth'
// Full implementation from AUTHENTICATION_FLOW.md
```

**File:** `app/api/webauthn/register/verify/route.ts`

```typescript
import { verifyRegistrationResponse } from '@simplewebauthn/server'
// Full implementation from AUTHENTICATION_FLOW.md
```

**File:** `app/api/webauthn/authenticate/options/route.ts`

```typescript
import { generateAuthenticationOptions } from '@simplewebauthn/server'
// Full implementation from AUTHENTICATION_FLOW.md
```

**File:** `app/api/webauthn/authenticate/verify/route.ts`

```typescript
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
// Full implementation from AUTHENTICATION_FLOW.md
```

**Verify:** All WebAuthn endpoints return expected responses

---

### Step 2.3: Create Auth Server Actions

**File:** `actions/auth.ts`

Copy implementations from `API_SERVER_ACTIONS.md`:

```typescript
'use server'

export async function registerUser(data: RegisterInput): Promise<Result<User>> {
  // Full implementation from API_SERVER_ACTIONS.md
}

export async function loginUser(data: LoginInput): Promise<Result<Session>> {
  // Full implementation
}

export async function logoutUser(): Promise<Result<void>> {
  // Full implementation
}

export async function changePassword(data: ChangePasswordInput): Promise<Result<void>> {
  // Full implementation
}
```

**Verify:** Server Actions work without errors

---

### Step 2.4: Create Auth Hooks

**File:** `hooks/useAuth.ts`

```typescript
import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
  }
}
```

**File:** `hooks/useWebAuthn.ts`

```typescript
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

export function useWebAuthn() {
  async function registerBiometric() {
    const optionsRes = await fetch('/api/webauthn/register/options')
    const options = await optionsRes.json()
    
    const attResp = await startRegistration(options)
    
    const verifyRes = await fetch('/api/webauthn/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attResp),
    })
    
    return verifyRes.json()
  }
  
  async function authenticateBiometric() {
    const optionsRes = await fetch('/api/webauthn/authenticate/options')
    const options = await optionsRes.json()
    
    const asseResp = await startAuthentication(options)
    
    const verifyRes = await fetch('/api/webauthn/authenticate/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asseResp),
    })
    
    return verifyRes.json()
  }
  
  return { registerBiometric, authenticateBiometric }
}
```

**Verify:** Hooks work in test component

---

### Step 2.5: Create Authentication Screens

Create screens from `SCREEN_WIREFRAMES.md` section 2:

**Files:**
- `app/(auth)/landing/page.tsx` - Landing page
- `app/(auth)/register/page.tsx` - Registration
- `app/(auth)/verify-email/page.tsx` - Email verification
- `app/(auth)/setup-biometric/page.tsx` - Biometric setup
- `app/(auth)/login/page.tsx` - Login
- `app/(auth)/biometric-verify/page.tsx` - Biometric verification

Each screen implements full logic from wireframes.

**Verify:** 
- Can register new account
- Receive verification email
- Set up Face ID/Touch ID
- Login with password + biometric

---

### Step 2.6: Create Auto-Lock System

**File:** `hooks/useAutoLock.ts`

```typescript
import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes

export function useAutoLock() {
  const router = useRouter()
  
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    const resetTimer = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        localStorage.setItem('autoLocked', 'true')
        router.push('/auto-lock')
      }, TIMEOUT_MS)
    }
    
    // Listen for user activity
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach(event => {
      document.addEventListener(event, resetTimer)
    })
    
    resetTimer()
    
    return () => {
      clearTimeout(timeout)
      events.forEach(event => {
        document.removeEventListener(event, resetTimer)
      })
    }
  }, [router])
}
```

**File:** `app/auto-lock/page.tsx`

```tsx
export default function AutoLockPage() {
  const { authenticateBiometric } = useWebAuthn()
  
  async function handleUnlock() {
    const result = await authenticateBiometric()
    if (result.success) {
      localStorage.removeItem('autoLocked')
      router.push('/dashboard')
    }
  }
  
  return (
    // Implementation from SCREEN_WIREFRAMES.md
  )
}
```

**Verify:** App auto-locks after 15 minutes of inactivity

---

### Step 2.7: Create Auth Middleware

**File:** `middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register')
  
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return null
  }
  
  if (!isAuth) {
    let from = request.nextUrl.pathname
    if (request.nextUrl.search) {
      from += request.nextUrl.search
    }
    
    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url)
    )
  }
}

export const config = {
  matcher: ['/(dashboard|profile|goals|routines|habits|people|prayer|finance|business|insights|accountability|settings)/:path*']
}
```

**Verify:** Protected routes redirect to login when not authenticated

---

### Phase 2 Checklist

- [ ] NextAuth configured with credentials provider
- [ ] WebAuthn API routes created (register + authenticate)
- [ ] Auth server actions implemented
- [ ] Auth hooks created (useAuth, useWebAuthn)
- [ ] All auth screens built (landing, register, verify, biometric, login)
- [ ] Auto-lock system implemented
- [ ] Auth middleware protects routes
- [ ] Email verification working
- [ ] Face ID/Touch ID working

**Test:** Complete registration → verification → biometric → login flow

**Deploy to staging**

---

## PHASE 3: CORE FEATURES

**Goal:** Build Profile, Identity, Goals, Routines, Habits features

### Step 3.1: Create Onboarding Flow

Create screens from `SCREEN_WIREFRAMES.md` section 3:

**Files:**
- `app/(onboarding)/welcome/page.tsx`
- `app/(onboarding)/profile-setup/page.tsx`
- `app/(onboarding)/identity-setup/page.tsx`
- `app/(onboarding)/core-values/page.tsx`
- `app/(onboarding)/first-goal/page.tsx`
- `app/(onboarding)/setup-complete/page.tsx`

**Verify:** New users complete onboarding before accessing dashboard

---

### Step 3.2: Create Profile Features

**Server Actions:** `actions/profile.ts`

```typescript
'use server'

export async function getProfile(userId: number): Promise<Result<Profile>> {
  // Implementation from API_SERVER_ACTIONS.md
}

export async function updateProfile(userId: number, data: UpdateProfileInput): Promise<Result<Profile>> {
  // Implementation
}

export async function uploadProfilePhoto(userId: number, file: File): Promise<Result<string>> {
  // Use Vercel Blob for storage
}
```

**Screens:**
- `app/(dashboard)/profile/page.tsx` - Profile view
- `app/(dashboard)/profile/edit/page.tsx` - Edit profile

**Verify:** Can view and edit profile, upload photo

---

### Step 3.3: Create Identity Features

**Server Actions:**
- `actions/identity.ts` - updateIdentityStatement
- `actions/values.ts` - addCoreValue, updateCoreValue, deleteCoreValue
- `actions/faith.ts` - createFaithReflection

**Screens:**
- `app/(dashboard)/identity/page.tsx` - Overview
- `app/(dashboard)/identity/manifesto/page.tsx` - Personal manifesto
- `app/(dashboard)/identity/values/page.tsx` - Core values
- `app/(dashboard)/identity/faith/page.tsx` - Faith reflections

**Verify:** Can update manifesto, add/edit/delete values, create reflections

---

### Step 3.4: Create Goals Features

**Server Actions:** `actions/goals.ts`

```typescript
'use server'

export async function createGoal(userId: number, data: CreateGoalInput): Promise<Result<Goal>> {
  // Implementation
}

export async function updateGoalProgress(goalId: number, progress: number): Promise<Result<Goal>> {
  // Auto-complete at 100%
}

export async function completeGoal(goalId: number, reflection: string): Promise<Result<Goal>> {
  // Mark complete with reflection
}

export async function archiveGoal(goalId: number): Promise<Result<void>> {
  // Soft delete
}
```

**Components:**
- `components/goals/GoalCard.tsx`
- `components/goals/GoalForm.tsx`
- `components/goals/GoalProgress.tsx`

**Screens:**
- `app/(dashboard)/goals/page.tsx` - Goals overview with filtering
- `app/(dashboard)/goals/[id]/page.tsx` - Goal detail
- `app/(dashboard)/goals/new/page.tsx` - Create goal

**Verify:** Can create, update progress, complete, archive goals

---

### Step 3.5: Create Routines Features

**Server Actions:**
- `actions/routines.ts` - createRoutine, updateRoutine, deleteRoutine
- `actions/routine-logs.ts` - logRoutineCompletion

**Screens:**
- `app/(dashboard)/routines/page.tsx` - Routines overview
- `app/(dashboard)/routines/[id]/log/page.tsx` - Log routine completion

**Verify:** Can create routines with items, log completions

---

### Step 3.6: Create Habits Features

**Server Actions:**
- `actions/habits.ts` - createHabit, updateHabit, deleteHabit
- `actions/habit-logs.ts` - logHabit

**Screens:**
- `app/(dashboard)/habits/page.tsx` - Habits overview (Good/Bad tabs)
- `app/(dashboard)/habits/[id]/page.tsx` - Habit detail with history

**Verify:** Can track good/bad habits, identify triggers

---

### Step 3.7: Create Dashboard

**File:** `app/(dashboard)/dashboard/page.tsx`

Implementation from `SCREEN_WIREFRAMES.md` section 4:

```tsx
export default async function DashboardPage() {
  const session = await getServerSession()
  const userId = session.user.id
  
  // Fetch data
  const todayRoutine = await getTodayRoutine(userId)
  const activeGoals = await getActiveGoals(userId)
  const insights = await getUnacknowledgedInsights(userId)
  
  return (
    <div className="space-y-6">
      {/* Today's Focus */}
      <section>
        <h2>Today's Focus</h2>
        {todayRoutine && <RoutineCard routine={todayRoutine} />}
      </section>
      
      {/* Active Goals */}
      <section>
        <h2>Active Goals</h2>
        {activeGoals.map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </section>
      
      {/* Insights */}
      <section>
        <h2>Insights</h2>
        {insights.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </section>
      
      {/* Quick Actions */}
      <section>
        <QuickActions />
      </section>
    </div>
  )
}
```

**Verify:** Dashboard displays all sections correctly

---

### Phase 3 Checklist

- [ ] Onboarding flow complete (6 screens)
- [ ] Profile features (view, edit, photo upload)
- [ ] Identity features (manifesto, values, faith)
- [ ] Goals features (create, progress, complete, archive)
- [ ] Routines features (create, log completions)
- [ ] Habits features (good/bad tracking)
- [ ] Dashboard displays all data

**Test:** Create goal → create routine → log habit → view on dashboard

**Deploy to staging**

---

## PHASE 4: ADVANCED FEATURES

**Goal:** Build People, Prayer, Finance, Business, Accountability features

### Step 4.1: Create People & Relationships

**Server Actions:**
- `actions/people.ts` - addPerson, updatePerson, deletePerson
- `actions/relationship-notes.ts` - addRelationshipNote
- `actions/exes.ts` - updateExReflection

**Screens:**
- `app/(dashboard)/people/page.tsx` - People overview (All/Inner Circle/Exes)
- `app/(dashboard)/people/[id]/page.tsx` - Person detail
- `app/(dashboard)/people/new/page.tsx` - Add person

**Verify:** Can manage relationships, track emotional impact

---

### Step 4.2: Create Prayer Features

**Server Actions:**
- `actions/prayer.ts` - createPrayerEntry, updatePrayerEntry, deletePrayerEntry
- `actions/prayer-logs.ts` - logPrayer, markPrayerAnswered

**Screens:**
- `app/(dashboard)/prayer/page.tsx` - Prayer overview (Praying/Answered/All)
- `app/(dashboard)/prayer/[id]/page.tsx` - Prayer detail

**Verify:** Can create prayer requests, log prayers, mark answered

---

### Step 4.3: Create Finance Features

**Server Actions:**
- `actions/finance.ts` - updateFinanceOverview
- `actions/cash-flow.ts` - addCashFlowEntry, updateCashFlowEntry, deleteCashFlowEntry
- `actions/investments.ts` - addInvestment, updateInvestment, deleteInvestment

**Screens:**
- `app/(dashboard)/finance/page.tsx` - Finance overview (net worth, emergency fund)
- `app/(dashboard)/finance/cash-flow/page.tsx` - Cash flow timeline

**Verify:** Can track net worth, cash flow, investments

---

### Step 4.4: Create Business Features

**Server Actions:**
- `actions/companies.ts` - createCompany, updateCompany
- `actions/company-products.ts` - addProduct
- `actions/cap-table.ts` - addCapTableEntry

**Screens:**
- `app/(dashboard)/business/page.tsx` - Companies overview
- `app/(dashboard)/business/[id]/page.tsx` - Company detail (tabs: overview, financials, products, cap table)

**Verify:** Can manage companies, track ownership

---

### Step 4.5: Create Accountability Features

**Server Actions:**
- `actions/accountability.ts` - invitePointOfLight, acceptInvite, revokeLink
- `actions/accountability-comments.ts` - addAccountabilityComment

**Screens:**
- `app/(dashboard)/accountability/page.tsx` - My Points of Light + People I'm watching
- `app/(dashboard)/accountability/[linkId]/page.tsx` - Link detail with comments

**Verify:** Can invite POLs, grant scopes, add comments

---

### Step 4.6: Create Settings

**Screens:**
- `app/(dashboard)/settings/page.tsx` - Settings overview
- `app/(dashboard)/settings/account/page.tsx` - Account settings
- `app/(dashboard)/settings/notifications/page.tsx` - Notification preferences
- `app/(dashboard)/settings/data/page.tsx` - Data & privacy
- `app/(dashboard)/settings/about/page.tsx` - About

**Verify:** Can change password, manage notifications, export data

---

### Phase 4 Checklist

- [ ] People & Relationships (with emotional tracking)
- [ ] Prayer features (requests, logs, answered)
- [ ] Finance features (net worth, cash flow, investments)
- [ ] Business features (companies, cap table)
- [ ] Accountability features (POLs, comments)
- [ ] Settings (account, notifications, data, about)

**Test:** Add person → log prayer → track finances → invite POL

**Deploy to staging**

---

## PHASE 5: EDGE FUNCTIONS

**Goal:** Autonomous insights generation

### Step 5.1: Create Edge Runtime Functions

Copy implementations from `EDGE_FUNCTIONS_INSIGHTS.md`:

**Files:**
- `edge/insights/detect.ts` - Main orchestrator
- `edge/insights/behavioral.ts` - Behavioral patterns
- `edge/insights/financial.ts` - Financial patterns
- `edge/insights/relationship.ts` - Relationship patterns
- `edge/insights/faith.ts` - Faith patterns
- `edge/alerts/dispatch.ts` - Alert dispatcher

**Verify:** Edge functions run without errors

---

### Step 5.2: Create Cron Job for Insights

**File:** `app/api/cron/insights/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { detectInsights } from '@/edge/insights/detect'

export const runtime = 'edge'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  
  // Get all users
  const users = await db.query.users.findMany({
    where: eq(users.isActive, true),
  })
  
  // Run insights for each user
  for (const user of users) {
    await detectInsights(user.id)
  }
  
  return NextResponse.json({ success: true, usersProcessed: users.length })
}
```

**Verify:** Cron endpoint returns expected response

---

### Step 5.3: Create Insights UI

**Server Actions:** `actions/insights.ts`

```typescript
'use server'

export async function acknowledgeInsight(insightId: number): Promise<Result<void>> {
  // Implementation
}

export async function dismissInsight(insightId: number): Promise<Result<void>> {
  // Implementation
}

export async function markInsightActionTaken(insightId: number, notes: string): Promise<Result<void>> {
  // Implementation
}
```

**Screens:**
- `app/(dashboard)/insights/page.tsx` - Insights dashboard (All/High/Medium/Low tabs)
- `app/(dashboard)/insights/[id]/page.tsx` - Insight detail with evidence

**Verify:** Insights display correctly, can acknowledge/dismiss

---

### Step 5.4: Configure Vercel Cron

**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/insights",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Verify:** Cron job runs every 6 hours in production

---

### Phase 5 Checklist

- [ ] Edge functions created (detect, behavioral, financial, relationship, faith)
- [ ] Alert dispatcher implemented
- [ ] Cron job endpoint created
- [ ] Insights UI built
- [ ] Vercel cron configured

**Test:** Wait for cron → verify insights generated → acknowledge insight

**Deploy to staging**

---

## PHASE 6: PWA & NOTIFICATIONS

**Goal:** Progressive Web App with push notifications

### Step 6.1: Generate VAPID Keys

```bash
npx web-push generate-vapid-keys

# Add to .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:you@example.com"
```

**Verify:** Keys exist in environment variables

---

### Step 6.2: Create Service Worker

Copy implementation from `PUSH_NOTIFICATIONS.md`:

**File:** `public/sw.js`

```javascript
const CACHE_NAME = 'wg-life-os-v1'

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/dashboard',
        '/goals',
        '/routines',
        '/habits',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png',
      ])
    })
  )
})

// Push event
self.addEventListener('push', (event) => {
  const data = event.data.json()
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: data.data,
      actions: data.actions,
      requireInteraction: data.requireInteraction,
    })
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow(event.notification.data.actionUrl)
  )
})
```

**Verify:** Service worker registers correctly

---

### Step 6.3: Create PWA Manifest

**File:** `public/manifest.json`

```json
{
  "name": "WG Life OS",
  "short_name": "WG Life OS",
  "description": "Personal Life Operating System",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#0F0F0F",
  "theme_color": "#0F0F0F",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Verify:** Manifest loads correctly

---

### Step 6.4: Create Push Subscription Manager

**File:** `lib/push-notifications.ts`

```typescript
export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications not supported')
  }
  
  const registration = await navigator.serviceWorker.ready
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    ),
  })
  
  // Send subscription to server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })
  
  return subscription
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}
```

**Verify:** Can subscribe to push notifications

---

### Step 6.5: Create Push API Routes

**File:** `app/api/push/subscribe/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/db/schema'

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  
  const subscription = await request.json()
  
  await db.insert(pushSubscriptions).values({
    userId: session.user.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  })
  
  return NextResponse.json({ success: true })
}
```

**File:** `app/api/push/unsubscribe/route.ts`

```typescript
export async function POST(request: Request) {
  // Implementation from PUSH_NOTIFICATIONS.md
}
```

**Verify:** Subscription saves to database

---

### Step 6.6: Create Notification Sender

**File:** `lib/send-push-notification.ts`

```typescript
import webpush from 'web-push'
import { db } from '@/lib/db'
import { pushSubscriptions, notifications } from '@/db/schema'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification(userId: number, notification: {
  title: string
  body: string
  type: string
  actionUrl: string
  severity?: string
}) {
  // Get user's subscriptions
  const subscriptions = await db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.userId, userId),
  })
  
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      type: notification.type,
      actionUrl: notification.actionUrl,
    },
    requireInteraction: notification.severity === 'high',
  })
  
  // Send to all subscriptions
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      )
    } catch (error) {
      // If subscription is expired (410 Gone), delete it
      if (error.statusCode === 410) {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id))
      }
    }
  }
  
  // Store notification in database
  await db.insert(notifications).values({
    userId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    actionUrl: notification.actionUrl,
    status: 'sent',
  })
}
```

**Verify:** Notifications send successfully

---

### Step 6.7: Create Notification Cron Job

**File:** `app/api/cron/notifications/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifications } from '@/db/schema'
import { sendPushNotification } from '@/lib/send-push-notification'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  
  // Get pending notifications
  const pending = await db.query.notifications.findMany({
    where: eq(notifications.status, 'pending'),
    limit: 100,
  })
  
  for (const notif of pending) {
    await sendPushNotification(notif.userId, {
      title: notif.title,
      body: notif.body,
      type: notif.type,
      actionUrl: notif.actionUrl,
    })
    
    await db.update(notifications)
      .set({ status: 'sent' })
      .where(eq(notifications.id, notif.id))
  }
  
  return NextResponse.json({ success: true, notificationsSent: pending.length })
}
```

**Update `vercel.json`:**

```json
{
  "crons": [
    {
      "path": "/api/cron/insights",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/notifications",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Verify:** Notifications process every 5 minutes

---

### Phase 6 Checklist

- [ ] VAPID keys generated
- [ ] Service worker created (install, push, notificationclick events)
- [ ] PWA manifest created
- [ ] Push subscription manager implemented
- [ ] Push API routes (subscribe, unsubscribe)
- [ ] Notification sender implemented
- [ ] Notification cron job created
- [ ] Vercel cron updated

**Test:** Subscribe → trigger notification → receive on device

**Deploy to staging**

---

## PHASE 7: TESTING & OPTIMIZATION

**Goal:** Ensure reliability and performance

### Step 7.1: Write Unit Tests

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Files to test:**
- `lib/crypto.test.ts` - Password hashing
- `lib/validators.test.ts` - Zod schemas
- `actions/auth.test.ts` - Auth actions
- `components/ui/Button.test.tsx` - UI components

**Verify:** All tests pass (`npm run test`)

---

### Step 7.2: Write Integration Tests

```bash
npm install -D playwright
```

**Files:**
- `tests/auth-flow.spec.ts` - Complete registration → login flow
- `tests/goal-creation.spec.ts` - Create and update goal
- `tests/routine-logging.spec.ts` - Log routine completion

**Verify:** All integration tests pass (`npx playwright test`)

---

### Step 7.3: Performance Optimization

**Tasks:**
- Enable Next.js image optimization
- Implement React.lazy for code splitting
- Add database indexes for common queries
- Enable gzip compression
- Optimize Tailwind (purge unused classes)

**Verify:** Lighthouse score >90

---

### Step 7.4: Security Audit

**Tasks:**
- Run `npm audit` and fix vulnerabilities
- Enable Content Security Policy (CSP)
- Add rate limiting to auth endpoints
- Implement CSRF protection
- Review all API routes for authorization

**Verify:** No critical security issues

---

### Phase 7 Checklist

- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests written
- [ ] Performance optimized (Lighthouse >90)
- [ ] Security audit complete
- [ ] All tests passing

---

## PHASE 8: PRODUCTION DEPLOYMENT

**Goal:** Launch to production

### Step 8.1: Final Configuration

**Environment Variables:**
- Set production DATABASE_URL
- Set production NEXTAUTH_URL
- Set production WebAuthn RP_ID and ORIGIN
- Set production VAPID keys
- Set production EMAIL_API_KEY
- Generate CRON_SECRET

**Verify:** All environment variables set in Vercel

---

### Step 8.2: Deploy to Production

```bash
# Ensure all changes committed
git add .
git commit -m "Production ready"
git push origin main

# Deploy to Vercel
vercel --prod

# Run production migration
vercel env pull .env.production
npx drizzle-kit push:pg --config=drizzle.config.prod.ts
```

**Verify:** Production deployment successful

---

### Step 8.3: Post-Deployment Verification

**Checklist:**
- [ ] Health check endpoint returns 200 (`/api/health`)
- [ ] Can register new account
- [ ] Can login with biometric
- [ ] Can create and log goal
- [ ] Insights cron runs successfully
- [ ] Push notifications deliver
- [ ] PWA installs on mobile device (iOS 16.4+ tested)
- [ ] Auto-lock works after 15 minutes
- [ ] All protected routes require auth

---

### Step 8.4: Monitoring Setup

**Tasks:**
- Configure Vercel Analytics
- Set up Sentry for error tracking
- Create database backups schedule
- Monitor cron job execution
- Set up uptime monitoring (e.g., UptimeRobot)

**Verify:** Monitoring dashboards accessible

---

### Step 8.5: Documentation

**Files to create:**
- `README.md` - Project overview, setup instructions
- `DEPLOYMENT.md` - Deployment process
- `CONTRIBUTING.md` - Contribution guidelines
- `API_DOCUMENTATION.md` - API endpoint documentation

**Verify:** Documentation complete and accurate

---

### Phase 8 Checklist

- [ ] Production environment configured
- [ ] Deployed to Vercel
- [ ] Post-deployment verification complete
- [ ] Monitoring setup
- [ ] Documentation complete

---

## FINAL VERIFICATION

### Complete System Test

1. **Registration Flow**
   - Register new account
   - Verify email
   - Set up Face ID/Touch ID
   - Complete onboarding

2. **Core Features**
   - Create goal in each category
   - Create morning routine
   - Log good/bad habits
   - Update goal progress

3. **Advanced Features**
   - Add person to inner circle
   - Create prayer request
   - Log cash flow entry
   - Create company

4. **Insights System**
   - Wait for cron job (or trigger manually)
   - Verify insights generated
   - Acknowledge/dismiss insights

5. **Push Notifications**
   - Subscribe to push
   - Trigger notification
   - Verify delivery on device

6. **PWA**
   - Install PWA on iOS device
   - Test offline functionality
   - Verify auto-lock

### Production Readiness Checklist

- [ ] All features working in production
- [ ] No console errors
- [ ] Performance targets met (<200ms API, <2s page load)
- [ ] Security measures in place (HTTPS, CSP, rate limiting)
- [ ] Database backups configured
- [ ] Monitoring and alerting active
- [ ] Documentation complete
- [ ] Support email configured
- [ ] Terms of Service and Privacy Policy published

---

**END OF BUILD ORDER**

Complete sequential implementation plan from repository initialization to production deployment. Next: Per-File Implementation Notes.