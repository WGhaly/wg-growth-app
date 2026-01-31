# MASTER IMPLEMENTATION GAP ANALYSIS & FIX PLAN
**WG Life OS - Complete Feature Audit vs Master Build Requirements**  
**Date:** January 30, 2026  
**Analysis Method:** Sequential Thinking Deep Dive  
**Scope:** 100% feature coverage, no corners cut

---

## EXECUTIVE SUMMARY

After comprehensive analysis comparing the master build requirements against current implementation, we have identified:

- **10 Complete Feature Gaps** (0% implemented)
- **30+ Database Schema Gaps** (missing fields/tables)
- **12 Architectural Issues** (wrong patterns/structure)
- **~90% of modules untested**

**Estimated Effort:** 8 weeks full-time equivalent  
**Current Completion:** ~35% of requirements implemented  
**Critical Blockers:** 5 P0 issues preventing system from being usable

---

## PART 1: COMPLETE FEATURE GAPS (0% CODE EXISTS)

### 1. Life Seasons Module ❌ MISSING ENTIRELY

**Master Doc Requirement (Section 6):**
> Profile & Life Seasons: Annual theme, goals per year, goals per age, **birthday-triggered review**, **new-age intention generation**

**What's Missing:**
- ❌ `life_seasons` table
- ❌ Birthday automation system
- ❌ Age transition triggers
- ❌ Annual theme tracking
- ❌ Goals-per-year analytics
- ❌ Goals-per-age analytics
- ❌ Life season review workflow

**Impact:** CRITICAL - This is a foundational philosophical component. The system is meant to help users reflect on life phases and set age-appropriate goals.

**Implementation Required:**

```sql
CREATE TABLE life_seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  season_name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  key_learnings TEXT,
  defining_moments TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_current_season EXCLUDE USING gist (
    user_id WITH =,
    is_current WITH =
  ) WHERE (is_current = TRUE)
);
```

Plus:
- Cron job to check birthdays daily
- Notification system for age transitions
- UI for life season creation/review
- Analytics for goals per season/age

**Estimated Effort:** 40 hours

---

### 2. Cap Table System ❌ MISSING ENTIRELY

**Master Doc Requirement (Section 14):**
> Business & Equity Module: Cap Table - Partners, Investors, Equity %, Dilution history

**What's Missing:**
- ❌ `cap_table_entries` table
- ❌ `company_products` table
- ❌ Cap table CRUD operations
- ❌ Product equity splits
- ❌ Dilution history tracking
- ❌ Cap table visualization

**Impact:** HIGH - Essential for entrepreneurs tracking multiple businesses with complex ownership structures.

**Implementation Required:**

```sql
CREATE TABLE cap_table_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stakeholder_name VARCHAR(255) NOT NULL,
  stakeholder_type VARCHAR(50) NOT NULL, -- 'founder', 'investor', 'employee', 'advisor'
  equity_percentage DECIMAL(5,2) NOT NULL,
  shares_owned BIGINT,
  investment_amount DECIMAL(15,2),
  entry_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE company_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  equity_split JSONB, -- { user_id: percentage, ... }
  revenue DECIMAL(15,2),
  is_active BOOLEAN DEFAULT TRUE,
  launched_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Estimated Effort:** 30 hours

---

### 3. Accountability System ❌ MISSING ENTIRELY

**Master Doc Requirement (Section 15):**
> Accountability (Point of Light): Invite by email, grant visibility scope, read-only, comments & prayer support

**What's Missing:**
- ❌ `accountability_links` table
- ❌ `accountability_comments` table
- ❌ `accountability_alerts` table
- ❌ Invitation system (email invites, tokens)
- ❌ Scope enforcement in queries
- ❌ Point of Light specific UI/routes
- ❌ Revocation mechanism
- ❌ Comments & prayer support features

**Impact:** CRITICAL - Core differentiator. System is meant to facilitate accountability relationships.

**Implementation Required:**

```sql
CREATE TABLE accountability_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accountability_partner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scopes_granted permission_scope[] NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'active', 'revoked'
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(owner_id, accountability_partner_id)
);

