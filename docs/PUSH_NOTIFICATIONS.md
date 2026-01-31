# WG Life OS - Push Notification System

**Project Owner:** Waseem Ghaly  
**Technology:** Web Push API (VAPID)  
**Date:** January 29, 2026

---

## TABLE OF CONTENTS

1. [Push Notification Overview](#1-push-notification-overview)
2. [VAPID Setup & Keys](#2-vapid-setup--keys)
3. [Service Worker Implementation](#3-service-worker-implementation)
4. [Subscription Management](#4-subscription-management)
5. [Notification Types & Templates](#5-notification-types--templates)
6. [Delivery System](#6-delivery-system)
7. [Offline Queueing](#7-offline-queueing)
8. [User Preferences](#8-user-preferences)
9. [Testing & Debugging](#9-testing--debugging)
10. [Production Deployment](#10-production-deployment)

---

## 1. PUSH NOTIFICATION OVERVIEW

### Why Web Push API?

- **Free** (no third-party service fees)
- **iPhone PWA compatible** (iOS 16.4+)
- **Fully private** (no external trackers)
- **Works offline** (service worker queues)
- **Native feel** (OS-level notifications)

### Architecture

```
User Action / Cron Job
    ↓
Create Notification Record (DB)
    ↓
Send via Web Push API
    ↓
Service Worker receives
    ↓
Display notification
    ↓
User clicks → Navigate to actionUrl
```

### Flow Diagram

```
┌─────────────────┐
│  Notification   │
│    Trigger      │
│ (insight/cron)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create Record  │
│  in database    │
│ (status=pending)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Get Push Sub    │
│  from DB for    │
│     userId      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Send via       │
│  web-push lib   │
│  (VAPID signed) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Service Worker  │
│   receives      │
│  'push' event   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Display OS      │
│  notification   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User clicks →   │
│ Navigate to app │
└─────────────────┘
```

---

## 2. VAPID SETUP & KEYS

### Generate VAPID Keys

**Run once during setup:**

```bash
npx web-push generate-vapid-keys
```

**Output:**

```
Public Key:  BFxj... (87 chars)
Private Key: SdF3... (43 chars)
```

### Environment Variables

**File:** `.env.local`

```env
# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BFxj..."
VAPID_PRIVATE_KEY="SdF3..."
VAPID_SUBJECT="mailto:waseem@wglifeos.com"
```

### Verify Keys

```typescript
// lib/push-notifications.ts
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)
```

---

## 3. SERVICE WORKER IMPLEMENTATION

**File:** `public/sw.js`

### Full Service Worker

```javascript
// Service Worker for WG Life OS
// Version: 1.0.0

const CACHE_NAME = 'wg-life-os-v1'
const OFFLINE_URL = '/offline'

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png',
      ])
    })
  )
  
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  
  return self.clients.claim()
})

// Fetch event (offline support)
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL)
      })
    )
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request)
      })
    )
  }
})

// Push event (receive notifications)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)
  
  if (!event.data) {
    console.warn('[SW] Push event has no data')
    return
  }
  
  let data
  try {
    data = event.data.json()
  } catch (e) {
    console.error('[SW] Failed to parse push data:', e)
    data = {
      title: 'WG Life OS',
      body: event.data.text(),
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: data.url || '/',
      notificationId: data.notificationId,
    },
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.data)
  
  event.notification.close()
  
  const urlToOpen = event.notification.data.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if app is already open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open new window if not already open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
  
  // Mark notification as clicked (send to server)
  if (event.notification.data.notificationId) {
    fetch('/api/notifications/clicked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: event.notification.data.notificationId,
      }),
    }).catch((err) => console.error('[SW] Failed to mark clicked:', err))
  }
})

// Background sync (for offline actions)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions())
  }
})

async function syncPendingActions() {
  const db = await openIndexedDB()
  const pendingActions = await getPendingActions(db)
  
  for (const action of pendingActions) {
    try {
      await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body,
      })
      await deletePendingAction(db, action.id)
    } catch (err) {
      console.error('[SW] Failed to sync action:', err)
    }
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('wg-life-os', 1)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function getPendingActions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingActions'], 'readonly')
    const store = transaction.objectStore('pendingActions')
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function deletePendingAction(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingActions'], 'readwrite')
    const store = transaction.objectStore('pendingActions')
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
```

### Register Service Worker

**File:** `app/layout.tsx`

```typescript
'use client'

import { useEffect } from 'react'

export default function RootLayout({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])
  
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

---

## 4. SUBSCRIPTION MANAGEMENT

### Subscribe to Push

**File:** `lib/push-notifications.ts` (Client-side)

```typescript
'use client'

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('Push notifications not supported')
    return null
  }
  
  try {
    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription()
    
    if (!subscription) {
      // Subscribe
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
    }
    
    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    })
    
    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push:', error)
    return null
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      
      // Notify server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })
      
      return true
    }
    
    return false
  } catch (error) {
    console.error('Failed to unsubscribe:', error)
    return false
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}
```

### API: Subscribe Endpoint

**File:** `app/api/push/subscribe/route.ts`

```typescript
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const subscription = await request.json()
  
  // Check if subscription already exists
  const existing = await db.query.pushSubscriptions.findFirst({
    where: and(
      eq(pushSubscriptions.userId, session.user.id),
      eq(pushSubscriptions.endpoint, subscription.endpoint)
    ),
  })
  
  if (existing) {
    return Response.json({ success: true, subscriptionId: existing.id })
  }
  
  // Create new subscription
  const [newSub] = await db.insert(pushSubscriptions).values({
    userId: session.user.id,
    endpoint: subscription.endpoint,
    p256dhKey: subscription.keys.p256dh,
    authKey: subscription.keys.auth,
    userAgent: request.headers.get('user-agent'),
  }).returning()
  
  return Response.json({ success: true, subscriptionId: newSub.id })
}
```

### API: Unsubscribe Endpoint

**File:** `app/api/push/unsubscribe/route.ts`

```typescript
export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const subscription = await request.json()
  
  // Delete subscription
  await db.delete(pushSubscriptions).where(
    and(
      eq(pushSubscriptions.userId, session.user.id),
      eq(pushSubscriptions.endpoint, subscription.endpoint)
    )
  )
  
  return Response.json({ success: true })
}
```

---

## 5. NOTIFICATION TYPES & TEMPLATES

### Notification Types

**File:** `lib/notification-templates.ts`

```typescript
export type NotificationType =
  | 'routine_reminder'
  | 'reflection_prompt'
  | 'insight_alert'
  | 'accountability_alert'
  | 'birthday'
  | 'goal_milestone'
  | 'prayer_reminder'
  | 'habit_check_in'

export interface NotificationTemplate {
  title: string
  body: string
  icon?: string
  actionUrl: string
  requireInteraction?: boolean
  actions?: Array<{ action: string; title: string }>
}

export function getNotificationTemplate(
  type: NotificationType,
  data: Record<string, any>
): NotificationTemplate {
  switch (type) {
    case 'routine_reminder':
      return {
        title: `Time for ${data.routineName}`,
        body: data.description || 'Your routine is scheduled now.',
        icon: '/icons/routine.png',
        actionUrl: `/routines/${data.routineId}`,
        requireInteraction: false,
      }
    
    case 'reflection_prompt':
      return {
        title: '🌙 Evening Reflection',
        body: 'Take 2 minutes to reflect on your day.',
        icon: '/icons/reflection.png',
        actionUrl: '/identity/faith',
        requireInteraction: false,
      }
    
    case 'insight_alert':
      return {
        title: data.severity === 'high' ? '🚨 Important Insight' : '💡 New Insight',
        body: data.message,
        icon: '/icons/insight.png',
        actionUrl: '/insights',
        requireInteraction: data.severity === 'high',
        actions: [
          { action: 'view', title: 'View' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      }
    
    case 'accountability_alert':
      return {
        title: '👁️ Accountability Alert',
        body: data.message,
        icon: '/icons/accountability.png',
        actionUrl: data.actionUrl || '/accountability',
        requireInteraction: false,
      }
    
    case 'birthday':
      return {
        title: `🎂 ${data.personName}'s Birthday`,
        body: 'Don\'t forget to reach out!',
        icon: '/icons/birthday.png',
        actionUrl: `/people/${data.personId}`,
        requireInteraction: false,
      }
    
    case 'goal_milestone':
      return {
        title: '🎯 Goal Milestone!',
        body: data.message,
        icon: '/icons/goal.png',
        actionUrl: `/goals/${data.goalId}`,
        requireInteraction: false,
      }
    
    case 'prayer_reminder':
      return {
        title: '🙏 Prayer Reminder',
        body: data.prayerTitle || 'Time for prayer.',
        icon: '/icons/prayer.png',
        actionUrl: '/prayer',
        requireInteraction: false,
      }
    
    case 'habit_check_in':
      return {
        title: '✓ Habit Check-In',
        body: `Have you ${data.habitName.toLowerCase()} today?`,
        icon: '/icons/habit.png',
        actionUrl: `/habits/${data.habitId}`,
        requireInteraction: false,
        actions: [
          { action: 'yes', title: 'Yes' },
          { action: 'no', title: 'No' },
        ],
      }
    
    default:
      return {
        title: 'WG Life OS',
        body: 'You have a new notification.',
        actionUrl: '/',
      }
  }
}
```

---

## 6. DELIVERY SYSTEM

### Send Push Notification

**File:** `lib/push-notifications.ts` (Server-side)

```typescript
import webpush from 'web-push'
import { db } from '@/lib/db'
import { pushSubscriptions, notifications } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getNotificationTemplate } from './notification-templates'

// Configure web-push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification(
  notification: typeof notifications.$inferSelect
): Promise<boolean> {
  try {
    // Get user's push subscriptions
    const subscriptions = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, notification.userId),
    })
    
    if (subscriptions.length === 0) {
      console.log('No push subscriptions for user:', notification.userId)
      return false
    }
    
    // Get notification template
    const template = getNotificationTemplate(
      notification.notificationType,
      {
        ...notification,
        message: notification.body,
      }
    )
    
    // Prepare payload
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: template.icon,
      url: notification.actionUrl || '/',
      notificationId: notification.id,
      requireInteraction: template.requireInteraction,
      actions: template.actions,
      tag: notification.notificationType,
    })
    
    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dhKey,
              auth: sub.authKey,
            },
          },
          payload
        )
      )
    )
    
    // Check for failures (likely expired subscriptions)
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      if (result.status === 'rejected') {
        const error = result.reason
        
        // If subscription expired (410 Gone), delete it
        if (error.statusCode === 410) {
          await db.delete(pushSubscriptions).where(
            eq(pushSubscriptions.id, subscriptions[i].id)
          )
          console.log('Deleted expired subscription:', subscriptions[i].id)
        }
      }
    }
    
    // Update notification status
    await db.update(notifications).set({
      status: 'sent',
      sentAt: new Date(),
    }).where(eq(notifications.id, notification.id))
    
    return true
  } catch (error) {
    console.error('Failed to send push notification:', error)
    
    // Update notification status
    await db.update(notifications).set({
      status: 'failed',
      failureReason: error.message,
      retryCount: db.sql`${notifications.retryCount} + 1`,
    }).where(eq(notifications.id, notification.id))
    
    return false
  }
}
```

### Batch Send

```typescript
export async function sendBatchPushNotifications(
  notificationIds: string[]
): Promise<void> {
  const notifs = await db.query.notifications.findMany({
    where: inArray(notifications.id, notificationIds),
  })
  
  for (const notif of notifs) {
    await sendPushNotification(notif)
  }
}
```

---

## 7. OFFLINE QUEUEING

### Queue Notifications When Offline

**File:** `lib/offline-queue.ts` (Client-side)

```typescript
const DB_NAME = 'wg-life-os'
const DB_VERSION = 1
const STORE_NAME = 'pendingActions'

