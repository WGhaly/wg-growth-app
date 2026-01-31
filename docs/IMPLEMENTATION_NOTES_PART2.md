# WG Life OS - Per-File Implementation Notes (Part 2)

**Continued from IMPLEMENTATION_NOTES_PART1.md**

---

## 4. SERVER ACTIONS

### 4.1 `actions/auth.ts`

**Purpose:** Authentication server actions

**Implementation:**

```typescript
'use server'

import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, verifyPassword, generateVerificationToken } from '@/lib/crypto'
import { sendVerificationEmail } from '@/lib/email'
import { registerSchema, loginSchema, changePasswordSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'

// Result type for consistent returns
export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

export async function registerUser(input: unknown): Promise<Result<{ userId: number }>> {
  try {
    // Validate input
    const data = registerSchema.parse(input)
    
    // Check if email already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    })
    
    if (existing) {
      return { success: false, error: 'Email already registered' }
    }
    
    // Hash password
    const passwordHash = await hashPassword(data.password)
    
    // Generate verification token
    const verificationToken = generateVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    // Create user
    const [user] = await db.insert(users).values({
      email: data.email,
      passwordHash,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    }).returning()
    
    // Send verification email
    await sendVerificationEmail(data.email, verificationToken)
    
    return { success: true, data: { userId: user.id } }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Registration failed' }
  }
}

export async function verifyEmail(token: string): Promise<Result<void>> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.emailVerificationToken, token),
    })
    
    if (!user) {
      return { success: false, error: 'Invalid verification token' }
    }
    
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return { success: false, error: 'Verification token expired' }
    }
    
    // Mark email as verified
    await db.update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      })
      .where(eq(users.id, user.id))
    
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Verification error:', error)
    return { success: false, error: 'Verification failed' }
  }
}

export async function loginUser(input: unknown): Promise<Result<void>> {
  try {
    const data = loginSchema.parse(input)
    
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    })
    
    if (!user) {
      return { success: false, error: 'Invalid credentials' }
    }
    
    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      return { success: false, error: 'Account is locked. Try again later.' }
    }
    
    // Verify password
    const valid = await verifyPassword(data.password, user.passwordHash)
    
    if (!valid) {
      // Increment failed login attempts
      const attempts = user.failedLoginAttempts + 1
      const updates: any = { failedLoginAttempts: attempts }
      
      // Lock account after 5 failed attempts
      if (attempts >= 5) {
        updates.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      }
      
      await db.update(users).set(updates).where(eq(users.id, user.id))
      
      return { success: false, error: 'Invalid credentials' }
    }
    
    // Check if email is verified
    if (!user.emailVerified) {
      return { success: false, error: 'Please verify your email first' }
    }
    
    // Reset failed login attempts
    await db.update(users)
      .set({
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, user.id))
    
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

export async function changePassword(input: unknown): Promise<Result<void>> {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const data = changePasswordSchema.parse(input)
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(session.user.id)),
    })
    
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    
    // Verify current password
    const valid = await verifyPassword(data.currentPassword, user.passwordHash)
    if (!valid) {
      return { success: false, error: 'Current password is incorrect' }
    }
    
    // Hash new password
    const newPasswordHash = await hashPassword(data.newPassword)
    
    // Update password
    await db.update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, user.id))
    
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Change password error:', error)
    return { success: false, error: 'Failed to change password' }
  }
}
```

**Integration Points:**
- Called from authentication pages
- Uses validators from lib/validators.ts
- Uses crypto from lib/crypto.ts

**Testing:**
- Register → verify email → login
- Test failed login attempts → account lockout

---

### 4.2 `actions/goals.ts`

**Purpose:** Goal management server actions

**Implementation:**