CREATE TABLE accountability_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID NOT NULL REFERENCES accountability_links(id) ON DELETE CASCADE,
  commenter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL, -- 'goal', 'habit', 'routine', 'insight'
  resource_id UUID NOT NULL,
  comment TEXT NOT NULL,
  is_prayer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE accountability_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID NOT NULL REFERENCES accountability_links(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'missed_routine', 'habit_spike', 'discipline_decay'
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID NOT NULL,
  message TEXT NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE invite_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token VARCHAR(255) UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_email VARCHAR(255) NOT NULL,
  scopes_offered permission_scope[] NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

Plus:
- Server actions: inviteAccountabilityPartner, acceptInvite, revokeAccess
- Middleware to enforce scope visibility
- Email sending for invitations
- Point of Light dashboard view
- Comment/prayer UI components

**Estimated Effort:** 60 hours

---

### 4. Edge Functions Infrastructure ❌ MISSING ENTIRELY

**Master Doc Requirement (Section 16, 23):**
> Implementation: Daily Edge Function, persist insights, trigger notifications
> The AI must define insight detection rules, define thresholds

**What's Missing:**
- ❌ `edge/` directory structure
- ❌ `edge/insights/` modules (behavioral, financial, relationship, faith)
- ❌ `edge/alerts/dispatch.ts`
- ❌ Vercel cron configuration
- ❌ vercel.json with cron schedules
- ❌ Sophisticated insight detection algorithms

**Impact:** CRITICAL - Insights engine is described as "core differentiator"

**Implementation Required:**

Directory structure:
```
edge/
├── insights/
│   ├── index.ts          # Main entry point, edge runtime
│   ├── behavioral.ts     # Consistency decay, avoidance patterns
│   ├── financial.ts      # Spending drift, stress spending
│   ├── relationship.ts   # Emotional drain correlations
│   └── faith.ts          # Prayer consistency, obedience vs resistance
└── alerts/
    └── dispatch.ts       # Alert routing and sending
```

vercel.json:
```json
{
  "crons": [
    {
      "path": "/api/cron/insights",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/notifications",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/birthdays",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Detection rules to implement:
- **Consistency Decay:** 3+ days missed on routine that was 7/7 previous week
- **Avoidance Patterns:** Recurring pattern of skipping specific routine items
- **Spending Drift:** Monthly expenses exceed baseline by >20%
- **Stress Spending:** Correlation between expense spikes and emotional logs
- **Emotional Drain:** Person interactions consistently logged as negative
- **Prayer Consistency:** 7+ days without prayer log
- **Obedience vs Resistance:** Faith reflection patterns

**Estimated Effort:** 80 hours

---

### 5. Offline-First Architecture ❌ MISSING ENTIRELY

**Master Doc Requirement (Section 9, 2):**
> UX Requirements: One-tap completion, **offline-first**, sub-30-second interaction
> PWA enabled (offline + installable)

**What's Missing:**
- ❌ IndexedDB/Local Storage persistence
- ❌ Sync queue for offline actions
- ❌ Background Sync API usage
- ❌ Optimistic UI updates
- ❌ Offline indicator
- ❌ Conflict resolution strategy

**Impact:** CRITICAL - Cannot meet "sub-30-second interaction" requirement without offline-first

**Implementation Required:**

```typescript
// lib/offline/db.ts
import Dexie from 'dexie';

export const offlineDB = new Dexie('WGLifeOS');

offlineDB.version(1).stores({
  routines: 'id, userId, syncStatus',
  routineLogs: 'id, routineId, logDate, syncStatus',
  habits: 'id, userId, syncStatus',
  habitLogs: 'id, habitId, logDate, syncStatus',
  syncQueue: '++id, action, timestamp, status'
});

// lib/offline/sync.ts
export async function syncOfflineData() {
  const queue = await offlineDB.syncQueue
    .where('status').equals('pending')
    .toArray();
  
  for (const item of queue) {
    try {
      await executeServerAction(item);
      await offlineDB.syncQueue.update(item.id, { status: 'synced' });
    } catch (error) {
      await offlineDB.syncQueue.update(item.id, { 
        status: 'error',
        error: error.message 
      });
    }
  }
}

// Service Worker with Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});
```

**Estimated Effort:** 50 hours

---

### 6. Biometric Re-Verification ❌ MISSING ENTIRELY

**Master Doc Requirement (Section 4):**
> Every app open → Face ID required
> Auto-lock after inactivity

**What's Missing:**
- ❌ Middleware to check last_biometric_verification
- ❌ Auto-lock timer
- ❌ Biometric re-verification UI flow
- ❌ Session lock state management
- ❌ Unlock screen component

**Impact:** CRITICAL - Core security requirement

**Implementation Required:**

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession();
  
  if (session?.user) {
    const lastVerification = session.user.lastBiometricVerification;
    const now = Date.now();
    const timeSinceVerification = now - new Date(lastVerification).getTime();
    
    // Require re-verification after 15 minutes
    if (timeSinceVerification > 15 * 60 * 1000) {
      return NextResponse.redirect(new URL('/unlock', request.url));
    }
  }
  
  return NextResponse.next();
}

// app/unlock/page.tsx
export default function UnlockPage() {
  const handleBiometricVerification = async () => {
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: await getChallenge(),
        rpId: window.location.hostname,
        userVerification: 'required'
      }
    });
    
    await verifyAndUpdateSession(credential);
  };
  
  return <BiometricUnlockScreen onVerify={handleBiometricVerification} />;
}

// components/BiometricLockProvider.tsx
export function BiometricLockProvider({ children }) {
  useEffect(() => {
    let inactivityTimer;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        // Auto-lock after 15 minutes inactivity
        router.push('/unlock');
      }, 15 * 60 * 1000);
    };
    
    // Reset on user activity
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    
    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);
  
  return children;
}
```

**Estimated Effort:** 30 hours

---

### 7. Birthday Automation ❌ MISSING ENTIRELY

**Master Doc Requirement (Section 6, 17):**
> Birthday-triggered review, new-age intention generation
> Birthday / age transitions notifications

**What's Missing:**
- ❌ Daily cron to check birthdays
- ❌ Age transition notification
- ❌ Birthday review workflow
- ❌ New age intention prompt

**Impact:** HIGH - Key to life seasons philosophy

**Implementation Required:**

```typescript
// edge/cron/birthdays.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  const today = new Date();
  
  // Find users with birthdays today
  const birthdayUsers = await db.query.profiles.findMany({
    where: sql`DATE_PART('month', date_of_birth) = ${today.getMonth() + 1}
               AND DATE_PART('day', date_of_birth) = ${today.getDate()}`
  });
  
  for (const user of birthdayUsers) {
    const newAge = today.getFullYear() - new Date(user.dateOfBirth).getFullYear();
    
    // Create notification
    await db.insert(notifications).values({
      userId: user.userId,
      notificationType: 'birthday',
      title: `Happy Birthday! You're now ${newAge}`,
      body: `Take time today to reflect on your ${newAge - 1}st year and set intentions for your ${newAge}th year.`,
      actionUrl: '/profile/life-seasons/review',
      priority: 'high'
    });
    
    // Create new life season if year transition
    await db.insert(lifeSeasons).values({
      userId: user.userId,
      seasonName: `Year ${newAge}`,
      startDate: today,
      isCurrent: true
    });
    
    // Mark previous season as ended
    await db.update(lifeSeasons)
      .set({ 
        endDate: today, 
        isCurrent: false 
      })
      .where(and(
        eq(lifeSeasons.userId, user.userId),
        eq(lifeSeasons.isCurrent, true),
        ne(lifeSeasons.seasonName, `Year ${newAge}`)
      ));
  }
  
  return new Response('OK', { status: 200 });
}
```

**Estimated Effort:** 20 hours

---

### 8. Biblical Reflection System ❌ MISSING ENTIRELY

**Master Doc Requirement (Section 7, 18):**
> Scripture-based reflection prompts
> One biblical reflection on Home dashboard

**What's Missing:**
- ❌ Daily scripture/reflection content
- ❌ Reflection prompt system
- ❌ Scripture API or database
- ❌ Daily rotation logic
- ❌ Reflection response tracking

**Impact:** HIGH - Faith layer is foundational to Christian focus

**Implementation Required:**

```typescript
// lib/reflections/daily.ts
interface DailyReflection {
  scripture: string;
  reference: string;
  prompt: string;
  tone: 'pastoral' | 'direct' | 'challenging';
}

