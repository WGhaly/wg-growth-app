import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateWebAuthnRegistrationOptions } from '@/lib/webauthn';

export async function POST() {
  try {
    // Get current session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get profile for display name
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    const displayName = profile 
      ? `${profile.firstName} ${profile.lastName}`
      : user.email;

    // Parse existing credentials
    const existingCredentials = Array.isArray(user.webauthnCredentials)
      ? user.webauthnCredentials
      : [];

    // Generate registration options
    const options = await generateWebAuthnRegistrationOptions(
      user.id,
      user.email,
      displayName,
      existingCredentials
    );

    // Store challenge in database for verification
    await db
      .update(users)
      .set({ webauthnChallenge: options.challenge })
      .where(eq(users.id, user.id));

    return NextResponse.json(options);
  } catch (error) {
    console.error('WebAuthn registration options error:', error);
    return NextResponse.json(
      { error: 'Failed to generate registration options' },
      { status: 500 }
    );
  }
}