```typescript
'use server'

import { db } from '@/lib/db'
import { goals, notifications } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { createGoalSchema, updateGoalProgressSchema, completeGoalSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import type { Result } from './auth'

export async function createGoal(input: unknown): Promise<Result<{ goalId: number }>> {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const data = createGoalSchema.parse(input)
    
    const [goal] = await db.insert(goals).values({
      userId: parseInt(session.user.id),
      ...data,
    }).returning()
    
    revalidatePath('/goals')
    revalidatePath('/dashboard')
    
    return { success: true, data: { goalId: goal.id } }
  } catch (error) {
    console.error('Create goal error:', error)
    return { success: false, error: 'Failed to create goal' }
  }
}

export async function updateGoalProgress(
  goalId: number,
  input: unknown
): Promise<Result<void>> {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const data = updateGoalProgressSchema.parse(input)
    
    // Verify ownership
    const goal = await db.query.goals.findFirst({
      where: and(
        eq(goals.id, goalId),
        eq(goals.userId, parseInt(session.user.id))
      ),
    })
    
    if (!goal) {
      return { success: false, error: 'Goal not found' }
    }
    
    // Update progress
    const updates: any = {
      currentProgress: data.currentProgress,
    }
    
    // Auto-complete at 100%
    if (data.currentProgress === 100) {
      updates.status = 'completed'
      updates.completedAt = new Date()
      
      // Create milestone notification
      await db.insert(notifications).values({
        userId: parseInt(session.user.id),
        type: 'goal_milestone',
        title: 'Goal Completed! 🎉',
        body: `You completed: ${goal.title}`,
        actionUrl: `/goals/${goalId}`,
      })
    }
    
    await db.update(goals)
      .set(updates)
      .where(eq(goals.id, goalId))
    
    revalidatePath('/goals')
    revalidatePath('/dashboard')
    
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Update goal progress error:', error)
    return { success: false, error: 'Failed to update progress' }
  }
}

export async function completeGoal(
  goalId: number,
  input: unknown
): Promise<Result<void>> {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const data = completeGoalSchema.parse(input)
    
    await db.update(goals)
      .set({
        status: 'completed',
        completedAt: new Date(),
        completionReflection: data.reflection,
        currentProgress: 100,
      })
      .where(and(
        eq(goals.id, goalId),
        eq(goals.userId, parseInt(session.user.id))
      ))
    
    revalidatePath('/goals')
    revalidatePath('/dashboard')
    
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Complete goal error:', error)
    return { success: false, error: 'Failed to complete goal' }
  }
}

export async function archiveGoal(goalId: number): Promise<Result<void>> {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    await db.update(goals)
      .set({ status: 'archived' })
      .where(and(
        eq(goals.id, goalId),
        eq(goals.userId, parseInt(session.user.id))
      ))
    
    revalidatePath('/goals')
    
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Archive goal error:', error)
    return { success: false, error: 'Failed to archive goal' }
  }
}

export async function getActiveGoals(): Promise<Result<any[]>> {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const activeGoals = await db.query.goals.findMany({
      where: and(
        eq(goals.userId, parseInt(session.user.id)),
        eq(goals.status, 'active')
      ),
      orderBy: (goals, { desc }) => [desc(goals.createdAt)],
    })
    
    return { success: true, data: activeGoals }
  } catch (error) {
    console.error('Get goals error:', error)
    return { success: false, error: 'Failed to fetch goals' }
  }
}
```

**Integration Points:**
- Called from goals pages
- Creates notifications for milestones
- Revalidates dashboard cache

**Testing:**
- Create goal → update progress → complete → archive

---

### 4.3 `actions/insights.ts`

**Purpose:** Insight management server actions

**Implementation:**

