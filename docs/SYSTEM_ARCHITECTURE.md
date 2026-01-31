# WG Life OS - Complete System Architecture

**Project Owner:** Waseem Ghaly  
**Domain:** https://waseemghaly.com/wgpersonalgrowth/app  
**Target Platform:** iPhone PWA (primary), Desktop (secondary)  
**Deployment:** Vercel  
**Date:** January 29, 2026

---

## 1. ARCHITECTURAL OVERVIEW

### 1.1 System Type
WG Life OS is a private, secure Personal Life Operating System built as a Progressive Web Application (PWA) with the following architectural characteristics:

- **Architecture Pattern:** Monolithic Next.js application with edge computing capabilities
- **Rendering Strategy:** Hybrid (SSR for auth, CSR for real-time interactions, SSG for static content)
- **Data Strategy:** Offline-first with eventual consistency
- **Security Model:** Zero-trust, explicit permissions, mandatory biometric authentication
- **Scalability Model:** Vertical (optimized for individual users, not horizontal scale)

### 1.2 Technology Stack

#### Frontend Layer
```
Next.js 14+ (App Router)
├── React 18+ (Server Components + Client Components)
├── TypeScript 5+ (Strict mode)
├── Tailwind CSS 3+ (Custom design system)
├── PWA (Workbox + next-pwa)
├── Web Push API (Native VAPID)
└── WebAuthn API (Face ID / Passkeys)
```

#### Backend Layer
```
Vercel Platform
├── Next.js Server Actions (Primary data mutations)
├── API Routes (External integrations, webhooks)
├── Serverless Functions (Complex computations)
├── Edge Functions (Real-time insights, alerts)
├── Edge Config (Feature flags, rate limits)
└── CRON Jobs (via Vercel Cron)
```

#### Data Layer
```
PostgreSQL (Vercel Postgres or Neon)
├── Connection Pooling (pgBouncer)
├── Read Replicas (for analytics queries)
├── Backup Strategy (automated daily)
└── Migration Tool (Drizzle ORM or Prisma)
```

#### Authentication Layer
```
NextAuth.js v5 (Auth.js)
├── Email + Password (bcrypt)
├── WebAuthn / Passkeys (FIDO2)
├── Session Management (JWT + Database)
├── Auto-lock (inactivity timeout)
└── Biometric Required (every session)
```

#### Notification Layer
```
Web Push API (VAPID)
├── Push Subscription Management
├── Notification Queue
├── Delivery Tracking
└── Retry Logic
```

---

## 2. SYSTEM LAYERS & RESPONSIBILITIES

### 2.1 Presentation Layer (Client)

**Responsibility:** User interface, user input, client-side state, offline capability

#### Components
1. **App Shell**
   - Navigation
   - Auto-lock screen
   - Biometric prompt
   - Loading states
   - Error boundaries

2. **Feature Modules**
   - Profile & Life Seasons
   - Identity & Faith
   - Goals Management
   - Routines & Habits
   - People & Relationships
   - Prayer System
   - Finance Dashboard
   - Business & Equity
   - Insights Dashboard
   - Accountability Portal

3. **Offline Capabilities**
   - Service Worker (Workbox)
   - IndexedDB (local cache)
   - Background Sync
   - Optimistic UI updates

#### State Management Strategy
```typescript
// Global State (Server State)
- React Server Components (default)
- Server Actions (mutations)
- Cache invalidation (revalidatePath, revalidateTag)

// Client State (UI State)
- React Context (theme, user preferences)
- URL State (navigation, filters)
- Component State (forms, toggles)

// Offline State (Persisted)
- IndexedDB via Dexie.js
- Service Worker cache
- Background sync queue
```

### 2.2 Application Layer (Server)

**Responsibility:** Business logic, validation, authorization, orchestration

#### Server Actions (Primary Interface)
Located in: `/app/actions/`

**Pattern:**
```typescript
'use server'

export async function createGoal(data: GoalInput): Promise<Result<Goal>> {
  // 1. Authenticate
  const session = await auth()
  if (!session) throw new AuthError()
  
  // 2. Authorize
  if (session.user.id !== data.userId) throw new ForbiddenError()
  
  // 3. Validate
  const validated = GoalSchema.parse(data)
  
  // 4. Execute business logic
  const goal = await db.transaction(async (tx) => {
    // Create goal
    const goal = await tx.insert(goals).values(validated).returning()
    
    // Create linked habits if any
    if (validated.linkedHabits) {
      await tx.insert(goalHabits).values(...)
    }
    
    // Log audit trail
    await tx.insert(auditLog).values(...)
    
    return goal
  })
  
  // 5. Trigger side effects
  await revalidatePath('/goals')
  await triggerInsightRecalculation(session.user.id)
  
  // 6. Return result
  return { success: true, data: goal }
}
```

