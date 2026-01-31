# WG Life OS - Edge Functions & Insights Engine

**Project Owner:** Waseem Ghaly  
**Purpose:** Autonomous insight generation system  
**Date:** January 29, 2026

---

## TABLE OF CONTENTS

1. [Edge Functions Overview](#1-edge-functions-overview)
2. [Insights Detection Architecture](#2-insights-detection-architecture)
3. [Behavioral Pattern Detection](#3-behavioral-pattern-detection)
4. [Financial Pattern Detection](#4-financial-pattern-detection)
5. [Relationship Pattern Detection](#5-relationship-pattern-detection)
6. [Faith Pattern Detection](#6-faith-pattern-detection)
7. [Alert Dispatch System](#7-alert-dispatch-system)
8. [Insight Scoring & Prioritization](#8-insight-scoring--prioritization)
9. [Evidence Collection](#9-evidence-collection)
10. [Testing & Debugging](#10-testing--debugging)

---

## 1. EDGE FUNCTIONS OVERVIEW

### Why Edge Functions?

Edge Functions run on Vercel's Edge Network for:
- **Low latency** (closer to database)
- **No cold starts**
- **Lightweight runtime** (only essential dependencies)
- **Cost efficiency** (minimal execution time)
- **Scheduled execution** (via cron)

### Architecture

```
Cron Trigger (every 6 hours)
    ↓
/api/cron/insights (verify auth)
    ↓
Edge Function: /edge/insights/detect.ts
    ↓
    ├─→ Behavioral Detection (/edge/insights/behavioral.ts)
    ├─→ Financial Detection (/edge/insights/financial.ts)
    ├─→ Relationship Detection (/edge/insights/relationship.ts)
    └─→ Faith Detection (/edge/insights/faith.ts)
    ↓
Insight Records Created (with evidence)
    ↓
Edge Function: /edge/alerts/dispatch.ts
    ↓
Notifications Created → Push Sent
```

### File Structure

```
src/
  edge/
    insights/
      detect.ts          # Main orchestrator
      behavioral.ts      # Routines, habits, goals
      financial.ts       # Spending patterns
      relationship.ts    # Relationship health
      faith.ts           # Prayer, reflection patterns
    alerts/
      dispatch.ts        # Notification dispatcher
    sync/
      handler.ts         # Offline sync handler (future)
```

---

## 2. INSIGHTS DETECTION ARCHITECTURE

### Main Orchestrator

**File:** `src/edge/insights/detect.ts`

```typescript
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import { detectBehavioralPatterns } from './behavioral'
import { detectFinancialPatterns } from './financial'
import { detectRelationshipPatterns } from './relationship'
import { detectFaithPatterns } from './faith'

export const config = {
  runtime: 'edge',
}

export interface InsightResult {
  ruleCode: string
  severity: 'low' | 'medium' | 'high'
  message: string
  recommendedAction: string
  evidence: Record<string, any>
  score: number
}

export async function generateInsights(
  userId: string,
  domain?: 'behavioral' | 'financial' | 'relationship' | 'faith'
): Promise<InsightResult[]> {
  const db = drizzle(sql)
  
  const allInsights: InsightResult[] = []
  
  // Run all detectors (or specific domain)
  if (!domain || domain === 'behavioral') {
    const behavioral = await detectBehavioralPatterns(db, userId)
    allInsights.push(...behavioral)
  }
  
  if (!domain || domain === 'financial') {
    const financial = await detectFinancialPatterns(db, userId)
    allInsights.push(...financial)
  }
  
  if (!domain || domain === 'relationship') {
    const relationship = await detectRelationshipPatterns(db, userId)
    allInsights.push(...relationship)
  }
  
  if (!domain || domain === 'faith') {
    const faith = await detectFaithPatterns(db, userId)
    allInsights.push(...faith)
  }
  
  // Filter and score
  const scoredInsights = allInsights
    .filter(insight => insight.score >= 0.6) // Only show insights with 60%+ confidence
    .sort((a, b) => b.score - a.score)
  
  // Store in database
  for (const insight of scoredInsights) {
    await db.insert(insights).values({
      userId,
      ruleCode: insight.ruleCode,
      severity: insight.severity,
      message: insight.message,
      recommendedAction: insight.recommendedAction,
      evidence: insight.evidence,
      detectedAt: new Date(),
    })
  }
  
  return scoredInsights
}

// Helper: Calculate insight score (0-1)
export function calculateInsightScore(
  evidenceStrength: number,    // 0-1
  patternConsistency: number,  // 0-1
  recency: number,             // 0-1 (1 = recent, 0 = old)
  impact: number               // 0-1
): number {
  return (
    evidenceStrength * 0.3 +
    patternConsistency * 0.3 +
    recency * 0.2 +
    impact * 0.2
  )
}
```

---

## 3. BEHAVIORAL PATTERN DETECTION

**File:** `src/edge/insights/behavioral.ts`

### Pattern: Discipline Decay

**Rule Code:** `discipline_decay`

**Trigger:** Routine completion rate drops by ≥20% over 14 days

```typescript
export async function detectDisciplineDecay(
  db: Database,
  userId: string
): Promise<InsightResult | null> {
  // Get last 30 days of routine logs
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  const logs = await db.query.routineLogs.findMany({
    where: and(
      eq(routineLogs.userId, userId),
      gte(routineLogs.logDate, last30Days)
    ),
    orderBy: desc(routineLogs.logDate),
  })
  
  if (logs.length < 14) return null // Not enough data
  
  // Split into two weeks
  const recentWeek = logs.slice(0, 7)
  const previousWeek = logs.slice(7, 14)
  
  // Calculate completion rates
  const recentCompletionRate = recentWeek.filter(
    log => log.completionLevel !== 'none'
  ).length / recentWeek.length
  
  const previousCompletionRate = previousWeek.filter(
    log => log.completionLevel !== 'none'
  ).length / previousWeek.length
  
  const dropPercentage = previousCompletionRate - recentCompletionRate
  
  if (dropPercentage >= 0.2) { // 20% drop
    // Identify which routines are slipping
    const routineBreakdown = logs.reduce((acc, log) => {
      if (!acc[log.routineId]) {
        acc[log.routineId] = { completed: 0, total: 0 }
      }
      acc[log.routineId].total++
      if (log.completionLevel !== 'none') {
        acc[log.routineId].completed++
      }
      return acc
    }, {} as Record<string, { completed: number; total: number }>)
    
    const slippingRoutineIds = Object.entries(routineBreakdown)
      .filter(([_, stats]) => stats.completed / stats.total < 0.5)
      .map(([routineId]) => routineId)
    
    // Get routine names
    const slippingRoutines = await db.query.routines.findMany({
      where: inArray(routines.id, slippingRoutineIds),
      columns: { routineName: true }
    })
    
    const severity = dropPercentage >= 0.4 ? 'high' : 
                     dropPercentage >= 0.3 ? 'medium' : 'low'
    
    const score = calculateInsightScore(
      0.9,  // evidenceStrength (hard data)
      0.8,  // patternConsistency (14-day trend)
      1.0,  // recency (current)
      0.85  // impact (high - affects discipline)
    )
    
    return {
      ruleCode: 'discipline_decay',
      severity,
      message: `Your routine completion dropped ${Math.round(dropPercentage * 100)}% in the past week. ${slippingRoutines.length} routine${slippingRoutines.length > 1 ? 's' : ''} need attention.`,
      recommendedAction: `Review and simplify: ${slippingRoutines.map(r => r.routineName).join(', ')}. Consider reducing scope temporarily to rebuild momentum.`,
      evidence: {
        dropPercentage: Math.round(dropPercentage * 100),
        recentCompletionRate: Math.round(recentCompletionRate * 100),
        previousCompletionRate: Math.round(previousCompletionRate * 100),
        slippingRoutines: slippingRoutines.map(r => r.routineName),
        totalLogs: logs.length,
      },
      score,
    }
  }
  
  return null
}
```

### Pattern: Avoidance Behavior

**Rule Code:** `avoidance_pattern`

**Trigger:** Goal has 0 progress updates for ≥21 days AND not marked completed/on-hold

```typescript
export async function detectAvoidancePattern(
  db: Database,
  userId: string
): Promise<InsightResult | null> {
  const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
  
  // Find stagnant goals
  const stagnantGoals = await db.query.goals.findMany({
    where: and(
      eq(goals.userId, userId),
      eq(goals.status, 'in_progress'),
      lte(goals.updatedAt, threeWeeksAgo),
      isNull(goals.archivedAt)
    ),
  })
  
  if (stagnantGoals.length === 0) return null
  
  // Check if any had previous momentum
  const goalsWithMomentum = []
  for (const goal of stagnantGoals) {
    // Check audit log for previous updates
    const previousUpdates = await db.query.auditLog.findMany({
      where: and(
        eq(auditLog.userId, userId),
        eq(auditLog.entityType, 'goal'),
        eq(auditLog.entityId, goal.id),
        eq(auditLog.action, 'goal.progress_updated'),
        lte(auditLog.createdAt, threeWeeksAgo)
      ),
      limit: 1,
    })
    
    if (previousUpdates.length > 0) {
      goalsWithMomentum.push(goal)
    }
  }
  
  if (goalsWithMomentum.length > 0) {
    const severity = goalsWithMomentum.length >= 3 ? 'high' : 'medium'
    
    const score = calculateInsightScore(
      1.0,  // evidenceStrength (hard data)
      0.9,  // patternConsistency (21+ days)
      0.9,  // recency
      0.8   // impact
    )
    
    return {
      ruleCode: 'avoidance_pattern',
      severity,
      message: `${goalsWithMomentum.length} goal${goalsWithMomentum.length > 1 ? 's have' : ' has'} stalled for 3+ weeks. This may indicate avoidance or misalignment.`,
      recommendedAction: `For each goal, ask: "Do I still want this? If yes, what's ONE small action I can take today?" If no, archive it guilt-free.`,
      evidence: {
        stagnantGoalCount: goalsWithMomentum.length,
        goalTitles: goalsWithMomentum.map(g => g.title),
        daysSinceUpdate: goalsWithMomentum.map(g => 
          Math.floor((Date.now() - g.updatedAt.getTime()) / (24 * 60 * 60 * 1000))
        ),
      },
      score,
    }
  }
  
  return null
}
```

### Pattern: Bad Habit Escalation

**Rule Code:** `bad_habit_escalation`

**Trigger:** Bad habit frequency increases ≥30% over 14 days

```typescript
export async function detectBadHabitEscalation(
  db: Database,
  userId: string
): Promise<InsightResult | null> {
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  // Get all bad habits
  const badHabits = await db.query.habits.findMany({
    where: and(
      eq(habits.userId, userId),
      eq(habits.habitType, 'bad'),
      eq(habits.isActive, true)
    ),
  })
  
  if (badHabits.length === 0) return null
  
  const escalatingHabits = []
  
  for (const habit of badHabits) {
    // Get logs for this habit
    const logs = await db.query.habitLogs.findMany({
      where: and(
        eq(habitLogs.habitId, habit.id),
        gte(habitLogs.logDate, last30Days)
      ),
      orderBy: desc(habitLogs.logDate),
    })
    
    if (logs.length < 10) continue // Not enough data
    
    // Split into recent vs previous 14 days
    const recent14Days = logs.slice(0, 14)
    const previous14Days = logs.slice(14, 28)
    
    // Count occurrences (binary: completed=true, count: sum, duration: sum)
    const recentCount = recent14Days.reduce((sum, log) => {
      if (habit.measurementType === 'binary') return sum + (log.completed ? 1 : 0)
      if (habit.measurementType === 'count') return sum + (log.countValue ?? 0)
      if (habit.measurementType === 'duration') return sum + (log.durationMinutes ?? 0)
      return sum
    }, 0)
    
    const previousCount = previous14Days.reduce((sum, log) => {
      if (habit.measurementType === 'binary') return sum + (log.completed ? 1 : 0)
      if (habit.measurementType === 'count') return sum + (log.countValue ?? 0)
      if (habit.measurementType === 'duration') return sum + (log.durationMinutes ?? 0)
      return sum
    }, 0)
    
    const increasePercentage = previousCount > 0 
      ? (recentCount - previousCount) / previousCount 
      : (recentCount > 0 ? 1 : 0)
    
    if (increasePercentage >= 0.3) { // 30% increase
      // Look for triggers
      const recentTriggers = recent14Days
        .map(log => log.triggerIdentified)
        .filter(Boolean)
      
      const triggerCounts = recentTriggers.reduce((acc, trigger) => {
        acc[trigger] = (acc[trigger] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const mostCommonTrigger = Object.entries(triggerCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0]
      
      escalatingHabits.push({
        habit,
        increasePercentage,
        recentCount,
        previousCount,
        mostCommonTrigger,
      })
    }
  }
  
  if (escalatingHabits.length > 0) {
    const severity = escalatingHabits.some(h => h.increasePercentage >= 0.6) 
      ? 'high' 
      : 'medium'
    
    const score = calculateInsightScore(
      1.0,  // evidenceStrength
      0.85, // patternConsistency
      1.0,  // recency
      0.9   // impact (very important)
    )
    
    return {
      ruleCode: 'bad_habit_escalation',
      severity,
      message: `${escalatingHabits.length} bad habit${escalatingHabits.length > 1 ? 's are' : ' is'} increasing. Immediate intervention needed.`,
      recommendedAction: escalatingHabits[0].mostCommonTrigger
        ? `Primary trigger identified: "${escalatingHabits[0].mostCommonTrigger}". Plan around this trigger.`
        : `Track triggers for next 3 days. Awareness is first step to change.`,
      evidence: {
        escalatingHabits: escalatingHabits.map(h => ({
          habitName: h.habit.habitName,
          increasePercentage: Math.round(h.increasePercentage * 100),
          recentCount: h.recentCount,
          previousCount: h.previousCount,
          mostCommonTrigger: h.mostCommonTrigger,
        })),
      },
      score,
    }
  }
  
  return null
}
```

### Pattern: Goal Stagnation

**Rule Code:** `goal_stagnation`

**Trigger:** Goal progress unchanged for ≥30 days with <50% completion

```typescript
export async function detectGoalStagnation(
  db: Database,
  userId: string
): Promise<InsightResult | null> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  const stagnantGoals = await db.query.goals.findMany({
    where: and(
      eq(goals.userId, userId),
      eq(goals.status, 'in_progress'),
      lt(goals.currentProgress, 50),
      lte(goals.updatedAt, thirtyDaysAgo),
      isNull(goals.archivedAt)
    ),
  })
  
  if (stagnantGoals.length === 0) return null
  
  const severity = stagnantGoals.length >= 2 ? 'medium' : 'low'
  
  const score = calculateInsightScore(
    1.0,  // evidenceStrength
    0.9,  // patternConsistency
    0.8,  // recency
    0.7   // impact
  )
  
  return {
    ruleCode: 'goal_stagnation',
    severity,
    message: `${stagnantGoals.length} goal${stagnantGoals.length > 1 ? 's are' : ' is'} stuck at <50% for 30+ days.`,
    recommendedAction: `Break each goal into micro-tasks. Do ONE micro-task this week.`,
    evidence: {
      stagnantGoals: stagnantGoals.map(g => ({
        title: g.title,
        currentProgress: g.currentProgress,
        daysSinceUpdate: Math.floor((Date.now() - g.updatedAt.getTime()) / (24 * 60 * 60 * 1000)),
      })),
    },
    score,
  }
}
```

### Main Behavioral Detector

```typescript
export async function detectBehavioralPatterns(
  db: Database,
  userId: string
): Promise<InsightResult[]> {
  const insights: InsightResult[] = []
  
  const disciplineDecay = await detectDisciplineDecay(db, userId)
  if (disciplineDecay) insights.push(disciplineDecay)
  
  const avoidance = await detectAvoidancePattern(db, userId)
  if (avoidance) insights.push(avoidance)
  
  const badHabitEscalation = await detectBadHabitEscalation(db, userId)
  if (badHabitEscalation) insights.push(badHabitEscalation)
  
  const goalStagnation = await detectGoalStagnation(db, userId)
  if (goalStagnation) insights.push(goalStagnation)
  
  return insights
}
```

---

## 4. FINANCIAL PATTERN DETECTION

**File:** `src/edge/insights/financial.ts`

### Pattern: Stress Spending

**Rule Code:** `stress_spending`

**Trigger:** Spending increases ≥40% in week following low mood/bad habit spike

```typescript
export async function detectStressSpending(
  db: Database,
  userId: string
): Promise<InsightResult | null> {
  const last60Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  
  // Get expense entries
  const expenses = await db.query.cashFlowEntries.findMany({
    where: and(
      eq(cashFlowEntries.userId, userId),
      eq(cashFlowEntries.type, 'expense'),
      gte(cashFlowEntries.entryDate, last60Days)
    ),
    orderBy: desc(cashFlowEntries.entryDate),
  })
  
  if (expenses.length < 20) return null // Need sufficient data
  
  // Get habit logs (for emotional state correlation)
  const habitLogs = await db.query.habitLogs.findMany({
    where: and(
      eq(habitLogs.userId, userId),
      gte(habitLogs.logDate, last60Days),
      isNotNull(habitLogs.emotionalState)
    ),
  })
  
  // Group expenses by week
  const weeklyExpenses: Record<string, number> = {}
  expenses.forEach(expense => {
    const weekKey = getWeekKey(expense.entryDate)
    weeklyExpenses[weekKey] = (weeklyExpenses[weekKey] || 0) + expense.amount
  })
  
  // Group emotional states by week
  const weeklyEmotionalStates: Record<string, string[]> = {}
  habitLogs.forEach(log => {
    const weekKey = getWeekKey(log.logDate)
    if (!weeklyEmotionalStates[weekKey]) weeklyEmotionalStates[weekKey] = []
    weeklyEmotionalStates[weekKey].push(log.emotionalState)
  })
  
  // Find correlation between negative emotions and increased spending
  const weeks = Object.keys(weeklyExpenses).sort().slice(-8) // Last 8 weeks
  
  const correlations = []
  for (let i = 0; i < weeks.length - 1; i++) {
    const weekKey = weeks[i]
    const nextWeekKey = weeks[i + 1]
    
    const emotionalStates = weeklyEmotionalStates[weekKey] || []
    const negativeEmotions = emotionalStates.filter(state => 
      ['stressed', 'anxious', 'sad', 'angry', 'frustrated'].some(neg => 
        state.toLowerCase().includes(neg)
      )
    )
    
    if (negativeEmotions.length >= 3) { // At least 3 negative logs
      const currentSpending = weeklyExpenses[weekKey]
      const nextSpending = weeklyExpenses[nextWeekKey]
      const avgSpending = Object.values(weeklyExpenses).reduce((a, b) => a + b, 0) / weeks.length
      
      const increasePercentage = (nextSpending - avgSpending) / avgSpending
      
      if (increasePercentage >= 0.4) { // 40% above average
        correlations.push({
          weekKey,
          negativeEmotionCount: negativeEmotions.length,
          spendingIncrease: increasePercentage,
          amount: nextSpending,
        })
      }
    }
  }
  
  if (correlations.length >= 2) { // Pattern confirmed across multiple weeks
    const severity = correlations.some(c => c.spendingIncrease >= 0.7) ? 'high' : 'medium'
    
    const score = calculateInsightScore(
      0.75, // evidenceStrength (correlation, not causation)
      0.8,  // patternConsistency
      1.0,  // recency
      0.85  // impact (financial + emotional)
    )
    
    return {
      ruleCode: 'stress_spending',
      severity,
      message: `Spending increases significantly after emotionally difficult weeks. Detected ${correlations.length} times in past 2 months.`,
      recommendedAction: `Identify non-monetary coping mechanisms. When stressed, pause 24 hours before non-essential purchases.`,
      evidence: {
        correlationCount: correlations.length,
        instances: correlations.map(c => ({
          weekKey: c.weekKey,
          negativeEmotionCount: c.negativeEmotionCount,
          spendingIncrease: Math.round(c.spendingIncrease * 100),
          amount: c.amount,
        })),
      },
      score,
    }
  }
  
  return null
}

function getWeekKey(date: Date): string {
  const year = date.getFullYear()
  const weekNum = Math.ceil((date.getDate() + new Date(year, date.getMonth(), 1).getDay()) / 7)
  return `${year}-W${weekNum.toString().padStart(2, '0')}`
}
```

### Pattern: Emergency Fund Neglect

**Rule Code:** `emergency_fund_neglect`

**Trigger:** Emergency fund <50% of target for ≥90 days

```typescript
export async function detectEmergencyFundNeglect(
  db: Database,
  userId: string
): Promise<InsightResult | null> {
  const finance = await db.query.finances.findFirst({
    where: eq(finances.userId, userId),
  })
  
  if (!finance || !finance.emergencyFundTarget) return null
  
  const currentPercentage = finance.emergencyFundCurrent / finance.emergencyFundTarget
  
  if (currentPercentage < 0.5) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - finance.updatedAt.getTime()) / (24 * 60 * 60 * 1000)
    )
    
    if (daysSinceUpdate >= 90) {
      const score = calculateInsightScore(
        1.0,  // evidenceStrength
        1.0,  // patternConsistency
        0.7,  // recency (90 days old)
        0.9   // impact (critical)
      )
      
      return {
        ruleCode: 'emergency_fund_neglect',
        severity: 'high',
        message: `Emergency fund is ${Math.round(currentPercentage * 100)}% of target. No progress in 90+ days.`,
        recommendedAction: `Set up automatic weekly transfer of $${Math.ceil((finance.emergencyFundTarget - finance.emergencyFundCurrent) / 52)} to emergency fund.`,
        evidence: {
          currentAmount: finance.emergencyFundCurrent,
          targetAmount: finance.emergencyFundTarget,
          percentageFunded: Math.round(currentPercentage * 100),
          daysSinceUpdate,
        },
        score,
      }
    }
  }
  
  return null
}
```

### Main Financial Detector

```typescript
export async function detectFinancialPatterns(
  db: Database,
  userId: string
): Promise<InsightResult[]> {
  const insights: InsightResult[] = []
  
  const stressSpending = await detectStressSpending(db, userId)
  if (stressSpending) insights.push(stressSpending)
  
  const emergencyFundNeglect = await detectEmergencyFundNeglect(db, userId)
  if (emergencyFundNeglect) insights.push(emergencyFundNeglect)
  
  return insights
}
```

---

## 5. RELATIONSHIP PATTERN DETECTION

**File:** `src/edge/insights/relationship.ts`

### Pattern: Relationship Drain

**Rule Code:** `relationship_drain`

**Trigger:** Person has ≥3 notes in 30 days with "negative" emotional impact OR emotionalImpact = negative/very_negative

```typescript
export async function detectRelationshipDrain(
  db: Database,
  userId: string
): Promise<InsightResult | null> {
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  // Get people with negative impact
  const negativePeople = await db.query.people.findMany({
    where: and(
      eq(people.userId, userId),
      eq(people.isActive, true),
      inArray(people.emotionalImpact, ['negative', 'very_negative'])
    ),
  })
  
  if (negativePeople.length === 0) return null
  
  // For each negative person, check recent notes
  const drainingRelationships = []
  
  for (const person of negativePeople) {
    const recentNotes = await db.query.relationshipNotes.findMany({
      where: and(
        eq(relationshipNotes.personId, person.id),
        gte(relationshipNotes.noteDate, last30Days)
      ),
    })
    
    if (recentNotes.length >= 3) {
      // Count how many notes mention negative emotions
      const negativeNoteCount = recentNotes.filter(note => {
        const emotional = note.myEmotionalState?.toLowerCase() || ''
        return ['drained', 'exhausted', 'frustrated', 'anxious', 'sad'].some(word => 
          emotional.includes(word)
        )
      }).length
      
      if (negativeNoteCount >= 2) {
        drainingRelationships.push({
          person,
          recentNoteCount: recentNotes.length,
          negativeNoteCount,
        })
      }
    }
  }
  
  if (drainingRelationships.length > 0) {
    const severity = drainingRelationships.length >= 2 ? 'high' : 'medium'
    
    const score = calculateInsightScore(
      0.85, // evidenceStrength
      0.8,  // patternConsistency
      1.0,  // recency
      0.9   // impact (relational health critical)
    )
    
    return {
      ruleCode: 'relationship_drain',
      severity,
      message: `${drainingRelationships.length} relationship${drainingRelationships.length > 1 ? 's are' : ' is'} consistently draining your energy.`,
      recommendedAction: `Review boundaries for: ${drainingRelationships.map(r => r.person.firstName).join(', ')}. Consider limiting contact or having honest conversation.`,
      evidence: {
        drainingRelationships: drainingRelationships.map(r => ({
          personName: `${r.person.firstName} ${r.person.lastName || ''}`.trim(),
          relationshipType: r.person.relationshipType,
          recentNoteCount: r.recentNoteCount,
          negativeNoteCount: r.negativeNoteCount,
          emotionalImpact: r.person.emotionalImpact,
        })),
      },
      score,
    }
  }
  
  return null
}
```

### Pattern: Neglected Inner Circle

**Rule Code:** `neglected_inner_circle`

**Trigger:** Inner circle person with no contact for ≥30 days

```typescript
export async function detectNeglectedInnerCircle(
  db: Database,
  userId: string
): Promise<InsightResult | null> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  const neglectedInnerCircle = await db.query.people.findMany({
    where: and(
      eq(people.userId, userId),
      eq(people.relationshipCircle, 'inner'),
      eq(people.isActive, true),
      or(
        lte(people.lastContactDate, thirtyDaysAgo),
        isNull(people.lastContactDate)
      )
    ),
  })
  
  if (neglectedInnerCircle.length === 0) return null
  
  const severity = neglectedInnerCircle.length >= 2 ? 'medium' : 'low'
  
  const score = calculateInsightScore(
    1.0,  // evidenceStrength
    0.7,  // patternConsistency
    0.9,  // recency
    0.8   // impact
  )
  
  return {
    ruleCode: 'neglected_inner_circle',
    severity,
    message: `You haven't connected with ${neglectedInnerCircle.length} inner circle ${neglectedInnerCircle.length > 1 ? 'people' : 'person'} in 30+ days.`,
    recommendedAction: `Reach out this week to: ${neglectedInnerCircle.map(p => p.firstName).join(', ')}.`,
    evidence: {
      neglectedPeople: neglectedInnerCircle.map(p => ({
        personName: `${p.firstName} ${p.lastName || ''}`.trim(),
        relationshipType: p.relationshipType,
        lastContactDate: p.lastContactDate,
        daysSinceContact: p.lastContactDate 
          ? Math.floor((Date.now() - p.lastContactDate.getTime()) / (24 * 60 * 60 * 1000))
          : null,
      })),
    },
    score,
  }
}
```

### Main Relationship Detector

```typescript
export async function detectRelationshipPatterns(
  db: Database,
  userId: string
): Promise<InsightResult[]> {
  const insights: InsightResult[] = []
  
  const drain = await detectRelationshipDrain(db, userId)
  if (drain) insights.push(drain)
  
  const neglected = await detectNeglectedInnerCircle(db, userId)
  if (neglected) insights.push(neglected)
  
  return insights
}
```

---

## 6. FAITH PATTERN DETECTION

**File:** `src/edge/insights/faith.ts`

### Pattern: Prayer Drift

**Rule Code:** `prayer_drift`

**Trigger:** Prayer frequency drops ≥50% over 21 days

```typescript
export async function detectPrayerDrift(
  db: Database,
  userId: string
): Promise<InsightResult | null> {
  const last42Days = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000)
  
  const prayerLogs = await db.query.prayerLogs.findMany({
    where: and(
      eq(prayerLogs.userId, userId),
      gte(prayerLogs.prayedAt, last42Days)
    ),
    orderBy: desc(prayerLogs.prayedAt),
  })
  
  if (prayerLogs.length < 10) return null // Need sufficient data
  
  // Split into recent 21 days vs previous 21 days
  const twentyOneDaysAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
  const recentLogs = prayerLogs.filter(log => log.prayedAt >= twentyOneDaysAgo)
  const previousLogs = prayerLogs.filter(log => log.prayedAt < twentyOneDaysAgo)
  
  const recentFrequency = recentLogs.length / 21
  const previousFrequency = previousLogs.length / 21
  
  const dropPercentage = previousFrequency > 0 
    ? (previousFrequency - recentFrequency) / previousFrequency 
    : 0
  
  if (dropPercentage >= 0.5) { // 50% drop
    const severity = dropPercentage >= 0.7 ? 'high' : 'medium'
    
    const score = calculateInsightScore(
      1.0,  // evidenceStrength
      0.85, // patternConsistency
      1.0,  // recency
      0.9   // impact (spiritual health)
    )
    
    return {
      ruleCode: 'prayer_drift',
      severity,
      message: `Prayer frequency dropped ${Math.round(dropPercentage * 100)}% over past 3 weeks.`,
      recommendedAction: `Start with 2 minutes/day. Set phone reminder for same time daily.`,
      evidence: {
        dropPercentage: Math.round(dropPercentage * 100),
        recentPrayersPerWeek: Math.round(recentFrequency * 7 * 10) / 10,
        previousPrayersPerWeek: Math.round(previousFrequency * 7 * 10) / 10,
        totalRecentPrayers: recentLogs.length,
        totalPreviousPrayers: previousLogs.length,
      },
      score,
    }
  }
  
  return null
}
```

### Pattern: No Faith Reflection

**Rule Code:** `no_faith_reflection`

**Trigger:** No faith reflections in past 30 days

```typescript
export async function detectNoFaithReflection(
  db: Database,
  userId: string
): Promise<InsightResult | null> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  const recentReflections = await db.query.faithReflections.findMany({
    where: and(
      eq(faithReflections.userId, userId),
      gte(faithReflections.reflectionDate, thirtyDaysAgo)
    ),
  })
  
  if (recentReflections.length === 0) {
    // Check if they EVER did reflections
    const pastReflections = await db.query.faithReflections.findMany({
      where: eq(faithReflections.userId, userId),
      limit: 1,
    })
    
    if (pastReflections.length > 0) { // They used to do it
      const score = calculateInsightScore(
        1.0,  // evidenceStrength
        0.8,  // patternConsistency
        0.9,  // recency
        0.75  // impact
      )
      
      return {
        ruleCode: 'no_faith_reflection',
        severity: 'medium',
        message: `No faith reflections in 30 days. This practice helps process spiritual growth.`,
        recommendedAction: `Tonight: Write one sentence about where you saw God today.`,
        evidence: {
          daysSinceLastReflection: 30,
          hadPreviousReflections: true,
        },
        score,
      }
    }
  }
  
  return null
}
```

### Main Faith Detector

```typescript
export async function detectFaithPatterns(
  db: Database,
  userId: string
): Promise<InsightResult[]> {
  const insights: InsightResult[] = []
  
  const prayerDrift = await detectPrayerDrift(db, userId)
  if (prayerDrift) insights.push(prayerDrift)
  
  const noReflection = await detectNoFaithReflection(db, userId)
  if (noReflection) insights.push(noReflection)
  
  return insights
}
```

---

## 7. ALERT DISPATCH SYSTEM

**File:** `src/edge/alerts/dispatch.ts`

```typescript
import { sendPushNotification } from '@/lib/push-notifications'

export const config = {
  runtime: 'edge',
}

export async function dispatchInsightAlerts(
  db: Database,
  userId: string
): Promise<void> {
  // Get unacknowledged insights from past 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const newInsights = await db.query.insights.findMany({
    where: and(
      eq(insights.userId, userId),
      gte(insights.detectedAt, yesterday),
      isNull(insights.acknowledgedAt),
      isNull(insights.dismissedAt)
    ),
    orderBy: desc(insights.detectedAt),
  })
  
  if (newInsights.length === 0) return
  
  // Group by severity
  const highSeverity = newInsights.filter(i => i.severity === 'high')
  const mediumSeverity = newInsights.filter(i => i.severity === 'medium')
  const lowSeverity = newInsights.filter(i => i.severity === 'low')
  
  // Send notifications based on severity
  if (highSeverity.length > 0) {
    // Send immediately for high severity
    for (const insight of highSeverity) {
      await db.insert(notifications).values({
        userId,
        notificationType: 'insight_alert',
        title: '🚨 Important Insight',
        body: insight.message,
        actionUrl: '/insights',
        relatedEntityType: 'insight',
        relatedEntityId: insight.id,
        priority: 'high',
      })
    }
  }
  
  if (mediumSeverity.length > 0) {
    // Batch medium severity (send once)
    await db.insert(notifications).values({
      userId,
      notificationType: 'insight_alert',
      title: '💡 New Insights',
      body: `${mediumSeverity.length} pattern${mediumSeverity.length > 1 ? 's' : ''} detected. Review when you can.`,
      actionUrl: '/insights',
      priority: 'normal',
    })
  }
  
  // Don't send notifications for low severity (user checks dashboard)
  
  // Notify Points of Light if they opted in
  const accountabilityLinks = await db.query.accountabilityLinks.findMany({
    where: and(
      eq(accountabilityLinks.ownerId, userId),
      eq(accountabilityLinks.isActive, true),
      eq(accountabilityLinks.receiveAlerts, true),
      isNull(accountabilityLinks.revokedAt)
    ),
  })
  
  for (const link of accountabilityLinks) {
    // Check if any insights are in their granted scopes
    const relevantInsights = newInsights.filter(insight => {
      if (insight.ruleCode.includes('goal') && link.grantedScopes.includes('goals')) return true
      if (insight.ruleCode.includes('habit') && link.grantedScopes.includes('habits')) return true
      if (insight.ruleCode.includes('prayer') && link.grantedScopes.includes('prayer')) return true
      if (insight.ruleCode.includes('financial') && link.grantedScopes.includes('finance')) return true
      return false
    })
    
    if (relevantInsights.length > 0) {
      await db.insert(notifications).values({
        userId: link.pointOfLightId,
        notificationType: 'accountability_alert',
        title: '👁️ Accountability Alert',
        body: `${relevantInsights.length} insight${relevantInsights.length > 1 ? 's' : ''} detected for your accountability partner.`,
        actionUrl: `/accountability/links/${link.id}`,
      })
    }
  }
}
```

---

## 8. INSIGHT SCORING & PRIORITIZATION

### Scoring Algorithm

```typescript
/**
 * Calculate insight confidence score (0-1)
 * 
 * @param evidenceStrength - How concrete the data is (logs vs correlation)
 * @param patternConsistency - How consistent the pattern is over time
 * @param recency - How recent the pattern is
 * @param impact - How much this affects user's goals
 */
export function calculateInsightScore(
  evidenceStrength: number,    // 0-1
  patternConsistency: number,  // 0-1
  recency: number,             // 0-1
  impact: number               // 0-1
): number {
  return (
    evidenceStrength * 0.3 +
    patternConsistency * 0.3 +
    recency * 0.2 +
    impact * 0.2
  )
}
```

### Severity Mapping

| Severity | Action Required | Score Threshold |
|----------|----------------|-----------------|
| High | Immediate attention | ≥0.8 |
| Medium | Review within 24h | 0.6-0.79 |
| Low | Informational | <0.6 |

---

## 9. EVIDENCE COLLECTION

### Evidence Structure

Every insight MUST include:

```typescript
interface InsightEvidence {
  // Always include:
  dataPoints: number           // How many logs were analyzed
  timeWindow: string           // E.g., "past 21 days"
  
  // Pattern-specific:
  [key: string]: any           // Structured data supporting the insight
}
```

### Example Evidence

```json
{
  "dataPoints": 28,
  "timeWindow": "past 30 days",
  "dropPercentage": 35,
  "recentCompletionRate": 42,
  "previousCompletionRate": 77,
  "slippingRoutines": ["Morning Routine", "Evening Reflection"],
  "totalLogs": 28
}
```

---

## 10. TESTING & DEBUGGING

### Manual Testing

```typescript
// Test single user
const result = await generateInsights('user-id-here')
console.log(result)

// Test specific domain
const behavioral = await generateInsights('user-id-here', 'behavioral')
console.log(behavioral)
```

### Debug Mode

Add to edge functions:

```typescript
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('[DEBUG] Evidence:', evidence)
  console.log('[DEBUG] Score:', score)
}
```

### Test Data Requirements

For each pattern, you need:

| Pattern | Minimum Data |
|---------|-------------|
| Discipline Decay | 14 days of routine logs |
| Avoidance Pattern | 1 goal + 21 days inactivity |
| Bad Habit Escalation | 28 days of habit logs |
| Stress Spending | 30 days expenses + 10 habit logs |
| Relationship Drain | 1 person + 3 notes in 30 days |
| Prayer Drift | 10 prayer logs over 42 days |

---

**END OF EDGE FUNCTIONS DOCUMENT**

All insight detection logic is now fully specified with complete algorithms, thresholds, evidence collection, and scoring. Next: Push Notification System.