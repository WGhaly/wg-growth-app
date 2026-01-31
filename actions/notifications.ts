'use server';

import { db } from '@/lib/db';
import { pushSubscriptions, profiles } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Lazy load webpush only when actually needed
let webpush: any = null;
let webpushInitialized = false;

function getWebPush() {
  if (!webpushInitialized) {
    webpushInitialized = true;
    
    // Only initialize if VAPID keys are configured
    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      try {
        // NOTE: web-push is disabled temporarily due to port 443 connection issues
        // webpush = require('web-push');
        // webpush.setVapidDetails(
        //   process.env.VAPID_SUBJECT || 'mailto:your-email@example.com',
        //   process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        //   process.env.VAPID_PRIVATE_KEY
        // );
        console.warn('Web push is currently disabled');
      } catch (error) {
        console.warn('Web push not configured:', error);
      }
    }
  }
  
  return webpush;
}

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

// Subscribe to push notifications
export async function subscribeToPush(subscription: PushSubscription) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const validated = subscriptionSchema.parse(subscription.toJSON());

    // Check if subscription already exists
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, session.user.id),
          eq(pushSubscriptions.endpoint, validated.endpoint)
        )
      );

    if (existing.length > 0) {
      return { success: true, data: existing[0] };
    }

    // Create new subscription
    const [newSubscription] = await db
      .insert(pushSubscriptions)
      .values({
        userId: session.user.id,
        endpoint: validated.endpoint,
        p256dh: validated.keys.p256dh,
        auth: validated.keys.auth,
      })
      .returning();

    return { success: true, data: newSubscription };
  } catch (error) {
    console.error('Subscribe to push error:', error);
    return { success: false, error: 'Failed to subscribe to push notifications' };
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(endpoint: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    await db
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, session.user.id),
          eq(pushSubscriptions.endpoint, endpoint)
        )
      );

    return { success: true };
  } catch (error) {
    console.error('Unsubscribe from push error:', error);
    return { success: false, error: 'Failed to unsubscribe from push notifications' };
  }
}

// Get user's notification preferences
export async function getNotificationPreferences() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const [profile] = await db
      .select({ notificationPreferences: profiles.notificationPreferences })
      .from(profiles)
      .where(eq(profiles.userId, session.user.id));

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Return default preferences if none exist
    const preferences = profile.notificationPreferences || {
      enableHabits: true,
      enableRoutines: true,
      enableGoals: true,
      enablePrayers: true,
      habitReminderTime: '09:00',
      routineReminderBefore: 15,
      goalDeadlineWarning: 3,
    };

    return { success: true, data: preferences };
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return { success: false, error: 'Failed to get notification preferences' };
  }
}

const preferencesSchema = z.object({
  enableHabits: z.boolean().optional(),
  enableRoutines: z.boolean().optional(),
  enableGoals: z.boolean().optional(),
  enablePrayers: z.boolean().optional(),
  habitReminderTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  routineReminderBefore: z.number().min(0).max(120).optional(),
  goalDeadlineWarning: z.number().min(1).max(30).optional(),
});

// Update notification preferences
export async function updateNotificationPreferences(data: z.infer<typeof preferencesSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const validated = preferencesSchema.parse(data);

    // Get current preferences and merge with new data
    const result = await getNotificationPreferences();
    const currentPrefs = result.success && result.data ? result.data : {};
    const updatedPrefs = { ...currentPrefs, ...validated };

    const [updated] = await db
      .update(profiles)
      .set({
        notificationPreferences: updatedPrefs,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, session.user.id))
      .returning({ notificationPreferences: profiles.notificationPreferences });

    return { success: true, data: updated.notificationPreferences };
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return { success: false, error: 'Failed to update notification preferences' };
  }
}

// Send push notification to user
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    // Get all subscriptions for user
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    if (subscriptions.length === 0) {
      return { success: false, error: 'No subscriptions found' };
    }

    // Check if webpush is configured
    const webpush = getWebPush();
    if (!webpush) {
      console.warn('Web push not configured - skipping push notifications');
      return { success: true, sent: 0, failed: 0 };
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data,
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payload);
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          // Remove invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            await db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.id, sub.id));
          }
          throw error;
        }
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      success: true,
      data: { sent: successful, failed, total: subscriptions.length },
    };
  } catch (error) {
    console.error('Send push notification error:', error);
    return { success: false, error: 'Failed to send push notification' };
  }
}

// Get VAPID public key for client
export async function getVapidPublicKey() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return { success: false, error: 'VAPID keys not configured' };
  }
  return { success: true, data: publicKey };
}
