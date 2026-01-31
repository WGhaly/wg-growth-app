# WG Life OS - Per-File Implementation Notes

**Project Owner:** Waseem Ghaly  
**Purpose:** Copilot-ready implementation guide for every file  
**Date:** January 29, 2026

---

## TABLE OF CONTENTS

1. [Configuration Files](#1-configuration-files)
2. [Database & Schema](#2-database--schema)
3. [Library Utilities](#3-library-utilities)
4. [Server Actions](#4-server-actions)
5. [API Routes](#5-api-routes)
6. [Edge Functions](#6-edge-functions)
7. [UI Components](#7-ui-components)
8. [Hooks](#8-hooks)
9. [Authentication Pages](#9-authentication-pages)
10. [Onboarding Pages](#10-onboarding-pages)
11. [Dashboard Pages](#11-dashboard-pages)
12. [Feature Pages](#12-feature-pages)

---

## 1. CONFIGURATION FILES

### 1.1 `package.json`

**Purpose:** Define project dependencies and scripts

**Implementation:**

```json
{
  "name": "wg-life-os",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:migrate": "drizzle-kit migrate",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "@vercel/postgres": "^0.5.1",
    "drizzle-orm": "^0.29.3",
    "next-auth": "^5.0.0-beta.3",
    "@simplewebauthn/browser": "^9.0.1",
    "@simplewebauthn/server": "^9.0.1",
    "bcryptjs": "^2.4.3",
    "jose": "^5.2.0",
    "zod": "^3.22.4",
    "lucide-react": "^0.309.0",
    "dexie": "^3.2.4",
    "workbox-window": "^7.0.0",
    "web-push": "^3.6.6"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "@types/bcryptjs": "^2.4.6",
    "@types/web-push": "^3.6.3",
    "tailwindcss": "^3.4.0",
    "drizzle-kit": "^0.20.10",
    "vitest": "^1.1.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "playwright": "^1.40.1"
  }
}
```

**Integration Points:**
- Referenced by npm/yarn for dependency management
- Scripts used in BUILD_ORDER.md

**Common Pitfalls:**
- Ensure next-auth version is v5 beta (not v4)
- Use @simplewebauthn v9+ for WebAuthn support

---

### 1.2 `tsconfig.json`

**Purpose:** TypeScript compiler configuration

**Implementation:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Integration Points:**
- Used by VS Code and TypeScript compiler
- Paths alias `@/` maps to project root

**Testing:**
- Ensure no TypeScript errors: `npx tsc --noEmit`

---

### 1.3 `tailwind.config.ts`

**Purpose:** Tailwind CSS configuration with custom design tokens

**Implementation:**

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
        text: {
          primary: '#F5F5F5',
          secondary: '#B3B3B3',
          tertiary: '#808080',
        },
        accent: {
          primary: '#B08968',
          hover: '#C9A57B',
          active: '#927048',
        },
        border: {
          subtle: '#2A2A2A',
          default: '#404040',
          strong: '#5A5A5A',
        },
        success: {
          bg: '#1A2E1A',
          border: '#2D4A2D',
          text: '#7FD17F',
        },
        warning: {
          bg: '#2E2A1A',
          border: '#4A442D',
          text: '#FFD166',
        },
        error: {
          bg: '#2E1A1A',
          border: '#4A2D2D',
          text: '#FF6B6B',
        },
        info: {
          bg: '#1A1F2E',
          border: '#2D3A4A',
          text: '#6BA3FF',
        },
        category: {
          faith: '#7A6F9E',
          character: '#9E7A6F',
          health: '#6F9E7A',
          finance: '#9E8F6F',
          business: '#7A8F9E',
          relationships: '#9E6F8F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '5xl': ['48px', '56px'],
        '4xl': ['36px', '44px'],
        '3xl': ['30px', '38px'],
        '2xl': ['24px', '32px'],
        'xl': ['20px', '28px'],
        'lg': ['18px', '26px'],
        'base': ['16px', '24px'],
        'sm': ['14px', '20px'],
        'xs': ['12px', '16px'],
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-up': 'slideUp 300ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

**Integration Points:**
- Used by all components for styling
- Color tokens defined in UI_COMPONENTS_BRANDING.md

**Testing:**
- Verify dark theme applies: `npm run dev` and check background color

---

### 1.4 `drizzle.config.ts`

**Purpose:** Drizzle ORM configuration for database migrations

**Implementation:**

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
  verbose: true,
  strict: true,
} satisfies Config
```

**Integration Points:**
- Used by `npm run db:generate` and `npm run db:push`
- References db/schema.ts

**Testing:**
- Run migration: `npm run db:generate`

---

### 1.5 `next.config.js`

**Purpose:** Next.js configuration

**Implementation:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['vercel-blob.com'], // For profile photos
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'wglifeos.vercel.app'],
    },
  },
}

module.exports = nextConfig
```

**Integration Points:**
- Enables Server Actions
- Configures image domains for Vercel Blob

**Testing:**
- Ensure builds: `npm run build`

---

### 1.6 `vercel.json`

**Purpose:** Vercel deployment configuration with cron jobs

**Implementation:**

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
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

**Integration Points:**
- Service Worker header required for PWA
- Cron jobs trigger insights and notifications

**Testing:**
- Deploy to Vercel and verify crons run

---

## 2. DATABASE & SCHEMA

### 2.1 `db/schema.ts`

**Purpose:** Drizzle ORM schema defining all database tables

**Implementation:**

```typescript
import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  integer, 
  boolean, 
  jsonb, 
  pgEnum,
  varchar,
  decimal
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// =========================
// ENUMS
// =========================

export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])
export const goalCategoryEnum = pgEnum('goal_category', [
  'faith', 
  'character', 
  'health', 
  'finance', 
  'business', 
  'relationships'
])
export const goalStatusEnum = pgEnum('goal_status', [
  'active', 
  'completed', 
  'archived'
])
export const goalTimeHorizonEnum = pgEnum('goal_time_horizon', [
  '1-month',
  '3-month',
  '6-month',
  '1-year',
  '5-year',
  'lifetime'
])
export const habitTypeEnum = pgEnum('habit_type', ['good', 'bad'])
export const notificationTypeEnum = pgEnum('notification_type', [
  'routine_reminder',
  'reflection_prompt',
  'insight_alert',
  'accountability_alert',
  'birthday',
  'goal_milestone',
  'prayer_reminder',
  'habit_check_in'
])
export const notificationStatusEnum = pgEnum('notification_status', [
  'pending',
  'sent',
  'failed'
])
export const insightTypeEnum = pgEnum('insight_type', [
  'behavioral',
  'financial',
  'relationship',
  'faith'
])
export const insightSeverityEnum = pgEnum('insight_severity', [
  'low',
  'medium',
  'high'
])
export const insightStatusEnum = pgEnum('insight_status', [
  'unacknowledged',
  'acknowledged',
  'dismissed',
  'action_taken'
])
export const completionLevelEnum = pgEnum('completion_level', [
  'not_done',
  'partial',
  'complete'
])
export const emotionalStateEnum = pgEnum('emotional_state', [
  'positive',
  'neutral',
  'negative'
])

// =========================
// CORE USER TABLES
// =========================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  emailVerificationToken: text('email_verification_token'),
  emailVerificationExpires: timestamp('email_verification_expires'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),
  biometricEnabled: boolean('biometric_enabled').default(false).notNull(),
  failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(),
  accountLockedUntil: timestamp('account_locked_until'),
  lastLoginAt: timestamp('last_login_at'),
  isActive: boolean('is_active').default(true).notNull(),
  notificationPreferences: jsonb('notification_preferences').default('{}').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const webauthnCredentials = pgTable('webauthn_credentials', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  credentialId: text('credential_id').notNull().unique(),
  publicKey: text('public_key').notNull(),
  counter: integer('counter').default(0).notNull(),
  transports: jsonb('transports'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dateOfBirth: timestamp('date_of_birth').notNull(),
  timezone: text('timezone').default('America/New_York').notNull(),
  profilePhotoUrl: text('profile_photo_url'),
  yearTheme: text('year_theme'),
  currentSeason: text('current_season'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// =========================
// IDENTITY TABLES
// =========================

export const identityStatements = pgTable('identity_statements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  statement: text('statement').notNull(),
  version: integer('version').default(1).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  replacedById: integer('replaced_by_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const coreValues = pgTable('core_values', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  value: text('value').notNull(),
  definition: text('definition').notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const faithReflections = pgTable('faith_reflections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reflection: text('reflection').notNull(),
  scriptureReference: text('scripture_reference'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const lifeSeasons = pgTable('life_seasons', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  season: text('season').notNull(),
  description: text('description').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// =========================
// GOALS & EXECUTION TABLES
// =========================

export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: goalCategoryEnum('category').notNull(),
  timeHorizon: goalTimeHorizonEnum('time_horizon').notNull(),
  status: goalStatusEnum('status').default('active').notNull(),
  whyItMatters: text('why_it_matters').notNull(),
  successCriteria: text('success_criteria').notNull(),
  currentProgress: integer('current_progress').default(0).notNull(),
  targetDate: timestamp('target_date'),
  completedAt: timestamp('completed_at'),
  completionReflection: text('completion_reflection'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const routines = pgTable('routines', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  timeOfDay: text('time_of_day').notNull(), // 'morning', 'evening', etc.
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const routineItems = pgTable('routine_items', {
  id: serial('id').primaryKey(),
  routineId: integer('routine_id').references(() => routines.id, { onDelete: 'cascade' }).notNull(),
  item: text('item').notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const routineLogs = pgTable('routine_logs', {
  id: serial('id').primaryKey(),
  routineId: integer('routine_id').references(() => routines.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull(),
  completionLevel: completionLevelEnum('completion_level').notNull(),
  itemsCompleted: jsonb('items_completed').notNull(), // Array of item IDs
  durationMinutes: integer('duration_minutes'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const habits = pgTable('habits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  type: habitTypeEnum('type').notNull(),
  targetFrequency: integer('target_frequency'), // Times per week
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const habitLogs = pgTable('habit_logs', {
  id: serial('id').primaryKey(),
  habitId: integer('habit_id').references(() => habits.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull(),
  notes: text('notes'),
  emotionalState: emotionalStateEnum('emotional_state'),
  trigger: text('trigger'), // For bad habits
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// =========================
// RELATIONSHIPS TABLES
// =========================

export const people = pgTable('people', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  relationship: text('relationship').notNull(),
  isInnerCircle: boolean('is_inner_circle').default(false).notNull(),
  isEx: boolean('is_ex').default(false).notNull(),
  dateOfBirth: timestamp('date_of_birth'),
  contactInfo: text('contact_info'),
  howTheyMakeMeFeel: text('how_they_make_me_feel'),
  lastContactDate: timestamp('last_contact_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const relationshipNotes = pgTable('relationship_notes', {
  id: serial('id').primaryKey(),
  personId: integer('person_id').references(() => people.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  note: text('note').notNull(),
  emotionalImpact: emotionalStateEnum('emotional_impact'),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const exRelationships = pgTable('ex_relationships', {
  id: serial('id').primaryKey(),
  personId: integer('person_id').references(() => people.id, { onDelete: 'cascade' }).notNull().unique(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  relationshipDuration: text('relationship_duration'),
  lessonsLearned: text('lessons_learned'),
  healingProgress: integer('healing_progress').default(0), // 0-100
  reflectionNotes: text('reflection_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// =========================
// PRAYER TABLES
// =========================

export const prayerEntries = pgTable('prayer_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  request: text('request').notNull(),
  category: text('category'),
  isAnswered: boolean('is_answered').default(false).notNull(),
  answeredAt: timestamp('answered_at'),
  howAnswered: text('how_answered'),
  lessonsLearned: text('lessons_learned'),
  lastPrayedDate: timestamp('last_prayed_date'),
  reminderFrequency: text('reminder_frequency'), // 'daily', 'weekly', etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const prayerLogs = pgTable('prayer_logs', {
  id: serial('id').primaryKey(),
  prayerEntryId: integer('prayer_entry_id').references(() => prayerEntries.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// =========================
// FINANCE TABLES
// =========================

export const finances = pgTable('finances', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  netWorth: decimal('net_worth', { precision: 12, scale: 2 }).notNull(),
  emergencyFundTarget: decimal('emergency_fund_target', { precision: 10, scale: 2 }).notNull(),
  emergencyFundCurrent: decimal('emergency_fund_current', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const cashFlowEntries = pgTable('cash_flow_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull(),
  category: text('category').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: text('type').notNull(), // 'income' or 'expense'
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const investments = pgTable('investments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'stocks', 'real_estate', 'crypto', etc.
  value: decimal('value', { precision: 12, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// =========================
// BUSINESS TABLES
// =========================

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  ownershipPercentage: decimal('ownership_percentage', { precision: 5, scale: 2 }),
  valuation: decimal('valuation', { precision: 12, scale: 2 }),
  myPosition: text('my_position'),
  foundedDate: timestamp('founded_date'),
  businessModel: text('business_model'),
  keyMetrics: jsonb('key_metrics'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const companyProducts = pgTable('company_products', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const capTableEntries = pgTable('cap_table_entries', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  shareholderName: text('shareholder_name').notNull(),
  sharesOwned: integer('shares_owned').notNull(),
  percentageOwnership: decimal('percentage_ownership', { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// =========================
// ACCOUNTABILITY TABLES
// =========================

export const accountabilityLinks = pgTable('accountability_links', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  pointOfLightId: integer('point_of_light_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  scopesGranted: jsonb('scopes_granted').notNull(), // Array of allowed scopes
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const accountabilityComments = pgTable('accountability_comments', {
  id: serial('id').primaryKey(),
  linkId: integer('link_id').references(() => accountabilityLinks.id, { onDelete: 'cascade' }).notNull(),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  comment: text('comment').notNull(),
  resourceType: text('resource_type').notNull(), // 'goal', 'routine', 'habit', 'insight', etc.
  resourceId: integer('resource_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// =========================
// INSIGHTS TABLES
// =========================

export const insightRules = pgTable('insight_rules', {
  id: serial('id').primaryKey(),
  patternName: text('pattern_name').notNull().unique(),
  type: insightTypeEnum('type').notNull(),
  threshold: jsonb('threshold').notNull(),
  messageTemplate: text('message_template').notNull(),
  recommendedAction: text('recommended_action').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const insights = pgTable('insights', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  ruleId: integer('rule_id').references(() => insightRules.id),
  type: insightTypeEnum('type').notNull(),
  patternName: text('pattern_name').notNull(),
  severity: insightSeverityEnum('severity').notNull(),
  message: text('message').notNull(),
  recommendedAction: text('recommended_action').notNull(),
  evidence: jsonb('evidence').notNull(),
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }).notNull(),
  status: insightStatusEnum('status').default('unacknowledged').notNull(),
  acknowledgedAt: timestamp('acknowledged_at'),
  dismissedAt: timestamp('dismissed_at'),
  actionTakenAt: timestamp('action_taken_at'),
  actionNotes: text('action_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// =========================
// NOTIFICATIONS TABLES
// =========================

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  actionUrl: text('action_url').notNull(),
  status: notificationStatusEnum('status').default('pending').notNull(),
  retryCount: integer('retry_count').default(0).notNull(),
  clickedAt: timestamp('clicked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  sentAt: timestamp('sent_at'),
})

// =========================
// AUDIT TABLE
// =========================

export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: integer('resource_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// =========================
// RELATIONS (for Drizzle Query API)
// =========================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  identityStatements: many(identityStatements),
  coreValues: many(coreValues),
  faithReflections: many(faithReflections),
  goals: many(goals),
  routines: many(routines),
  habits: many(habits),
  people: many(people),
  prayerEntries: many(prayerEntries),
  finances: one(finances, {
    fields: [users.id],
    references: [finances.userId],
  }),
  companies: many(companies),
  insights: many(insights),
  notifications: many(notifications),
}))

// Export all tables as schema
export const schema = {
  users,
  webauthnCredentials,
  profiles,
  identityStatements,
  coreValues,
  faithReflections,
  lifeSeasons,
  goals,
  routines,
  routineItems,
  routineLogs,
  habits,
  habitLogs,
  people,
  relationshipNotes,
  exRelationships,
  prayerEntries,
  prayerLogs,
  finances,
  cashFlowEntries,
  investments,
  companies,
  companyProducts,
  capTableEntries,
  accountabilityLinks,
  accountabilityComments,
  insightRules,
  insights,
  pushSubscriptions,
  notifications,
  auditLog,
}
```

**Integration Points:**
- Used by all database queries
- Imported in lib/db.ts
- Referenced by Drizzle Kit for migrations

**Testing:**
- Generate migration: `npm run db:generate`
- No TypeScript errors

**Common Pitfalls:**
- Ensure all foreign keys have onDelete specified
- Use camelCase for field names (Drizzle convention)
- All timestamp fields should have defaultNow()

---

## 3. LIBRARY UTILITIES

### 3.1 `lib/db.ts`

**Purpose:** Database connection singleton

**Implementation:**

```typescript
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import * as schema from '@/db/schema'

export const db = drizzle(sql, { schema })

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await sql`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}
```

**Integration Points:**
- Imported by all Server Actions and API routes
- Uses environment variable DATABASE_URL

**Testing:**
- Test connection: `await checkDatabaseHealth()`

---

### 3.2 `lib/validators.ts`

**Purpose:** Zod schemas for input validation

**Implementation:**

```typescript
import { z } from 'zod'

// =========================
// AUTH SCHEMAS
// =========================

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to terms',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
})

// =========================
// PROFILE SCHEMAS
// =========================

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.date(),
  timezone: z.string(),
  yearTheme: z.string().optional(),
  currentSeason: z.string().optional(),
})

// =========================
// IDENTITY SCHEMAS
// =========================

export const identityStatementSchema = z.object({
  statement: z.string().min(10, 'Statement must be at least 10 characters'),
})

export const coreValueSchema = z.object({
  value: z.string().min(1, 'Value is required'),
  definition: z.string().min(10, 'Definition must be at least 10 characters'),
})

export const faithReflectionSchema = z.object({
  reflection: z.string().min(10, 'Reflection must be at least 10 characters'),
  scriptureReference: z.string().optional(),
})

// =========================
// GOALS SCHEMAS
// =========================

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['faith', 'character', 'health', 'finance', 'business', 'relationships']),
  timeHorizon: z.enum(['1-month', '3-month', '6-month', '1-year', '5-year', 'lifetime']),
  whyItMatters: z.string().min(10, 'Why it matters must be at least 10 characters'),
  successCriteria: z.string().min(10, 'Success criteria must be at least 10 characters'),
  targetDate: z.date().optional(),
})

export const updateGoalProgressSchema = z.object({
  currentProgress: z.number().min(0).max(100),
})

export const completeGoalSchema = z.object({
  reflection: z.string().min(10, 'Reflection must be at least 10 characters'),
})

// =========================
// ROUTINES SCHEMAS
// =========================

export const createRoutineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  timeOfDay: z.string().min(1, 'Time of day is required'),
  items: z.array(z.string().min(1)).min(1, 'At least one item is required'),
})

export const logRoutineSchema = z.object({
  routineId: z.number(),
  completionLevel: z.enum(['not_done', 'partial', 'complete']),
  itemsCompleted: z.array(z.number()),
  durationMinutes: z.number().optional(),
  notes: z.string().optional(),
})

// =========================
// HABITS SCHEMAS
// =========================

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['good', 'bad']),
  targetFrequency: z.number().optional(),
})

