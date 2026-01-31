import { NextResponse } from 'next/server';
import {
  sendHabitReminders,
  sendRoutineReminders,
  sendGoalDeadlineWarnings,
  sendPrayerReminders,
} from '@/actions/notification-triggers';

// This cron job runs every 5 minutes to check and send notifications
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run all notification checks in parallel
    const results = await Promise.allSettled([
      sendHabitReminders(),
      sendRoutineReminders(),
      sendGoalDeadlineWarnings(),
      sendPrayerReminders(),
    ]);

    const summary = {
      habits: results[0].status === 'fulfilled' ? results[0].value : { success: false },
      routines: results[1].status === 'fulfilled' ? results[1].value : { success: false },
      goals: results[2].status === 'fulfilled' ? results[2].value : { success: false },
      prayers: results[3].status === 'fulfilled' ? results[3].value : { success: false },
    };

    return NextResponse.json({
      message: 'Notification check completed',
      results: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Notification cron error:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