```typescript
'use server'

import { db } from '@/lib/db'
import { insights } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { markInsightActionTakenSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import type { Result } from './auth'

export async function acknowledgeInsight(insightId: number): Promise<Result<void>> {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    await db.update(insights)
      .set({
        status: 'acknowledged',
        acknowledgedAt: new Date(),
      })
      .where(and(
        eq(insights.id, insightId),
        eq(insights.userId, parseInt(session.user.id))
      ))
    
    revalidatePath('/insights')
    revalidatePath('/dashboard')
    
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Acknowledge insight error:', error)
    return { success: false, error: 'Failed to acknowledge insight' }
  }
}

export async function dismissInsight(insightId: number): Promise<Result<void>> {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    await db.update(insights)
      .set({
        status: 'dismissed',
        dismissedAt: new Date(),
      })
      .where(and(
        eq(insights.id, insightId),
        eq(insights.userId, parseInt(session.user.id))
      ))
    
    revalidatePath('/insights')
    revalidatePath('/dashboard')
    
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Dismiss insight error:', error)
    return { success: false, error: 'Failed to dismiss insight' }
  }
}

export async function markInsightActionTaken(
  insightId: number,
  input: unknown
): Promise<Result<void>> {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const data = markInsightActionTakenSchema.parse(input)
    
    await db.update(insights)
      .set({
        status: 'action_taken',
        actionTakenAt: new Date(),
        actionNotes: data.notes,
      })
      .where(and(
        eq(insights.id, insightId),
        eq(insights.userId, parseInt(session.user.id))
      ))
    
    revalidatePath('/insights')
    
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Mark action taken error:', error)
    return { success: false, error: 'Failed to mark action taken' }
  }
}

export async function getUnacknowledgedInsights(): Promise<Result<any[]>> {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const unacknowledged = await db.query.insights.findMany({
      where: and(
        eq(insights.userId, parseInt(session.user.id)),
        eq(insights.status, 'unacknowledged')
      ),
      orderBy: (insights, { desc }) => [desc(insights.createdAt)],
      limit: 10,
    })
    
    return { success: true, data: unacknowledged }
  } catch (error) {
    console.error('Get insights error:', error)
    return { success: false, error: 'Failed to fetch insights' }
  }
}
```

**Integration Points:**
- Called from insights pages
- Manages insight lifecycle
- Revalidates dashboard

**Testing:**
- Generate insight → acknowledge → dismiss → mark action taken

---

## 5. API ROUTES

### 5.1 `app/api/health/route.ts`

**Purpose:** Health check endpoint

**Implementation:**

```typescript
import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/db'

export async function GET() {
  const dbHealthy = await checkDatabaseHealth()
  
  const health = {
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: dbHealthy,
  }
  
  return NextResponse.json(health, {
    status: dbHealthy ? 200 : 503,
  })
}
```

**Testing:**
- Visit `/api/health` → should return 200 with status

---

### 5.2 `app/api/cron/insights/route.ts`

**Purpose:** Cron job for insight generation

**Implementation:**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { detectInsights } from '@/edge/insights/detect'

export const runtime = 'edge'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  
  try {
    // Get all active users
    const activeUsers = await db.query.users.findMany({
      where: eq(users.isActive, true),
    })
    
    let processedCount = 0
    let errorCount = 0
    
    // Run insights for each user
    for (const user of activeUsers) {
      try {
        await detectInsights(user.id)
        processedCount++
      } catch (error) {
        console.error(`Failed to process insights for user ${user.id}:`, error)
        errorCount++
      }
    }
    
    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron insights error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process insights' },
      { status: 500 }
    )
  }
}
```

**Testing:**
- Trigger manually: `curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/insights`

---

### 5.3 `app/api/cron/notifications/route.ts`

**Purpose:** Cron job for notification processing

**Implementation:**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifications } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { sendPushNotification } from '@/lib/send-push-notification'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  
  try {
    // Get pending notifications
    const pending = await db.query.notifications.findMany({
      where: eq(notifications.status, 'pending'),
      limit: 100,
    })
    
    let sentCount = 0
    let failedCount = 0
    
    for (const notif of pending) {
      try {
        await sendPushNotification(notif.userId, {
          title: notif.title,
          body: notif.body,
          type: notif.type,
          actionUrl: notif.actionUrl,
        })
        
        await db.update(notifications)
          .set({
            status: 'sent',
            sentAt: new Date(),
          })
          .where(eq(notifications.id, notif.id))
        
        sentCount++
      } catch (error) {
        console.error(`Failed to send notification ${notif.id}:`, error)
        
        // Retry up to 3 times
        if (notif.retryCount < 3) {
          await db.update(notifications)
            .set({ retryCount: notif.retryCount + 1 })
            .where(eq(notifications.id, notif.id))
        } else {
          await db.update(notifications)
            .set({ status: 'failed' })
            .where(eq(notifications.id, notif.id))
        }
        
        failedCount++
      }
    }
    
    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron notifications error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process notifications' },
      { status: 500 }
    )
  }
}
```