const reflections: DailyReflection[] = [
  {
    scripture: "Iron sharpens iron, and one man sharpens another.",
    reference: "Proverbs 27:17",
    prompt: "Who in your life sharpens you? Are you in their life as iron, or as rust?",
    tone: 'direct'
  },
  {
    scripture: "For where your treasure is, there your heart will be also.",
    reference: "Matthew 6:21",
    prompt: "Look at your spending this week. What does it reveal about where your heart actually is?",
    tone: 'challenging'
  },
  // ... 365 reflections
];

export function getDailyReflection(): DailyReflection {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return reflections[dayOfYear % reflections.length];
}

// actions/reflections.ts
export async function recordReflectionResponse(
  reflectionId: string,
  response: string
) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  
  await db.insert(reflectionResponses).values({
    userId: session.user.id,
    reflectionId,
    response,
    respondedAt: new Date()
  });
}
```

Need to create:
- 365 scripture reflections with pastoral prompts
- reflection_responses table
- Daily reflection component for Home
- Response form/modal

**Estimated Effort:** 40 hours (content creation + implementation)

---

### 9. Relationship Evaluation Workflow ❌ MISSING ENTIRELY

**Master Doc Requirement (Section 12):**
> Partner Evaluation: Green flags, Red flags, Boundaries, Decision direction

**What's Missing:**
- ❌ Partner evaluation UI
- ❌ Decision tracking (pursue/pause/end relationship)
- ❌ Red/green flag aggregation view
- ❌ Boundary violation tracking
- ❌ Relationship health score

**Impact:** MEDIUM - Important for intentional relationship building

**Implementation Required:**

```typescript
// app/relationships/[id]/evaluate/page.tsx
export default function PersonEvaluationPage({ params }) {
  return (
    <div>
      <section>
        <h2>Green Flags</h2>
        <ul>
          {person.greenFlags.map(flag => (
            <li key={flag}>{flag}</li>
          ))}
        </ul>
        <Button onClick={() => addFlag('green')}>Add Green Flag</Button>
      </section>
      
      <section>
        <h2>Red Flags</h2>
        <ul>
          {person.redFlags.map(flag => (
            <li key={flag}>{flag}</li>
          ))}
        </ul>
        <Button onClick={() => addFlag('red')}>Add Red Flag</Button>
      </section>
      
      <section>
        <h2>Boundaries Needed</h2>
        <textarea value={person.boundariesNeeded} onChange={updateBoundaries} />
      </section>
      
      <section>
        <h2>Decision Direction</h2>
        <RadioGroup value={person.decisionDirection}>
          <Radio value="pursue">Pursue Deeper Relationship</Radio>
          <Radio value="maintain">Maintain Current Level</Radio>
          <Radio value="reduce">Reduce Interaction</Radio>
          <Radio value="end">End Relationship</Radio>
        </RadioGroup>
      </section>
      
      <section>
        <h2>Relationship Health Score</h2>
        <HealthScore 
          greenFlags={person.greenFlags.length}
          redFlags={person.redFlags.length}
          emotionalImpact={person.emotionalImpact}
          trustLevel={person.trustLevel}
        />
      </section>
    </div>
  );
}
```

**Estimated Effort:** 25 hours

---

### 10. Automated Notification Triggers ❌ MISSING ENTIRELY

**Master Doc Requirement (Section 17):**
> Web Push (VAPID): Routine reminders, Reflection prompts, Accountability alerts, Birthday / age transitions

**What's Missing:**
- ❌ Scheduled routine reminders
- ❌ Daily reflection prompt scheduling
- ❌ Accountability alert triggers
- ❌ Smart reminder timing (based on user behavior)

**Impact:** MEDIUM - Notifications exist but not triggered automatically

**Implementation Required:**

```typescript
// edge/cron/notifications.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Morning routine reminders (6 AM)
  if (currentHour === 6) {
    const morningRoutines = await db.query.routines.findMany({
      where: and(
        eq(routines.type, 'daily'),
        like(routines.targetTime, '06:%')
      ),
      with: { user: true }
    });
    
    for (const routine of morningRoutines) {
      await sendNotification(routine.userId, {
        type: 'routine_reminder',
        title: `Time for ${routine.name}`,
        body: 'Start your day with discipline',
        actionUrl: `/routines/${routine.id}/log`
      });
    }
  }
  
  // Daily reflection (8 AM)
  if (currentHour === 8) {
    const activeUsers = await db.query.users.findMany({
      where: eq(users.isActive, true)
    });
    
    const dailyReflection = getDailyReflection();
    
    for (const user of activeUsers) {
      await sendNotification(user.id, {
        type: 'reflection_prompt',
        title: dailyReflection.reference,
        body: dailyReflection.scripture.substring(0, 100),
        actionUrl: '/reflections/daily'
      });
    }
  }
  
  // Accountability alerts (check throughout day)
  const accountabilityLinks = await db.query.accountabilityLinks.findMany({
    where: eq(accountabilityLinks.status, 'active')
  });
  
  for (const link of accountabilityLinks) {
    // Check for missed routines
    const missedRoutines = await checkMissedRoutines(link.ownerId);
    if (missedRoutines.length > 0) {
      await sendNotification(link.accountabilityPartnerId, {
        type: 'accountability_alert',
        title: 'Missed Routines Alert',
        body: `${link.owner.firstName} missed ${missedRoutines.length} routines`,
        actionUrl: `/accountability/${link.ownerId}`
      });
    }
  }
  
  return new Response('OK', { status: 200 });
}
```

**Estimated Effort:** 30 hours

---

## PART 2: DATABASE SCHEMA GAPS (30+ MISSING FIELDS/TABLES)

### Goals Table - 10 Missing Fields

**Current Schema:**
```typescript
export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  category: goalCategoryEnum('category').notNull(),
  timeHorizon: timeHorizonEnum('time_horizon').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: goalStatusEnum('status').default('not_started').notNull(),
  targetDate: date('target_date'),
  completedAt: timestamp('completed_at'),
  abandonedAt: timestamp('abandoned_at'),
  abandonReason: text('abandon_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
```

**Missing Fields:**
1. ❌ `whyItMatters` TEXT NOT NULL
2. ❌ `successCriteria` TEXT NOT NULL
3. ❌ `currentProgress` INTEGER DEFAULT 0
4. ❌ `measurementMethod` VARCHAR(255)
5. ❌ `completionReflection` TEXT
6. ❌ `archivedAt` TIMESTAMPTZ (different from abandonedAt)
7. ❌ `lifeSeasonId` UUID REFERENCES life_seasons(id)

**Missing Junction Tables:**
8. ❌ `goal_habits` table (many-to-many)
9. ❌ `goal_routines` table (many-to-many)

**Wrong Enum:**
10. ❌ `timeHorizon` has wrong values (daily/weekly/monthly/quarterly/yearly/lifetime should be 1-month/3-month/6-month/1-year/5-year/lifetime)

**Fix SQL:**
```sql
-- Add missing columns
ALTER TABLE goals ADD COLUMN why_it_matters TEXT NOT NULL DEFAULT '';
ALTER TABLE goals ADD COLUMN success_criteria TEXT NOT NULL DEFAULT '';
ALTER TABLE goals ADD COLUMN current_progress INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE goals ADD COLUMN measurement_method VARCHAR(255);
ALTER TABLE goals ADD COLUMN completion_reflection TEXT;
ALTER TABLE goals ADD COLUMN archived_at TIMESTAMPTZ;
ALTER TABLE goals ADD COLUMN life_season_id UUID REFERENCES life_seasons(id) ON DELETE SET NULL;

-- Fix enum
ALTER TYPE time_horizon RENAME TO time_horizon_old;
CREATE TYPE time_horizon AS ENUM ('1-month', '3-month', '6-month', '1-year', '5-year', 'lifetime');
ALTER TABLE goals ALTER COLUMN time_horizon TYPE time_horizon USING time_horizon::text::time_horizon;
DROP TYPE time_horizon_old;

-- Create junction tables
CREATE TABLE goal_habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(goal_id, habit_id)
);