export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

export async function queueAction(action: {
  url: string
  method: string
  headers: Record<string, string>
  body: string
}): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction([STORE_NAME], 'readwrite')
  const store = transaction.objectStore(STORE_NAME)
  
  store.add({
    ...action,
    timestamp: Date.now(),
  })
  
  // Register background sync
  if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
    const registration = await navigator.serviceWorker.ready
    await registration.sync.register('sync-pending-actions')
  }
}

export async function getPendingActions(): Promise<any[]> {
  const db = await openDB()
  const transaction = db.transaction([STORE_NAME], 'readonly')
  const store = transaction.objectStore(STORE_NAME)
  
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
```

### Usage

```typescript
// When creating a notification while offline
try {
  await fetch('/api/notifications', {
    method: 'POST',
    body: JSON.stringify(notificationData),
  })
} catch (error) {
  // Queue for later
  await queueAction({
    url: '/api/notifications',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notificationData),
  })
}
```

---

## 8. USER PREFERENCES

### Notification Settings UI

**File:** `app/(dashboard)/settings/notifications/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { subscribeToPush, unsubscribeFromPush } from '@/lib/push-notifications'

export default function NotificationSettingsPage() {
  const [subscribed, setSubscribed] = useState(false)
  const [preferences, setPreferences] = useState({
    routineReminders: true,
    reflectionPrompts: true,
    insightAlerts: true,
    accountabilityAlerts: true,
    birthdayReminders: true,
    goalMilestones: true,
    prayerReminders: true,
    habitCheckIns: true,
  })
  
  useEffect(() => {
    checkSubscriptionStatus()
    loadPreferences()
  }, [])
  
  async function checkSubscriptionStatus() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setSubscribed(!!subscription)
    }
  }
  
  async function loadPreferences() {
    const response = await fetch('/api/notifications/preferences')
    const data = await response.json()
    if (data.preferences) {
      setPreferences(data.preferences)
    }
  }
  
  async function handleSubscriptionToggle() {
    if (subscribed) {
      await unsubscribeFromPush()
      setSubscribed(false)
    } else {
      const result = await subscribeToPush()
      setSubscribed(!!result)
    }
  }
  
  async function updatePreference(key: string, value: boolean) {
    setPreferences((prev) => ({ ...prev, [key]: value }))
    
    await fetch('/api/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    })
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notification Settings</h1>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Push Notifications</h3>
            <p className="text-sm text-gray-400">Enable push notifications</p>
          </div>
          <button
            onClick={handleSubscriptionToggle}
            className={`px-4 py-2 rounded ${subscribed ? 'bg-red-600' : 'bg-blue-600'}`}
          >
            {subscribed ? 'Disable' : 'Enable'}
          </button>
        </div>
        
        {subscribed && (
          <>
            <div className="flex items-center justify-between">
              <span>Routine Reminders</span>
              <input
                type="checkbox"
                checked={preferences.routineReminders}
                onChange={(e) => updatePreference('routineReminders', e.target.checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span>Reflection Prompts</span>
              <input
                type="checkbox"
                checked={preferences.reflectionPrompts}
                onChange={(e) => updatePreference('reflectionPrompts', e.target.checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span>Insight Alerts</span>
              <input
                type="checkbox"
                checked={preferences.insightAlerts}
                onChange={(e) => updatePreference('insightAlerts', e.target.checked)}
              />
            </div>
            
            {/* ... other preferences ... */}
          </>
        )}
      </div>
    </div>
  )
}
```

### Store Preferences

**File:** `app/api/notifications/preferences/route.ts`

```typescript
export async function GET(request: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { notificationPreferences: true },
  })
  
  return Response.json({ preferences: user?.notificationPreferences || {} })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })
  
  const updates = await request.json()
  
  await db.update(users)
    .set({
      notificationPreferences: sql`jsonb_set(
        COALESCE(notification_preferences, '{}'::jsonb),
        ${sql.raw(`'{${Object.keys(updates).join(',')}}'`)},
        ${sql.raw(`'${JSON.stringify(Object.values(updates))}'`)}
      )`,
    })
    .where(eq(users.id, session.user.id))
  
  return Response.json({ success: true })
}
```

---

## 9. TESTING & DEBUGGING

### Test Push Notification

```typescript
// pages/api/test/push.ts
export async function POST(request: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })
  
  const [notification] = await db.insert(notifications).values({
    userId: session.user.id,
    notificationType: 'insight_alert',
    title: 'Test Notification',
    body: 'This is a test push notification.',
    actionUrl: '/',
  }).returning()
  
  await sendPushNotification(notification)
  
  return Response.json({ success: true })
}
```

### Debug Service Worker

```javascript
// In browser console
navigator.serviceWorker.getRegistration().then((reg) => {
  console.log('Service Worker:', reg)
  console.log('Active:', reg.active)
  console.log('Waiting:', reg.waiting)
  console.log('Installing:', reg.installing)
})