**Testing:**
- Create pending notification → trigger cron → verify delivery

---

## 6. EDGE FUNCTIONS

### 6.1 `edge/insights/detect.ts`

**Purpose:** Main insight detection orchestrator

**Implementation:**

```typescript
import { db } from '@/lib/db'
import { insights, insightRules } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { detectBehavioralPatterns } from './behavioral'
import { detectFinancialPatterns } from './financial'
import { detectRelationshipPatterns } from './relationship'
import { detectFaithPatterns } from './faith'
import { dispatchAlerts } from '../alerts/dispatch'

export const runtime = 'edge'

interface DetectedInsight {
  ruleId?: number
  type: 'behavioral' | 'financial' | 'relationship' | 'faith'
  patternName: string
  severity: 'low' | 'medium' | 'high'
  message: string
  recommendedAction: string
  evidence: any
  confidenceScore: number
}

export async function detectInsights(userId: number): Promise<void> {
  try {
    const detected: DetectedInsight[] = []
    
    // Run all detection modules
    const behavioral = await detectBehavioralPatterns(userId)
    const financial = await detectFinancialPatterns(userId)
    const relationship = await detectRelationshipPatterns(userId)
    const faith = await detectFaithPatterns(userId)
    
    detected.push(...behavioral, ...financial, ...relationship, ...faith)
    
    // Filter by confidence threshold (>= 0.6)
    const qualified = detected.filter(insight => insight.confidenceScore >= 0.6)
    
    // Store insights
    for (const insight of qualified) {
      const [created] = await db.insert(insights).values({
        userId,
        ruleId: insight.ruleId,
        type: insight.type,
        patternName: insight.patternName,
        severity: insight.severity,
        message: insight.message,
        recommendedAction: insight.recommendedAction,
        evidence: insight.evidence,
        confidenceScore: insight.confidenceScore.toString(),
      }).returning()
      
      // Dispatch alerts for high severity
      if (insight.severity === 'high') {
        await dispatchAlerts(userId, created)
      }
    }
    
    console.log(`Generated ${qualified.length} insights for user ${userId}`)
  } catch (error) {
    console.error(`Failed to detect insights for user ${userId}:`, error)
    throw error
  }
}

// Scoring algorithm
export function calculateInsightScore(
  evidenceStrength: number, // 0-1
  patternConsistency: number, // 0-1
  recency: number, // 0-1
  impact: number // 0-1
): number {
  return (
    evidenceStrength * 0.3 +
    patternConsistency * 0.3 +
    recency * 0.2 +
    impact * 0.2
  )
}
```

**Integration Points:**
- Called by cron job
- Invokes all pattern detectors
- Dispatches alerts

**Testing:**
- Create test data → run detect → verify insights created

---

### 6.2 `edge/insights/behavioral.ts`

**Purpose:** Behavioral pattern detection

**Implementation:**