export const logHabitSchema = z.object({
  habitId: z.number(),
  notes: z.string().optional(),
  emotionalState: z.enum(['positive', 'neutral', 'negative']).optional(),
  trigger: z.string().optional(),
})

// =========================
// PEOPLE SCHEMAS
// =========================

export const addPersonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  isInnerCircle: z.boolean().default(false),
  isEx: z.boolean().default(false),
  dateOfBirth: z.date().optional(),
  contactInfo: z.string().optional(),
  howTheyMakeMeFeel: z.string().optional(),
})

export const addRelationshipNoteSchema = z.object({
  personId: z.number(),
  note: z.string().min(1, 'Note is required'),
  emotionalImpact: z.enum(['positive', 'neutral', 'negative']).optional(),
  date: z.date(),
})

// =========================
// PRAYER SCHEMAS
// =========================

export const createPrayerSchema = z.object({
  request: z.string().min(1, 'Request is required'),
  category: z.string().optional(),
  reminderFrequency: z.string().optional(),
})

export const markPrayerAnsweredSchema = z.object({
  howAnswered: z.string().min(1, 'How answered is required'),
  lessonsLearned: z.string().optional(),
})

// =========================
// FINANCE SCHEMAS
// =========================

export const updateFinanceSchema = z.object({
  netWorth: z.number(),
  emergencyFundTarget: z.number(),
  emergencyFundCurrent: z.number(),
})

