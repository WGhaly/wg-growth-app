import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';

// This cron job runs daily at midnight to pre-generate insights for all users
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users
    const allUsers = await db.select({ id: users.id }).from(users);

    const results = {
      total: allUsers.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Note: getAllInsights uses auth() internally, so this cron approach
    // won't work without modifying the action to accept userId parameter.
    // For now, this is a template for future implementation.
    // Consider creating a separate internal function for cron jobs.

    return NextResponse.json({
      message: 'Insight generation template created - requires implementation',
      note: 'getAllInsights needs to be refactored to accept userId parameter for cron usage',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