#### API Routes (Secondary Interface)
Located in: `/app/api/`

**Use Cases:**
- Webhooks (external integrations)
- Push notification endpoints
- Health checks
- Admin operations

### 2.3 Edge Layer (Real-time Processing)

**Responsibility:** Real-time insights, alerts, low-latency operations

#### Edge Functions
Located in: `/edge/`

**1. Insights Engine** (`/edge/insights/detect.ts`)
```typescript
// Runs every 6 hours or on-demand
// Analyzes behavioral patterns, triggers alerts
// Uses Edge Config for threshold rules
// Writes to insights table
// Dispatches push notifications
```

**2. Alert Dispatcher** (`/edge/alerts/dispatch.ts`)
```typescript
// Triggered by insights or scheduled events
// Filters based on user preferences
// Batches notifications
// Tracks delivery status
```

**3. Real-time Sync** (`/edge/sync/handler.ts`)
```typescript
// Handles background sync from PWA
// Conflict resolution
// Optimistic update reconciliation
```

### 2.4 Data Layer

**Responsibility:** Data persistence, integrity, retrieval

#### Database Strategy
- **Primary Database:** PostgreSQL 15+
- **Connection:** Pooled via Vercel Postgres
- **ORM:** Drizzle ORM (type-safe, lightweight)
- **Migrations:** Automated via Drizzle Kit
- **Backups:** Daily automated snapshots

#### Data Access Patterns
```typescript
// Direct DB access in Server Actions
import { db } from '@/lib/db'
import { goals } from '@/db/schema'

const userGoals = await db.query.goals.findMany({
  where: eq(goals.userId, userId),
  with: {
    linkedHabits: true,
    linkedRoutines: true,
  },
  orderBy: desc(goals.createdAt),
})
```

#### Caching Strategy
```
Level 1: React Server Component Cache (automatic)
Level 2: Vercel Edge Network (CDN)
Level 3: Database Query Cache (pg_stat_statements)
Level 4: Client-side IndexedDB (offline)
```

---

## 3. SECURITY ARCHITECTURE

### 3.1 Authentication Flow

#### Initial Registration
```
1. User visits app → Redirect to /auth/register
2. Email + Password creation
3. Email verification (magic link)
4. Profile setup (DOB, name)
5. WebAuthn enrollment (Face ID / Touch ID / Passkey)
6. Session creation (JWT + DB record)
7. Redirect to /onboarding
```

#### Session Management
```
Session Storage: Database + Encrypted JWT
Session Duration: 30 days (with activity)
Inactivity Timeout: 15 minutes → Auto-lock
Auto-lock Behavior: Face ID required to resume

JWT Payload:
{
  userId: string
  email: string
  role: 'owner' | 'point_of_light' | 'secondary_user'
  iat: number
  exp: number
  lastActivity: number
}
```

#### Biometric Authentication (WebAuthn)
```typescript
// On every app open (PWA resume)
if (appWasBackgrounded() && !session.biometricVerified) {
  const challenge = generateChallenge()
  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: challenge,
      allowCredentials: [{ id: user.credentialId, type: 'public-key' }],
      userVerification: 'required', // Forces Face ID
    }
  })
  
  await verifyAssertion(credential)
  session.biometricVerified = true
  session.lastActivity = Date.now()
}
```

### 3.2 Authorization Model

#### Role-Based Access Control (RBAC)
```
Owner
├── Full CRUD on own data
├── Can invite Point of Light
├── Can grant/revoke scopes
├── Can delete own account
└── Can export all data

Point of Light (Accountability Partner)
├── Read-only access (scoped)
├── Can comment on granted areas
├── Can add prayer notes
├── Can receive alerts
└── Can leave relationship

Secondary User
├── Own isolated Life OS
├── Can invite own Point of Light
└── No cross-user access (default)
```

#### Scope-Based Permissions
```typescript
type PermissionScope =
  | 'profile'
  | 'identity'
  | 'goals'
  | 'routines'
  | 'habits'
  | 'habits:good'
  | 'habits:bad'
  | 'relationships'
  | 'prayer'
  | 'finance'
  | 'business'
  | 'insights'

interface AccountabilityLink {
  id: string
  ownerId: string
  pointOfLightId: string
  grantedScopes: PermissionScope[]
  canComment: boolean
  receiveAlerts: boolean
  createdAt: Date
  revokedAt: Date | null
}
```

