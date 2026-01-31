import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyWebAuthnRegistration, authenticatorDeviceToCredential } from '@/lib/webauthn';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

export async function POST(req: NextRequest) {
  try {
    // Get current session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body: RegistrationResponseJSON = await req.json();

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user || !user.webauthnChallenge) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
    }

    // Verify registration response
    const verification = await verifyWebAuthnRegistration(
      body,
      user.webauthnChallenge
    );

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }

    // Convert to storable format
    const newCredential = authenticatorDeviceToCredential({
      credentialID: verification.registrationInfo.credentialID,
      credentialPublicKey: verification.registrationInfo.credentialPublicKey,
      counter: verification.registrationInfo.counter,
      transports: body.response.transports
    });

    // Add to user's credentials
    const existingCredentials = Array.isArray(user.webauthnCredentials)
      ? user.webauthnCredentials
      : [];
    
    const updatedCredentials = [...existingCredentials, newCredential];

    // Update user
    await db
      .update(users)
      .set({
        webauthnCredentials: updatedCredentials,
        webauthnChallenge: null,
        biometricEnabled: true,
        lastBiometricVerification: new Date()
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error('WebAuthn registration verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