// Check subscription
navigator.serviceWorker.ready.then((reg) => {
  reg.pushManager.getSubscription().then((sub) => {
    console.log('Push Subscription:', sub)
  })
})
```

---

## 10. PRODUCTION DEPLOYMENT

### Vercel Configuration

**File:** `vercel.json`

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ]
}
```

### Cron Jobs

**File:** `vercel.json` (add to existing)

```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/insights",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Environment Variables (Vercel Dashboard)

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BFxj...
VAPID_PRIVATE_KEY=SdF3...
VAPID_SUBJECT=mailto:waseem@wglifeos.com
CRON_SECRET=<random-secret>
```

### iOS PWA Notes

**iPhone requirements:**
- iOS 16.4+ required
- User must "Add to Home Screen"
- Notifications appear as banner (not lock screen on first install)
- User must grant permission in Settings > [App Name] > Notifications

**Testing on iPhone:**
1. Deploy to production (localhost won't work for PWA)
2. Open in Safari
3. Tap Share → Add to Home Screen
4. Open PWA from home screen
5. Trigger notification
6. Check Settings > Notifications

---

**END OF PUSH NOTIFICATION DOCUMENT**

Complete VAPID setup, service worker, subscription management, notification templates, delivery system, and offline queueing. Next: Screen Wireframes.