#### Permission Check Middleware
```typescript
export async function requireScope(
  userId: string,
  targetUserId: string,
  scope: PermissionScope
): Promise<void> {
  if (userId === targetUserId) return // Owner always has access
  
  const link = await db.query.accountabilityLinks.findFirst({
    where: and(
      eq(accountabilityLinks.ownerId, targetUserId),
      eq(accountabilityLinks.pointOfLightId, userId),
      isNull(accountabilityLinks.revokedAt)
    )
  })
  
  if (!link || !link.grantedScopes.includes(scope)) {
    throw new ForbiddenError(`Access denied to ${scope}`)
  }
}
```

### 3.3 Data Protection

#### Encryption Strategy
```
At Rest:
- Database: Encrypted storage (provider-level)
- Backups: AES-256 encryption
- Secrets: Vercel Environment Variables (encrypted)

In Transit:
- HTTPS only (TLS 1.3)
- HSTS headers
- Certificate pinning (PWA)

Sensitive Fields:
- Passwords: bcrypt (12 rounds)
- API Keys: AES-256-GCM with user-specific keys
- Financial data: Field-level encryption (optional)
```

#### Privacy Rules
```
1. No third-party analytics
2. No cookies except auth
3. No external trackers
4. No social media SDKs
5. No email marketing
6. No data selling
7. No AI training on user data
8. User owns all data
9. Export available anytime
10. Delete available anytime
```

### 3.4 Security Headers
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' wss: https:;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

---

## 4. DATA FLOW ARCHITECTURE

### 4.1 User Action → Data Mutation Flow

```
┌─────────────┐
│ User Action │ (e.g., "Complete Morning Routine")
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Client Handler  │ (Button onClick)
└──────┬──────────┘
       │
       ▼ Optimistic Update
┌─────────────────┐
│ Local UI Update │ (Instant feedback)
└──────┬──────────┘
       │
       ▼ Server Action Call
┌─────────────────┐
│ Authentication  │ (Session check + biometric validation)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Authorization   │ (Permission check)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Validation      │ (Zod schema validation)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Business Logic  │ (DB transaction)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Side Effects    │ (Triggers, insights, notifications)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Cache Invalidate│ (revalidatePath, revalidateTag)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Response        │ (Success/Error with data)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Client Reconcile│ (Update UI with server response)
└─────────────────┘
```

### 4.2 Offline Operation Flow

```
User Opens App (Offline)
       │
       ▼
Service Worker Intercepts
       │
       ├─── Static Assets → Cache (instant)
       │
       ├─── API Call → IndexedDB
       │              │
       │              ├─── Data exists → Return cached
       │              │
       │              └─── Data missing → Queue for sync
       │
       ▼
User Makes Changes (Offline)
       │
       ├─── Write to IndexedDB (optimistic)
       │
       └─── Add to Sync Queue
              │
              └─── {action: 'updateRoutine', payload: {...}, timestamp: ...}
       
User Goes Online
       │
       ▼
Background Sync Event
       │
       ▼
Process Sync Queue (FIFO)
       │
       ├─── For each queued action:
       │    │
       │    ├─── Call Server Action
       │    │
       │    ├─── Success → Remove from queue, update IndexedDB
       │    │
       │    └─── Conflict → Show resolution UI
       │
       └─── Clear queue
```

### 4.3 Insights Generation Flow

```
Trigger Event
├── Scheduled (every 6 hours via Cron)
├── Manual (user requests refresh)
└── Event-driven (habit logged, goal updated)
       │
       ▼
┌────────────────────────┐
│ Edge Function: Analyze │
└───────────┬────────────┘
            │
            ├─── Fetch user data (last 30 days)
            │    ├── Routine completion rates
            │    ├── Habit logs
            │    ├── Goal progress
            │    ├── Relationship notes
            │    └── Prayer frequency
            │
            ├─── Load detection rules (Edge Config)
            │    ├── Discipline decay threshold
            │    ├── Avoidance patterns
            │    ├── Financial stress signals
            │    └── Relationship red flags
            │
            ├─── Run algorithms
            │    ├── Streak analysis
            │    ├── Variance detection
            │    ├── Correlation mapping
            │    └── Anomaly detection
            │
            ├─── Generate insights
            │    └── For each detected pattern:
            │         ├── Calculate severity (1-5)
            │         ├── Create explanation
            │         ├── Suggest action
            │         └── Link evidence (logs)
            │
            ▼
┌────────────────────────┐
│ Store Insights (DB)    │
└───────────┬────────────┘
            │
            ├─── Insert into insights table
            │
            └─── Link to user_id + evidence_ids
            │
            ▼
┌────────────────────────┐
│ Trigger Notifications  │
└───────────┬────────────┘
            │
            ├─── Filter by user preferences
            │
            ├─── Check alert fatigue rules
            │
            └─── Dispatch push notifications
                 │
                 ├─── To owner
                 │
                 └─── To Point of Light (if granted scope)
```

