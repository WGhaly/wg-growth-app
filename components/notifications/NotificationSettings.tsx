'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Bell, BellOff, Check } from 'lucide-react';
import {
  subscribeToPush,
  unsubscribeFromPush,
  getNotificationPreferences,
  updateNotificationPreferences,
  getVapidPublicKey,
} from '@/actions/notifications';

interface NotificationPreferences {
  enableHabits?: boolean;
  enableRoutines?: boolean;
  enableGoals?: boolean;
  enablePrayers?: boolean;
  habitReminderTime?: string;
  routineReminderBefore?: number;
  goalDeadlineWarning?: number;
}

export function NotificationSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enableHabits: true,
    enableRoutines: true,
    enableGoals: true,
    enablePrayers: true,
    habitReminderTime: '09:00',
    routineReminderBefore: 15,
    goalDeadlineWarning: 3,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }

    // Load preferences
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const result = await getNotificationPreferences();
    if (result.success && result.data) {
      setPreferences(result.data as NotificationPreferences);
    }
  };

  const checkSubscription = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setIsSubscribed(!!subscription);
  };

  const handleSubscribe = async () => {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Get VAPID public key
      const keyResult = await getVapidPublicKey();
      if (!keyResult.success || !keyResult.data) {
        setMessage('Push notifications not configured on server');
        return;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setMessage('Notification permission denied');
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyResult.data),
      });

      // Save subscription to server
      const result = await subscribeToPush(subscription);
      if (result.success) {
        setIsSubscribed(true);
        setMessage('Successfully subscribed to notifications!');
      } else {
        setMessage(result.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      setMessage('Failed to subscribe to notifications');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await unsubscribeFromPush(subscription.endpoint);
        setIsSubscribed(false);
        setMessage('Successfully unsubscribed from notifications');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setMessage('Failed to unsubscribe from notifications');
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const result = await updateNotificationPreferences(preferences);
      if (result.success) {
        setMessage('Preferences saved successfully!');
      } else {
        setMessage(result.error || 'Failed to save preferences');
      }
    } catch (error) {
      setMessage('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <BellOff className="w-16 h-16 mx-auto mb-4 text-text-tertiary opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Notifications Not Supported</h3>
            <p className="text-text-secondary">
              Your browser doesn't support push notifications
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={24} />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-text-secondary">
            {isSubscribed
              ? 'You are currently subscribed to push notifications'
              : 'Subscribe to receive timely reminders for your habits, routines, and goals'}
          </p>
          
          {isSubscribed ? (
            <Button variant="danger" onClick={handleUnsubscribe}>
              <BellOff size={18} className="mr-2" />
              Unsubscribe
            </Button>
          ) : (
            <Button onClick={handleSubscribe}>
              <Bell size={18} className="mr-2" />
              Enable Notifications
            </Button>
          )}

          {message && (
            <p className="text-sm text-accent-primary mt-2">{message}</p>
          )}
        </CardContent>
      </Card>

      {/* Preferences Card */}
      {isSubscribed && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Habit Reminders</h4>
                  <p className="text-sm text-text-secondary">
                    Daily reminders for your habits
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('enableHabits')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.enableHabits ? 'bg-accent-primary' : 'bg-bg-tertiary'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-text-primary rounded-full transition-transform ${
                      preferences.enableHabits ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Routine Reminders</h4>
                  <p className="text-sm text-text-secondary">
                    Notifications before routine times
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('enableRoutines')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.enableRoutines ? 'bg-accent-primary' : 'bg-bg-tertiary'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-text-primary rounded-full transition-transform ${
                      preferences.enableRoutines ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Goal Deadlines</h4>
                  <p className="text-sm text-text-secondary">
                    Alerts for approaching deadlines
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('enableGoals')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.enableGoals ? 'bg-accent-primary' : 'bg-bg-tertiary'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-text-primary rounded-full transition-transform ${
                      preferences.enableGoals ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Prayer Times</h4>
                  <p className="text-sm text-text-secondary">
                    Notifications for prayer times
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('enablePrayers')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.enablePrayers ? 'bg-accent-primary' : 'bg-bg-tertiary'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-text-primary rounded-full transition-transform ${
                      preferences.enablePrayers ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Time Settings */}
            <div className="space-y-4 pt-4 border-t border-border-primary">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Habit Reminder Time
                </label>
                <Input
                  type="time"
                  value={preferences.habitReminderTime || '09:00'}
                  onChange={(e) =>
                    setPreferences({ ...preferences, habitReminderTime: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Routine Reminder (minutes before)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="120"
                  value={preferences.routineReminderBefore || 15}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      routineReminderBefore: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Goal Deadline Warning (days before)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={preferences.goalDeadlineWarning || 3}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      goalDeadlineWarning: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <Button onClick={handleSavePreferences} disabled={isSaving}>
              <Check size={18} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