export const addCashFlowEntrySchema = z.object({
  date: z.date(),
  category: z.string().min(1, 'Category is required'),
  amount: z.number(),
  type: z.enum(['income', 'expense']),
  description: z.string().optional(),
})

// =========================
// BUSINESS SCHEMAS
// =========================

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  ownershipPercentage: z.number().optional(),
  valuation: z.number().optional(),
  myPosition: z.string().optional(),
  foundedDate: z.date().optional(),
  businessModel: z.string().optional(),
})

// =========================
// ACCOUNTABILITY SCHEMAS
// =========================

export const invitePointOfLightSchema = z.object({
  email: emailSchema,
  scopesGranted: z.array(z.string()).min(1, 'At least one scope is required'),
})

export const addAccountabilityCommentSchema = z.object({
  linkId: z.number(),
  comment: z.string().min(1, 'Comment is required'),
  resourceType: z.string().min(1, 'Resource type is required'),
  resourceId: z.number(),
})

// =========================
// INSIGHTS SCHEMAS
// =========================

export const markInsightActionTakenSchema = z.object({
  notes: z.string().min(1, 'Notes are required'),
})
```

**Integration Points:**
- Used by all Server Actions for input validation
- Provides type-safe parsing with Zod

**Testing:**
- Test schemas: `registerSchema.parse({ ... })`

---

### 3.3 `lib/crypto.ts`

**Purpose:** Cryptographic utilities (hashing, tokens)

**Implementation:**

```typescript
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(bytes: number = 32): string {
  return randomBytes(bytes).toString('hex')
}