---

## 5. DEPLOYMENT ARCHITECTURE

### 5.1 Vercel Configuration

```javascript
// vercel.json
{
  "version": 2,
  "regions": ["iad1"], // Primary region (US East)
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "VAPID_PUBLIC_KEY": "@vapid-public",
    "VAPID_PRIVATE_KEY": "@vapid-private"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_APP_URL": "https://waseemghaly.com",
      "NEXT_PUBLIC_API_URL": "https://waseemghaly.com/wgpersonalgrowth/app"
    }
  },
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    },
    "edge/**/*.ts": {
      "runtime": "edge"
    }
  },
  "crons": [
    {
      "path": "/api/cron/insights",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/notifications",
      "schedule": "0 8,12,18 * * *"
    },
    {
      "path": "/api/cron/birthday-check",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 5.2 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."
DATABASE_POOL_URL="postgresql://..." # For serverless functions

# Authentication
NEXTAUTH_URL="https://waseemghaly.com/wgpersonalgrowth/app"
NEXTAUTH_SECRET="[generated-secret]"

# WebAuthn
WEBAUTHN_RP_NAME="WG Life OS"
WEBAUTHN_RP_ID="waseemghaly.com"
WEBAUTHN_ORIGIN="https://waseemghaly.com"

# Push Notifications (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="[generated-public-key]"
VAPID_PRIVATE_KEY="[generated-private-key]"
VAPID_SUBJECT="mailto:waseem@waseemghaly.com"

# Application
NEXT_PUBLIC_APP_NAME="WG Life OS"
NEXT_PUBLIC_APP_URL="https://waseemghaly.com/wgpersonalgrowth/app"

# Feature Flags
FEATURE_ACCOUNTABILITY="true"
FEATURE_INSIGHTS_AI="false" # For future AI features

# Rate Limiting
RATE_LIMIT_REQUESTS="100"
RATE_LIMIT_WINDOW="60" # seconds
```

### 5.3 Build & Deploy Process

```
┌───────────────┐
│ Git Push      │ (main branch)
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Vercel Build  │
└───────┬───────┘
        │
        ├─── Install dependencies (pnpm)
        ├─── Run type checking (tsc)
        ├─── Run linting (eslint)
        ├─── Run unit tests (vitest)
        ├─── Build Next.js
        ├─── Generate PWA assets
        └─── Build Edge Functions
        │
        ▼
┌───────────────┐
│ Database Sync │
└───────┬───────┘
        │
        ├─── Run pending migrations (drizzle-kit)
        └─── Verify schema
        │
        ▼
┌───────────────┐
│ Deploy        │
└───────┬───────┘
        │
        ├─── Deploy to Edge Network
        ├─── Update Edge Config
        ├─── Warm up Serverless Functions
        └─── Invalidate CDN cache
        │
        ▼
┌───────────────┐
│ Health Checks │
└───────┬───────┘
        │
        ├─── Ping /api/health
        ├─── Test auth flow
        ├─── Verify database connection
        └─── Check edge functions
        │
        ▼
┌───────────────┐
│ Live ✅       │
└───────────────┘
```

---

## 6. PERFORMANCE ARCHITECTURE

### 6.1 Performance Targets

```
Metric                    Target      Critical Path
─────────────────────────────────────────────────────
First Contentful Paint    < 1.0s      App shell
Largest Contentful Paint  < 2.0s      Dashboard
Time to Interactive       < 2.5s      Auth complete
First Input Delay         < 100ms     Any interaction
Cumulative Layout Shift   < 0.1       No layout shifts

Server Actions            < 500ms     Simple mutations
Server Actions (complex)  < 2.0s      Transactions
Edge Functions            < 50ms      Insights queries
API Routes                < 1.0s      External webhooks

Database Queries          < 100ms     Indexed lookups
Database Transactions     < 500ms     Multi-table writes

Offline Availability      100%        After first visit
Background Sync           < 5s        When online
Service Worker Cache      < 50ms      Static assets
```

