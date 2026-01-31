import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { profiles } from '@/db/schema';
import { createBirthdaySeason } from '@/actions/life-seasons';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Birthday Automation Cron Job
 * This endpoint should be called daily by a cron service (e.g., Vercel Cron, GitHub Actions)
 * It checks for users whose birthday is today and creates a new life season for them
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const todayMonth = today.getMonth() + 1; // 1-12
    const todayDay = today.getDate();

    // Get all user profiles
    const allProfiles = await db.select().from(profiles);

    const birthdayUsers: string[] = [];

    // Check each user's birthday
    for (const profile of allProfiles) {
      if (profile.dateOfBirth) {
        const birthDate = new Date(profile.dateOfBirth);
        const birthMonth = birthDate.getMonth() + 1;
        const birthDay = birthDate.getDate();

        // If today is their birthday
        if (birthMonth === todayMonth && birthDay === todayDay) {
          birthdayUsers.push(profile.userId);
          
          // Create new life season for this user
          const result = await createBirthdaySeason(profile.userId);
          
          if (!result.success) {
            console.error(`Failed to create birthday season for user ${profile.userId}:`, result.error);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${birthdayUsers.length} birthday(s)`,
      users: birthdayUsers.length,
    });

  } catch (error) {
    console.error('Birthday automation error:', error);
    return NextResponse.json(
      { error: 'Failed to process birthdays' },
      { status: 500 }
    );
  }
}