export function generateVerificationToken(): string {
  return generateToken(32)
}

export function generatePasswordResetToken(): string {
  return generateToken(32)
}
```

**Integration Points:**
- Used in actions/auth.ts for password operations
- Used for email verification and password reset tokens

**Testing:**
- Test hashing: `const hash = await hashPassword('test123')`
- Test verification: `await verifyPassword('test123', hash)` should return true

---

### 3.4 `lib/webauthn.ts`

**Purpose:** WebAuthn helper functions

**Implementation:**

```typescript
import {
  generateRegistrationOptions as genRegOpts,
  verifyRegistrationResponse as verifyRegResp,
  generateAuthenticationOptions as genAuthOpts,
  verifyAuthenticationResponse as verifyAuthResp,
} from '@simplewebauthn/server'
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyRegistrationResponseOpts,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server'

const RP_NAME = process.env.WEBAUTHN_RP_NAME || 'WG Life OS'
const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost'
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000'

export async function generateRegistrationOptions(
  userId: number,
  userEmail: string,
  existingCredentials: Array<{ credentialId: string; transports?: string[] }>
) {
  const options = await genRegOpts({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: userId.toString(),
    userName: userEmail,
    attestationType: 'none',
    excludeCredentials: existingCredentials.map((cred) => ({
      id: Buffer.from(cred.credentialId, 'base64'),
      type: 'public-key',
      transports: cred.transports as AuthenticatorTransport[],
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform', // Face ID/Touch ID
    },
  })

  return options
}

export async function verifyRegistrationResponse(
  response: any,
  expectedChallenge: string
) {
  const verification = await verifyRegResp({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
  })

  return verification
}

export async function generateAuthenticationOptions(
  existingCredentials: Array<{ credentialId: string; transports?: string[] }>
) {
  const options = await genAuthOpts({
    rpID: RP_ID,
    allowCredentials: existingCredentials.map((cred) => ({
      id: Buffer.from(cred.credentialId, 'base64'),
      type: 'public-key',
      transports: cred.transports as AuthenticatorTransport[],
    })),
    userVerification: 'preferred',
  })

  return options
}

export async function verifyAuthenticationResponse(
  response: any,
  expectedChallenge: string,
  credential: {
    credentialId: string
    publicKey: string
    counter: number
  }
) {
  const verification = await verifyAuthResp({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    authenticator: {
      credentialID: Buffer.from(credential.credentialId, 'base64'),
      credentialPublicKey: Buffer.from(credential.publicKey, 'base64'),
      counter: credential.counter,
    },
  })

  return verification
}
```

**Integration Points:**
- Used in app/api/webauthn/*/route.ts files
- References environment variables for WebAuthn config

**Testing:**
- Test registration flow in browser with Face ID/Touch ID

---

### 3.5 `lib/email.ts`

**Purpose:** Email sending utilities

**Implementation:**

```typescript
// Using Resend (recommended) or any email provider

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  // Use Resend, SendGrid, or similar
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'noreply@wglifeos.com',
      to,
      subject,
      html,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to send email')
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Verify your email - WG Life OS',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to WG Life OS</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: #B08968; color: #0F0F0F; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Verify Email
        </a>
        <p style="margin-top: 24px; color: #808080; font-size: 14px;">
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Reset your password - WG Life OS',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #B08968; color: #0F0F0F; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
        <p style="margin-top: 24px; color: #808080; font-size: 14px;">
          This link expires in 24 hours. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendAccountabilityInvite(
  email: string,
  inviterName: string,
  acceptUrl: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `${inviterName} invited you as a Point of Light`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>You've Been Invited</h1>
        <p><strong>${inviterName}</strong> has invited you to be a Point of Light in their life.</p>
        <p>As a Point of Light, you'll be able to:</p>
        <ul>
          <li>View their progress on goals and habits</li>
          <li>Leave encouraging comments</li>
          <li>Hold them accountable to their commitments</li>
        </ul>
        <a href="${acceptUrl}" style="display: inline-block; padding: 12px 24px; background: #B08968; color: #0F0F0F; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px;">
          Accept Invitation
        </a>
      </div>
    `,
  })
}
```

**Integration Points:**
- Used in actions/auth.ts for verification emails
- Used in actions/accountability.ts for invites

**Testing:**
- Test emails in development (use email testing service like Ethereal)

---

**END OF PART 1**

Continue with Server Actions, API Routes, Edge Functions, Components, Hooks, and Pages in next message...