import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateWebAuthnRegistrationOptions, credentialToAuthenticatorDevice } from '@/lib/webauthn';

export async function POST() {
  try {
    console.log('[WebAuthn Register] Starting registration options request');
    console.log('[WebAuthn Register] Environment:', process.env.NODE_ENV);
    console.log('[WebAuthn Register] Headers:', {
      origin: process.env.WEBAUTHN_ORIGIN,
      rpId: process.env.WEBAUTHN_RP_ID,
    });
    
    // Get current session
    const session = await auth();
    
    if (!session?.user) {
      console.log('[WebAuthn Register] Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[WebAuthn Register] User authenticated:', session.user.id);

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

    // Parse existing credentials and convert to AuthenticatorDevice format
    const existingCredentials = Array.isArray(user.webauthnCredentials)
      ? user.webauthnCredentials
      : [];
    
    const authenticatorDevices = existingCredentials.map((cred: any) => 
      credentialToAuthenticatorDevice(cred)
    );

    // Generate registration options
    const options = await generateWebAuthnRegistrationOptions(
      user.id,
      user.email,
      displayName,
      authenticatorDevices
    );
    
    console.log('[WebAuthn Register] Options.rp:', options.rp);
    console.log('[WebAuthn Register] Options.user:', { 
      id: options.user.id, 
      name: options.user.name 
    });

    console.log('[WebAuthn Register] Generated options successfully');

    // Store challenge in database for verification
    await db
      .update(users)
      .set({ webauthnChallenge: options.challenge })
      .where(eq(users.id, user.id));

    return NextResponse.json(options);
  } catch (error) {
    console.error('[WebAuthn Register] Error generating options:', error);
    return NextResponse.json(
      { error: 'Failed to generate registration options' },
      { status: 500 }
    );
  }
}
