import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateWebAuthnAuthenticationOptions, credentialToAuthenticatorDevice } from '@/lib/webauthn';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

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

    if (existingCredentials.length === 0) {
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

    return NextResponse.json(options);
  } catch (error) {
    console.error('WebAuthn authentication options error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication options' },
      { status: 500 }
    );
  }
}
