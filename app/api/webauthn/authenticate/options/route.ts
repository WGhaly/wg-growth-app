import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, webauthnChallenges } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateWebAuthnAuthenticationOptions, credentialToAuthenticatorDevice } from '@/lib/webauthn';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    console.log('[WebAuthn Auth Options] Request for email:', email);

    // Passwordless flow - no email provided
    if (!email) {
      console.log('[WebAuthn Auth Options] Passwordless authentication - generating discoverable credential options');
      
      // Generate options without allowCredentials for discoverable credentials
      const options = await generateWebAuthnAuthenticationOptions();
      
      // Store challenge in temporary table (expires in 5 minutes)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await db.insert(webauthnChallenges).values({
        challenge: options.challenge,
        expiresAt
      });
      
      console.log('[WebAuthn Auth Options] Passwordless options generated and challenge stored');
      return NextResponse.json(options);
    }

    // Traditional flow - email provided
    console.log('[WebAuthn Auth Options] Traditional email-based authentication');
    
    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    console.log('[WebAuthn Auth Options] User found:', !!user, 'Biometric enabled:', user?.biometricEnabled);

    if (!user || !user.biometricEnabled) {
      return NextResponse.json(
        { error: 'Biometric authentication not set up for this account' },
        { status: 400 }
      );
    }

    // Parse existing credentials and convert to AuthenticatorDevice format
    const existingCredentials = Array.isArray(user.webauthnCredentials)
      ? user.webauthnCredentials
      : [];
    
    console.log('[WebAuthn Auth Options] Credentials count:', existingCredentials.length);

    if (existingCredentials.length === 0) {
      console.error('[WebAuthn Auth Options] No credentials registered for user');
      return NextResponse.json(
        { error: 'No credentials registered' },
        { status: 400 }
      );
    }

    const authenticatorDevices = existingCredentials.map((cred: any) => 
      credentialToAuthenticatorDevice(cred)
    );

    // Generate authentication options
    const options = await generateWebAuthnAuthenticationOptions(authenticatorDevices);

    // Store challenge in database for verification
    await db
      .update(users)
      .set({ webauthnChallenge: options.challenge })
      .where(eq(users.id, user.id));
    
    console.log('[WebAuthn Auth Options] Options generated successfully, challenge stored');
    return NextResponse.json(options);
  } catch (error) {
    console.error('WebAuthn authentication options error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication options' },
      { status: 500 }
    );
  }
}