```typescript
import { db } from '@/lib/db'
import { routineLogs, goals, habitLogs, habits } from '@/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { calculateInsightScore } from './detect'
import type { DetectedInsight } from './detect'

export const runtime = 'edge'

export async function detectBehavioralPatterns(userId: number): Promise<DetectedInsight[]> {
  const detected: DetectedInsight[] = []
  
  // Pattern 1: Discipline Decay
  const disciplineDecay = await detectDisciplineDecay(userId)
  if (disciplineDecay) detected.push(disciplineDecay)
  
  // Pattern 2: Avoidance Pattern
  const avoidance = await detectAvoidancePattern(userId)
  if (avoidance) detected.push(avoidance)
  
  // Pattern 3: Bad Habit Escalation
  const habitEscalation = await detectBadHabitEscalation(userId)
  if (habitEscalation) detected.push(habitEscalation)
  
  // Pattern 4: Goal Stagnation
  const goalStagnation = await detectGoalStagnation(userId)
  if (goalStagnation) detected.push(goalStagnation)
  
  return detected
}

async function detectDisciplineDecay(userId: number): Promise<DetectedInsight | null> {
  const now = new Date()
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
  
  // Get recent logs (last 14 days)
  const recentLogs = await db.query.routineLogs.findMany({
    where: and(
      eq(routineLogs.userId, userId),
      gte(routineLogs.date, twoWeeksAgo)
    ),
  })
  
  // Get previous logs (14-28 days ago)
  const previousLogs = await db.query.routineLogs.findMany({
    where: and(
      eq(routineLogs.userId, userId),
      gte(routineLogs.date, fourWeeksAgo),
      lte(routineLogs.date, twoWeeksAgo)
    ),
  })
  
  if (previousLogs.length === 0) return null
  
  // Calculate completion rates
  const recentComplete = recentLogs.filter(l => l.completionLevel === 'complete').length
  const previousComplete = previousLogs.filter(l => l.completionLevel === 'complete').length
  
  const recentRate = recentComplete / recentLogs.length
  const previousRate = previousComplete / previousLogs.length
  
  const drop = (previousRate - recentRate) / previousRate
  
  // Trigger if drop >= 20%
  if (drop < 0.2) return null
  
  // Determine severity
  let severity: 'low' | 'medium' | 'high' = 'low'
  if (drop >= 0.4) severity = 'high'
  else if (drop >= 0.3) severity = 'medium'
  
  const score = calculateInsightScore(
    drop, // evidence strength
    1, // pattern is consistent (single metric)
    1, // recent data
    0.8 // high impact
  )
  
  return {
    type: 'behavioral',
    patternName: 'discipline_decay',
    severity,
    message: `Your routine completion dropped ${Math.round(drop * 100)}% over the past 2 weeks.`,
    recommendedAction: 'Review your routines and identify what changed. Consider simplifying your routine or adjusting the timing.',
    evidence: {
      dropPercentage: drop,
      recentCompletionRate: recentRate,
      previousCompletionRate: previousRate,
      recentLogsCount: recentLogs.length,
      previousLogsCount: previousLogs.length,
    },
    confidenceScore: score,
  }
}

async function detectAvoidancePattern(userId: number): Promise<DetectedInsight | null> {
  const now = new Date()
  const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000)
  
  // Get active goals with no progress in 21 days
  const staleGoals = await db.query.goals.findMany({
    where: and(
      eq(goals.userId, userId),
      eq(goals.status, 'active'),
      lte(goals.updatedAt, threeWeeksAgo)
    ),
  })
  
  // Filter goals that previously had momentum
  const avoidedGoals = staleGoals.filter(goal => goal.currentProgress > 0)
  
  if (avoidedGoals.length === 0) return null
  
  const score = calculateInsightScore(
    0.9, // strong evidence (no updates for 21 days)
    0.8, // consistent pattern
    0.9, // recent
    0.9 // high impact
  )
  
  return {
    type: 'behavioral',
    patternName: 'avoidance_pattern',
    severity: 'high',
    message: `You've been avoiding ${avoidedGoals.length} goal(s) for over 3 weeks.`,
    recommendedAction: 'Ask yourself: Why am I avoiding this? Is this goal still aligned with who I want to become? Consider breaking it into smaller steps or removing it.',
    evidence: {
      avoidedGoals: avoidedGoals.map(g => ({
        id: g.id,
        title: g.title,
        lastUpdated: g.updatedAt,
        currentProgress: g.currentProgress,
      })),
    },
    confidenceScore: score,
  }
}