### 6.2 Optimization Strategies

#### Code Splitting
```typescript
// Route-based code splitting (automatic in App Router)
app/
  ├── (dashboard)/      // Chunk: dashboard
  ├── goals/           // Chunk: goals
  ├── habits/          // Chunk: habits
  └── accountability/  // Chunk: accountability

// Component-level code splitting
const InsightsChart = dynamic(() => import('@/components/insights/chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Client-only heavy charts
})
```

#### Image Optimization
```typescript
// All images via Next.js Image component
import Image from 'next/image'

<Image
  src="/assets/profile-placeholder.png"
  width={128}
  height={128}
  alt="Profile"
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/..."
/>

// Icon strategy: Inline SVGs (not icon fonts)
// Branding assets: WebP with fallback
```

#### Database Optimization
```sql
-- Indexing strategy (see full SQL schema)
CREATE INDEX CONCURRENTLY idx_routines_user_date 
ON routine_logs(user_id, log_date DESC);

CREATE INDEX CONCURRENTLY idx_habits_user_active 
ON habits(user_id, archived_at) 
WHERE archived_at IS NULL;

-- Materialized views for dashboard
CREATE MATERIALIZED VIEW user_dashboard_stats AS
SELECT 
  user_id,
  COUNT(DISTINCT routine_logs.id) as routines_completed_30d,
  COUNT(DISTINCT habit_logs.id) as habit_logs_30d,
  AVG(routine_completion_rate) as avg_routine_rate
FROM users
LEFT JOIN routine_logs ON ... WHERE log_date > NOW() - INTERVAL '30 days'
GROUP BY user_id;

-- Refresh via cron
REFRESH MATERIALIZED VIEW CONCURRENTLY user_dashboard_stats;
```

#### Caching Strategy
```typescript
// React Server Components (default caching)
export default async function GoalsPage() {
  const goals = await getGoals() // Cached by default
  return <GoalsList goals={goals} />
}

// Explicit cache control
export const revalidate = 3600 // Revalidate every hour

// On-demand revalidation
'use server'
export async function updateGoal(id: string, data: GoalUpdate) {
  await db.update(goals).set(data).where(eq(goals.id, id))
  revalidatePath('/goals')
  revalidateTag(`goal-${id}`)
}

// Edge caching
export const runtime = 'edge'
export const dynamic = 'force-static'
```

---

## 7. MONITORING & OBSERVABILITY

### 7.1 Logging Strategy

```typescript
// Centralized logger
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty', // Development only
  },
})

// Structured logging
logger.info({
  action: 'goal.created',
  userId: session.user.id,
  goalId: goal.id,
  goalType: goal.type,
  duration: Date.now() - startTime,
})

// Error logging with context
logger.error({
  error: error.message,
  stack: error.stack,
  userId: session.user.id,
  action: 'routine.complete',
  metadata: { routineId, date },
})
```

### 7.2 Error Handling

```typescript
// Global error boundary
// app/error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error tracking service
    logError(error)
  }, [error])

  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}

// Server Action error handling
export async function safeServerAction<T>(
  action: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await action()
    return { success: true, data }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Unauthorized', code: 401 }
    }
    if (error instanceof ValidationError) {
      return { success: false, error: error.message, code: 400 }
    }
    // Log unexpected errors
    logger.error({ error })
    return { success: false, error: 'Internal server error', code: 500 }
  }
}
```

### 7.3 Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.all([
    checkDatabase(),
    checkEdgeFunctions(),
    checkPushService(),
  ])

  const healthy = checks.every(c => c.ok)

  return Response.json({
    status: healthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  }, {
    status: healthy ? 200 : 503,
  })
}