CREATE TABLE goal_routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(goal_id, routine_id)
);
```

**Update TypeScript:**
```typescript
export const goals = pgTable('goals', {
  // ... existing fields
  whyItMatters: text('why_it_matters').notNull(),
  successCriteria: text('success_criteria').notNull(),
  currentProgress: integer('current_progress').default(0).notNull(),
  measurementMethod: varchar('measurement_method', { length: 255 }),
  completionReflection: text('completion_reflection'),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  lifeSeasonId: uuid('life_season_id').references(() => lifeSeasons.id, { onDelete: 'set null' })
});

export const goalHabits = pgTable('goal_habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  habitId: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const goalRoutines = pgTable('goal_routines', {
  id: uuid('id').primaryKey().defaultRandom(),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  routineId: uuid('routine_id').notNull().references(() => routines.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
```

**Estimated Effort:** 15 hours

---

### Habits Table - 5 Missing Fields (Bad Habits)

**Master Doc Requirement (Section 10):**
> Bad Habits: Trigger, Emotional cost, Spiritual cost, Replacement habit, Reduction target

**Current Schema:**
```typescript
export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: habitTypeEnum('type').notNull(), // 'good' | 'bad'
  measurement: habitMeasurementEnum('measurement').notNull(),
  targetFrequency: varchar('target_frequency', { length: 100 }),
  targetValue: decimal('target_value', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
```

**Missing Fields:**
1. ❌ `triggerDescription` TEXT (what triggers this bad habit)
2. ❌ `emotionalCost` TEXT (how it hurts emotionally)
3. ❌ `spiritualCost` TEXT (how it distances from God)
4. ❌ `replacementHabit` VARCHAR(255) (what to do instead)
5. ❌ `reductionTarget` VARCHAR(100) (goal for reduction)

**Fix SQL:**
```sql
ALTER TABLE habits ADD COLUMN trigger_description TEXT;
ALTER TABLE habits ADD COLUMN emotional_cost TEXT;
ALTER TABLE habits ADD COLUMN spiritual_cost TEXT;
ALTER TABLE habits ADD COLUMN replacement_habit VARCHAR(255);
ALTER TABLE habits ADD COLUMN reduction_target VARCHAR(100);
```

**Update TypeScript:**
```typescript
export const habits = pgTable('habits', {
  // ... existing fields
  triggerDescription: text('trigger_description'),
  emotionalCost: text('emotional_cost'),
  spiritualCost: text('spiritual_cost'),
  replacementHabit: varchar('replacement_habit', { length: 255 }),
  reductionTarget: varchar('reduction_target', { length: 100 })
});
```

**Estimated Effort:** 5 hours

---

### People Table - 3 Missing Fields

**Master Doc Requirement (Section 11):**
> Person Fields: How we met, Why I value them, Status

**Current Schema:**
```typescript
export const people = pgTable('people', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  relationshipType: relationshipTypeEnum('relationship_type').notNull(),
  relationshipCircle: relationshipCircleEnum('relationship_circle').default('middle'),
  trustLevel: trustLevelEnum('trust_level').default('medium'),
  // ... other fields
  emotionalImpact: emotionalImpactEnum('emotional_impact').default('neutral'),
  howTheyMakeMeFeel: text('how_they_make_me_feel'),
  notes: text('notes'),
  dateOfBirth: date('date_of_birth'),
  lastContactDate: date('last_contact_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
```

**Missing Fields:**
1. ❌ `howWeMet` TEXT
2. ❌ `whyIValueThem` TEXT
3. ❌ `decisionDirection` VARCHAR(50) (for potential partners: pursue/maintain/reduce/end)

**Missing Enum Values:**
4. ❌ `relationshipCircle` should include 'friends' and 'partners' (currently only has: inner, middle, outer, distant)

**Fix SQL:**
```sql
ALTER TABLE people ADD COLUMN how_we_met TEXT;
ALTER TABLE people ADD COLUMN why_i_value_them TEXT;
ALTER TABLE people ADD COLUMN decision_direction VARCHAR(50); -- 'pursue', 'maintain', 'reduce', 'end'

-- Fix enum
ALTER TYPE relationship_circle RENAME TO relationship_circle_old;
CREATE TYPE relationship_circle AS ENUM ('inner', 'friends', 'partners', 'prayer', 'outer', 'distant');
ALTER TABLE people ALTER COLUMN relationship_circle TYPE relationship_circle USING relationship_circle::text::relationship_circle;
DROP TYPE relationship_circle_old;
```

**Update TypeScript:**
```typescript
export const relationshipCircleEnum = pgEnum('relationship_circle', [
  'inner', 'friends', 'partners', 'prayer', 'outer', 'distant'
]);

export const people = pgTable('people', {
  // ... existing fields
  howWeMet: text('how_we_met'),
  whyIValueThem: text('why_i_value_them'),
  decisionDirection: varchar('decision_direction', { length: 50 })
});
```

**Estimated Effort:** 4 hours

---

### Profiles Table - 2 Missing Fields

**Master Doc Requirement (Section 6):**
> Profile Fields: Timezone ✓, Faith: christian_biblical (fixed), Reflection depth preference

**Current Schema:**
```typescript
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').unique().notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  currentYearTheme: varchar('current_year_theme', { length: 255 }),
  currentSeasonDescription: text('current_season_description'),
  timezone: varchar('timezone', { length: 100 }).default('America/New_York').notNull(),
  notificationPreferences: jsonb('notification_preferences').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
```

**Missing Fields:**
1. ❌ `faith` VARCHAR(50) DEFAULT 'christian_biblical' (fixed value, not editable)
2. ❌ `reflectionDepthPreference` VARCHAR(50) (shallow/moderate/deep)

**Fix SQL:**
```sql
ALTER TABLE profiles ADD COLUMN faith VARCHAR(50) DEFAULT 'christian_biblical' NOT NULL;
ALTER TABLE profiles ADD COLUMN reflection_depth_preference VARCHAR(50) DEFAULT 'moderate';
```

**Update TypeScript:**
```typescript
export const profiles = pgTable('profiles', {
  // ... existing fields
  faith: varchar('faith', { length: 50 }).default('christian_biblical').notNull(),
  reflectionDepthPreference: varchar('reflection_depth_preference', { length: 50 }).default('moderate')
});
```

**Estimated Effort:** 2 hours

---

### Manifestos Table - Restructure Required

**Master Doc Requirement (Section 7):**
> Identity: Personal manifesto, "Man I am becoming", Long-term calling

**Current Schema:**
```typescript
export const manifestos = pgTable('manifestos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').unique().notNull(),
  content: text('content').notNull(),
  lastReviewedAt: timestamp('last_reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
```

**Problem:** Single `content` field, needs three separate fields

**Fix:** Rename table to `identity_statements` and add fields:
```sql
ALTER TABLE manifestos RENAME TO identity_statements;
ALTER TABLE identity_statements RENAME COLUMN content TO personal_manifesto;
ALTER TABLE identity_statements ADD COLUMN man_i_am_becoming TEXT;
ALTER TABLE identity_statements ADD COLUMN calling_statement TEXT;
```

**Update TypeScript:**
```typescript
export const identityStatements = pgTable('identity_statements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').unique().notNull(),
  personalManifesto: text('personal_manifesto'),
  manIAmBecoming: text('man_i_am_becoming'),
  callingStatement: text('calling_statement'),
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});
```

**Estimated Effort:** 3 hours

---

### Routines Table - Minimum/Ideal Item Tracking

**Master Doc Requirement (Section 9):**
> Routine Structure: Minimum standard, Ideal execution

**Current Issue:** We have `minimumDuration` and `idealDuration` but not tracking WHICH items are minimum vs ideal

**Need to Add to routine_items:**
```sql
ALTER TABLE routine_items ADD COLUMN is_minimum_standard BOOLEAN DEFAULT TRUE;
ALTER TABLE routine_items ADD COLUMN is_ideal_only BOOLEAN DEFAULT FALSE;
```

**Update TypeScript:**
```typescript
export const routineItems = pgTable('routine_items', {
  // ... existing fields
  isMinimumStandard: boolean('is_minimum_standard').default(true),
  isIdealOnly: boolean('is_ideal_only').default(false)
});
```

**Estimated Effort:** 3 hours

---

### Finance Tables - Missing Structures

**Master Doc Requirement (Section 13):**
> Personal Finance: Cash accounts (plural), Saving goals

**Current:** Only `finances` table with single `totalCash`

**Need to Add:**
```sql
CREATE TABLE cash_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- 'checking', 'savings', 'cash'
  current_balance DECIMAL(15,2) DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0 NOT NULL,
  target_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Update TypeScript:**
```typescript
export const cashAccounts = pgTable('cash_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  accountType: varchar('account_type', { length: 50 }).notNull(),
  currentBalance: decimal('current_balance', { precision: 15, scale: 2 }).default('0').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const savingsGoals = pgTable('savings_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goalName: varchar('goal_name', { length: 255 }).notNull(),
  targetAmount: decimal('target_amount', { precision: 15, scale: 2 }).notNull(),
  currentAmount: decimal('current_amount', { precision: 15, scale: 2 }).default('0').notNull(),
  targetDate: date('target_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});
```

**Estimated Effort:** 6 hours

---

### Companies Table - Missing Fields

**Master Doc Requirement (Section 14):**
> Companies: Industry, APs/liabilities

**Current Schema Missing:**
1. ❌ `industry` VARCHAR(255)
2. ❌ `accountsPayableLiabilities` DECIMAL(15,2)

**Fix SQL:**
```sql
ALTER TABLE companies ADD COLUMN industry VARCHAR(255);
ALTER TABLE companies ADD COLUMN accounts_payable_liabilities DECIMAL(15,2) DEFAULT 0;
```

**Update TypeScript:**
```typescript
export const companies = pgTable('companies', {
  // ... existing fields
  industry: varchar('industry', { length: 255 }),
  accountsPayableLiabilities: decimal('accounts_payable_liabilities', { precision: 15, scale: 2 }).default('0')
});
```

**Estimated Effort:** 2 hours

---

### Ex Relationships - Missing Fields

**Master Doc Requirement (Section 12):**
> Ex & Healing: Closure status, Forgiveness status (mentioned in docs but not in schema)

**Current Schema:** Has most fields but missing:
1. ❌ `closureStatus` VARCHAR(100)
2. ❌ `forgivenessStatus` TEXT

**Fix SQL:**
```sql
-- Note: ex_relationships table might not exist, need to check
ALTER TABLE ex_relationships ADD COLUMN closure_status VARCHAR(100);
ALTER TABLE ex_relationships ADD COLUMN forgiveness_status TEXT;
```

**Estimated Effort:** 2 hours

---

## PART 3: ARCHITECTURAL ISSUES

### Issue 1: Navigation Structure Wrong

**Master Doc Requirement (Section 19):**
> Bottom tabs: 1. Home, 2. Goals, 3. Habits, 4. People, 5. Money & Business

**Current Implementation:** 10+ routes at top level

**Fix Required:**
- Consolidate to 5 primary routes
- Move Identity, Insights, Settings to menu/profile
- Combine Finance + Business into one section
- Rename /relationships to /people
- Add bottom navigation component

**Estimated Effort:** 20 hours

---

### Issue 2: Mobile-First Responsive Incomplete

**Previous Audit:** Inconsistent responsive patterns

**Fix Required:**
- Audit all components
- Apply mobile-first Tailwind patterns systematically
- Ensure 44x44px touch targets
- Test on actual iPhone
- Full-screen modals on mobile

**Estimated Effort:** 40 hours (as previously estimated)

---

### Issue 3: Validators Don't Match Master Doc

**Multiple Issues:**
- goalSchema missing whyItMatters, successCriteria
- goalSchema has wrong timeHorizon enum
- All validators need audit

**Fix Required:**
- Update all Zod schemas to match master doc + database
- Ensure validation messages are pastoral, not technical
- Add tests for validators

**Estimated Effort:** 15 hours

---

### Issue 4: Server Actions Incomplete

**Only habits fully working, most untested**

**Fix Required:**
- Complete all CRUD actions for all modules
- Add error handling
- Add logging
- Add validation
- Test all actions

**Estimated Effort:** 60 hours

---

### Issue 5: UI Components Missing Edit Functionality

**Previous Audit:** Edit UI missing across modules

**Fix Required:**
- Create edit modals for all entities
- Wire up update actions
- Add optimistic updates
- Test edit flows

**Estimated Effort:** 30 hours

---

## PART 4: TESTING GAPS

**Current Status:** ~90% untested

**Required Testing:**

### Module CRUD Testing (120 hours)
- Goals: CREATE, READ, UPDATE, DELETE, ARCHIVE
- Routines: CREATE, READ, UPDATE, DELETE, LOG
- Habits: CREATE, READ, UPDATE, DELETE, LOG
- People: CREATE, READ, UPDATE, DELETE
- Prayer: CREATE, READ, UPDATE, DELETE, LOG
- Finance: CREATE, READ, UPDATE accounts, cash flow entries
- Business: CREATE, READ, UPDATE companies, cap table
- Identity: CREATE, READ, UPDATE manifesto/values
- Accountability: INVITE, ACCEPT, REVOKE, COMMENT
- Insights: GENERATE, ACKNOWLEDGE, DISMISS

### User Workflows (40 hours)
- Complete onboarding flow
- Daily routine logging
- Goal creation and tracking
- Habit logging (good & bad)
- Relationship evaluation
- Prayer tracking
- Finance updates
- Business updates
- Accountability partner invitation

### Security Testing (20 hours)
- Biometric verification
- Session management
- Scope enforcement
- Data isolation

### Performance Testing (15 hours)
- Offline operation
- Sync performance
- Large dataset handling
- Mobile performance

**Total Testing Effort:** 195 hours

---

## PART 5: IMPLEMENTATION PLAN (NO CORNERS CUT)

### Phase 1: Critical Blockers (Week 1-2) - 230 hours

**Priority: Fix what breaks the system**

#### Week 1:
1. ✅ Goals Module Complete Fix (40h)
   - Add all 10 missing fields to database
   - Fix timeHorizon enum
   - Update validators
   - Update CreateGoalModal with all fields
   - Update actions
   - Create junction tables
   - Test full CRUD + linking to habits/routines

2. ✅ Database Schema Completions (40h)
   - Add all missing fields to existing tables
   - Create all missing tables
   - Write migration scripts
   - Run migrations
   - Verify data integrity

#### Week 2:
3. ✅ Offline-First Architecture (50h)
   - Implement IndexedDB with Dexie
   - Create sync queue
   - Implement background sync
   - Add offline indicators
   - Test offline operation
   - Optimistic UI updates

4. ✅ Biometric Re-Verification (30h)
   - Implement unlock middleware
   - Create unlock screen
   - Add auto-lock timer
   - Test on actual iPhone
   - Add session state management

5. ✅ Edge Functions Infrastructure (40h)
   - Create edge/ directory structure
   - Implement basic insight detection modules
   - Set up Vercel cron
   - Configure vercel.json
   - Test cron triggers

6. ✅ Life Seasons Module (30h)
   - Create life_seasons table
   - Implement birthday cron
   - Build life season UI
   - Add analytics

**Phase 1 Total:** 230 hours

---

### Phase 2: Core Feature Completions (Week 3-4) - 200 hours

#### Week 3:
7. ✅ Accountability System (60h)
   - Create all accountability tables
   - Implement invitation system
   - Build scope enforcement
   - Create Point of Light UI
   - Test full workflow

8. ✅ Identity Module Complete (20h)
   - Restructure manifestos table
   - Add man_i_am_becoming field
   - Add calling_statement field
   - Update UI to show 3 sections
   - Test identity updates

9. ✅ Bad Habits Spiritual Tracking (15h)
   - Add 5 missing fields
   - Update habit forms
   - Add spiritual cost UI
   - Test bad habit logging

#### Week 4:
10. ✅ Cap Table & Products (30h)
    - Create cap_table_entries table
    - Create company_products table
    - Build cap table UI
    - Add product management
    - Test equity tracking

11. ✅ Home Dashboard Redesign (25h)
    - Implement "one of each" design
    - One habit focus logic
    - One relationship reminder
    - Biblical reflection component
    - Alerts section

12. ✅ Navigation Restructure (20h)
    - Consolidate to 5 tabs
    - Bottom navigation component
    - Move routes to correct sections
    - Test navigation flow

13. ✅ Automated Notifications (30h)
    - Routine reminder scheduling
    - Reflection prompt scheduling
    - Accountability alerts
    - Birthday notifications
    - Test notification delivery

**Phase 2 Total:** 200 hours

---

### Phase 3: Feature Enrichments (Week 5-6) - 150 hours

#### Week 5:
14. ✅ Biblical Reflection System (40h)
    - Create 365 reflections
    - Build reflection_responses table
    - Daily reflection component
    - Response tracking
    - Test rotation

15. ✅ Relationship Evaluation (25h)
    - Build evaluation UI
    - Decision direction tracking
    - Health score algorithm
    - Test evaluation flow

16. ✅ Routines Minimum/Ideal (15h)
    - Add item-level flags
    - Update routine logging
    - Show completion level
    - Test minimum vs ideal

17. ✅ Finance Multi-Account (20h)
    - Create cash_accounts table
    - Create savings_goals table
    - Build account management UI
    - Test account tracking

#### Week 6:
18. ✅ Sophisticated Insight Detection (50h)
    - Implement consistency decay algorithm
    - Implement avoidance patterns
    - Implement spending drift
    - Implement stress spending correlation
    - Implement emotional drain detection
    - Implement prayer consistency
    - Implement obedience vs resistance
    - Test all detection rules

**Phase 3 Total:** 150 hours

---

### Phase 4: Mobile-First & UI Polish (Week 7) - 80 hours

19. ✅ Mobile-First Responsive (40h)
    - Systematic component audit
    - Apply responsive patterns
    - 44x44px touch targets
    - Full-screen mobile modals
    - Typography scaling
    - Test on iPhone

20. ✅ Edit Functionality UI (30h)
    - Create edit modals for all entities
    - Wire up update actions
    - Add optimistic updates
    - Test edit flows

21. ✅ UI Polish (10h)
    - Consistent spacing
    - Loading states
    - Error states
    - Empty states
    - Animations

**Phase 4 Total:** 80 hours

---

### Phase 5: Comprehensive Testing (Week 8-10) - 195 hours

#### Week 8-9: Module Testing (120h)
22. ✅ Test All Modules CRUD
    - Goals (15h)
    - Routines (15h)
    - Habits (15h)
    - People (10h)
    - Prayer (10h)
    - Finance (10h)
    - Business (10h)
    - Identity (10h)
    - Accountability (15h)
    - Insights (10h)

#### Week 9-10: Workflow & Security Testing (75h)
23. ✅ User Workflows (40h)
    - Onboarding
    - Daily usage
    - Goal tracking
    - Habit logging
    - Relationship management
    - Finance updates
    - Business updates
    - Accountability flows

24. ✅ Security Testing (20h)
    - Authentication flows
    - Biometric verification
    - Session management
    - Scope enforcement
    - Data isolation

25. ✅ Performance Testing (15h)
    - Offline operation
    - Sync performance
    - Large datasets
    - Mobile performance

**Phase 5 Total:** 195 hours

---

## TOTAL IMPLEMENTATION EFFORT

| Phase | Duration | Hours |
|-------|----------|-------|
| Phase 1: Critical Blockers | Week 1-2 | 230 |
| Phase 2: Core Completions | Week 3-4 | 200 |
| Phase 3: Feature Enrichments | Week 5-6 | 150 |
| Phase 4: Mobile & UI | Week 7 | 80 |
| Phase 5: Testing | Week 8-10 | 195 |
| **TOTAL** | **10 weeks** | **855 hours** |

**At 40 hours/week:** 21.4 weeks (~5 months)  
**At 60 hours/week:** 14.3 weeks (~3.5 months)

---

## PRIORITIZATION MATRIX

### Must Have (P0) - Blocks Core Functionality
1. Goals module complete fix
2. Offline-first architecture
3. Biometric re-verification
4. Edge functions infrastructure
5. Life seasons module
6. Accountability system
7. Database schema completions

### Should Have (P1) - Core Features
8. Identity module complete
9. Bad habits spiritual tracking
10. Cap table & products
11. Home dashboard redesign
12. Navigation restructure
13. Automated notifications
14. Biblical reflection system

### Nice to Have (P2) - Enrichments
15. Relationship evaluation
16. Routines minimum/ideal
17. Finance multi-account
18. Sophisticated insights
19. Mobile-first polish
20. Edit functionality

### Polish (P3) - Quality of Life
21. UI polish
22. Comprehensive testing
23. Performance optimization

---

## RISK ASSESSMENT

### High Risk Items
1. **Offline-first architecture** - Complex, may impact existing functionality
2. **Accountability scope enforcement** - Query complexity, potential performance issues
3. **Biometric re-verification** - Platform-specific, may not work perfectly on all devices
4. **Edge functions** - Vercel cron limits, cold starts

### Medium Risk Items
5. **Biblical reflections** - Content creation time
6. **Insight detection** - Algorithm complexity
7. **Mobile responsive** - Time-consuming, easy to miss edge cases

### Mitigation Strategies
- Implement offline-first incrementally (routines first, then expand)
- Build accountability with thorough testing in staging
- Test biometric extensively on real devices
- Monitor edge function execution carefully
- Consider user-generated biblical reflections if time-constrained
- Use simple heuristics for insights initially, sophisticate over time
- Prioritize mobile testing throughout, not just at end

---

## DEPENDENCIES & BLOCKERS

### Before Starting Phase 1:
- ✅ Confirm database migration approach
- ✅ Verify Vercel cron availability
- ✅ Test biometric API on target iPhone

### Before Starting Phase 2:
- ✅ Phase 1 complete and tested
- ✅ Database migrations run successfully
- ✅ Offline sync tested thoroughly

### Before Starting Phase 3:
- ✅ Phase 2 complete and tested
- ✅ Accountability system verified with real accounts
- ✅ Biblical reflections content ready

### Before Starting Phase 4:
- ✅ Phase 3 complete
- ✅ All features functionally complete
- ✅ Ready for polish only

### Before Starting Phase 5:
- ✅ All features implemented
- ✅ All UI polish complete
- ✅ Staging environment ready

---

## SUCCESS CRITERIA

### Phase 1 Success:
- [ ] Goals CRUD works end-to-end
- [ ] All database migrations successful
- [ ] Routines log offline, sync when online
- [ ] Face ID required every 15 minutes
- [ ] Insights cron runs daily

### Phase 2 Success:
- [ ] Can invite accountability partner
- [ ] Partner sees granted data only
- [ ] Identity has 3 distinct sections
- [ ] Bad habits track spiritual cost
- [ ] Cap table shows equity splits
- [ ] Home shows one of each item
- [ ] 5 tabs navigation works
- [ ] Notifications sent automatically

### Phase 3 Success:
- [ ] Daily biblical reflection displayed
- [ ] Can evaluate relationships
- [ ] Routines show minimum vs ideal
- [ ] Multiple savings goals tracked
- [ ] Insights detect patterns accurately

### Phase 4 Success:
- [ ] App looks good on iPhone
- [ ] All touch targets 44x44px
- [ ] Can edit all entities
- [ ] UI feels polished

### Phase 5 Success:
- [ ] All modules tested
- [ ] All workflows tested
- [ ] Security verified
- [ ] Performance acceptable

---

## CONCLUSION

This implementation gap analysis reveals that while approximately 35% of the master requirements are implemented, critical foundational pieces are missing:

- **10 complete feature gaps** requiring new development
- **30+ schema gaps** requiring database migrations
- **12 architectural issues** requiring refactoring
- **~90% untested** requiring comprehensive QA

The master document's instruction **"Do not simplify. Do not remove modules."** has been violated in several areas:

1. Life Seasons module completely skipped
2. Cap Table & Products tables skipped
3. Accountability system only partially implemented
4. Edge Functions not created
5. Offline-first not implemented
6. Many required fields omitted

**The path forward is clear:** 10 weeks of focused, uncompromising implementation following the phases outlined above. No shortcuts. No "we'll add that later." Build it right the first time according to the master specification.

**This system is meant to be a mirror, compass, accountability covenant, and life archive.** It cannot fulfill that purpose with 35% implementation. It needs 100%.

---

**End of Gap Analysis**