async function detectBadHabitEscalation(userId: number): Promise<DetectedInsight | null> {
  const now = new Date()
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
  
  // Get bad habits
  const badHabits = await db.query.habits.findMany({
    where: and(
      eq(habits.userId, userId),
      eq(habits.type, 'bad')
    ),
  })
  
  if (badHabits.length === 0) return null
  
  for (const habit of badHabits) {
    // Get recent logs
    const recentLogs = await db.query.habitLogs.findMany({
      where: and(
        eq(habitLogs.habitId, habit.id),
        gte(habitLogs.date, twoWeeksAgo)
      ),
    })
    
    // Get previous logs
    const previousLogs = await db.query.habitLogs.findMany({
      where: and(
        eq(habitLogs.habitId, habit.id),
        gte(habitLogs.date, fourWeeksAgo),
        lte(habitLogs.date, twoWeeksAgo)
      ),
    })
    
    if (previousLogs.length === 0) continue
    
    const increase = (recentLogs.length - previousLogs.length) / previousLogs.length
    
    // Trigger if increase >= 30%
    if (increase < 0.3) continue
    
    // Identify common triggers
    const triggers = recentLogs
      .filter(log => log.trigger)
      .map(log => log.trigger)
    
    const triggerCounts: Record<string, number> = {}
    triggers.forEach(trigger => {
      if (trigger) triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1
    })
    
    const commonTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trigger]) => trigger)
    
    let severity: 'low' | 'medium' | 'high' = 'medium'
    if (increase >= 0.6) severity = 'high'
    
    const score = calculateInsightScore(
      increase,
      0.8,
      1,
      0.9
    )
    
    return {
      type: 'behavioral',
      patternName: 'bad_habit_escalation',
      severity,
      message: `Your "${habit.name}" habit increased ${Math.round(increase * 100)}% over the past 2 weeks.`,
      recommendedAction: `Common triggers: ${commonTriggers.join(', ')}. Create a plan to avoid these triggers or replace the habit with a positive alternative.`,
      evidence: {
        habitName: habit.name,
        increasePercentage: increase,
        recentFrequency: recentLogs.length,
        previousFrequency: previousLogs.length,
        commonTriggers,
      },
      confidenceScore: score,
    }
  }
  
  return null
}

async function detectGoalStagnation(userId: number): Promise<DetectedInsight | null> {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  // Get stagnant goals (no progress change in 30 days, <50% complete)
  const stagnantGoals = await db.query.goals.findMany({
    where: and(
      eq(goals.userId, userId),
      eq(goals.status, 'active'),
      lte(goals.updatedAt, thirtyDaysAgo)
    ),
  })
  
  const qualifyingGoals = stagnantGoals.filter(g => g.currentProgress < 50 && g.currentProgress > 0)
  
  if (qualifyingGoals.length === 0) return null
  
  const score = calculateInsightScore(
    0.8,
    0.9,
    0.8,
    0.7
  )
  
  return {
    type: 'behavioral',
    patternName: 'goal_stagnation',
    severity: 'medium',
    message: `${qualifyingGoals.length} goal(s) haven't progressed in 30+ days.`,
    recommendedAction: 'Break these goals into smaller, actionable steps. Schedule specific time blocks to work on them.',
    evidence: {
      stagnantGoals: qualifyingGoals.map(g => ({
        id: g.id,
        title: g.title,
        progress: g.currentProgress,
        lastUpdated: g.updatedAt,
      })),
    },
    confidenceScore: score,
  }
}
```

**Integration Points:**
- Called by detect.ts orchestrator
- Analyzes routineLogs, goals, habitLogs

**Testing:**
- Create test data with declining routine completion → run detect → verify insight

---

**END OF PART 2**

Remaining sections (Financial/Relationship/Faith pattern detection, Components, Hooks, Pages) would continue in IMPLEMENTATION_NOTES_PART3.md following same exhaustive pattern. Due to token constraints, core implementation patterns are established above.