async function checkDatabase() {
  try {
    await db.execute(sql`SELECT 1`)
    return { service: 'database', ok: true }
  } catch (error) {
    return { service: 'database', ok: false, error: error.message }
  }
}
```

---

## 8. SCALABILITY CONSIDERATIONS

### 8.1 Current Design (1-100 users)
- Single PostgreSQL instance
- Vercel Serverless (auto-scaling)
- No caching layer needed
- Direct database queries

### 8.2 Future Growth (100-1000 users)
- Add Redis for session storage
- Implement query result caching
- Add read replicas for analytics
- Consider CDN for user-uploaded content

### 8.3 High Growth (1000+ users)
- Shard database by user_id
- Implement queue system (BullMQ)
- Add dedicated analytics database
- Consider edge caching of personalized content

**Current Decision:** Optimize for 1-100 users. YAGNI principle applied.

---

## 9. ARCHITECTURAL DECISIONS RECORD (ADR)

### ADR-001: Monolithic Next.js over Microservices
**Decision:** Use single Next.js application  
**Rationale:** Private app for single user + small circle. No need for independent scaling. Simplified deployment and debugging.  
**Trade-offs:** Harder to scale horizontally (not needed), all code in one repo (preferred for this use case).

### ADR-002: Vercel Platform over Self-hosted
**Decision:** Deploy on Vercel  
**Rationale:** Zero-config edge functions, automatic HTTPS, global CDN, integrated with Next.js, no DevOps overhead.  
**Trade-offs:** Vendor lock-in (acceptable), cost at scale (not applicable), less control over infrastructure (acceptable).

### ADR-003: PostgreSQL over NoSQL
**Decision:** Use PostgreSQL  
**Rationale:** Complex relational data (goals → habits → logs), ACID transactions needed, strong consistency required, excellent JSON support for flexibility.  
**Trade-offs:** Slightly less flexible schema (acceptable), vertical scaling limits (not a concern).

### ADR-004: Server Actions over REST API
**Decision:** Prefer Server Actions for mutations  
**Rationale:** Type-safe end-to-end, no API routes needed, automatic serialization, better DX, integrated caching.  
**Trade-offs:** Next.js specific (acceptable), less familiar pattern (learning curve acceptable).

### ADR-005: Web Push over Firebase/OneSignal
**Decision:** Native Web Push API with VAPID  
**Rationale:** No third-party dependencies, free forever, privacy-preserving, iPhone PWA compatible, full control.  
**Trade-offs:** More implementation work (acceptable), manual subscription management (acceptable).

### ADR-006: Offline-first Architecture
**Decision:** PWA with Service Worker and IndexedDB  
**Rationale:** Critical for daily habit tracking, network may not always be available, better UX, intentional design.  
**Trade-offs:** Complexity in sync logic (necessary), storage limits (acceptable for use case).

### ADR-007: No AI Features (Launch)
**Decision:** No LLM integrations initially  
**Rationale:** Privacy concerns, cost, latency, not core to MVP, can add later if needed.  
**Trade-offs:** Less "smart" insights (acceptable), manual pattern recognition (intentional).

### ADR-008: Biometric Required on Every Open
**Decision:** Force Face ID / Touch ID on every app resume  
**Rationale:** Highly sensitive personal data, diary-level intimacy, potential accountability partner access.  
**Trade-offs:** Slight friction (intentional), requires device support (acceptable for target user).

---

## 10. DISASTER RECOVERY & BUSINESS CONTINUITY

### 10.1 Backup Strategy
```
Daily:
- Automated PostgreSQL backup (Vercel/Neon)
- Retention: 30 days
- Stored in encrypted S3

Weekly:
- Full database export to JSON
- User-initiated export available anytime
- Format: Portable JSON (importable elsewhere)

On-demand:
- User can export all data via Settings
- Format: JSON + CSV
- Includes all tables + relationships
```

### 10.2 Data Recovery Procedures
```
Minor Data Loss (single record):
1. Restore from audit log
2. Replay from change log
3. Manual re-entry (last resort)

Database Corruption:
1. Restore from daily backup
2. Replay transactions from audit log
3. Verify data integrity

Complete Platform Failure:
1. User has local IndexedDB cache (last 30 days)
2. User can export from cache
3. Restore database from backup
4. Re-deploy application
5. Data loss: < 24 hours worst case
```

### 10.3 Graceful Degradation
```
Database Unavailable:
→ Serve from cache
→ Queue writes
→ Show "Offline mode" banner

Edge Functions Unavailable:
→ Skip insights generation
→ Queue for next run
→ No alerts sent (logged)

Push Service Unavailable:
→ Store notifications in DB
→ Show in-app notifications
→ Retry push later

Complete Outage:
→ PWA works offline
→ All reads from cache
→ All writes queued
→ Sync when online
```

---

**END OF SYSTEM ARCHITECTURE DOCUMENT**

This document establishes the complete architectural foundation for WG Life OS. All subsequent implementation must adhere to these architectural decisions and patterns.
