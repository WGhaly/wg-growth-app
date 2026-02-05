import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// One-time migration endpoint to create webauthn_challenges table
// Call this once after deployment to create the table
export async function POST(req: NextRequest) {
  try {
    // Check for admin secret to prevent unauthorized access
    const { secret } = await req.json();
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Migration] Creating webauthn_challenges table...');

    // Create table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS webauthn_challenges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        challenge VARCHAR(512) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);

    console.log('[Migration] Table created, adding index...');

    // Create index
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS webauthn_challenges_expires_at_idx 
      ON webauthn_challenges(expires_at)
    `);

    console.log('[Migration] Migration complete!');

    return NextResponse.json({ 
      success: true, 
      message: 'webauthn_challenges table created successfully' 
    });
  } catch (error) {
    console.error('[Migration] Error:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
