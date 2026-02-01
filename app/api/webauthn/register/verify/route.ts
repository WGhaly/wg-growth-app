import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyWebAuthnRegistration, authenticatorDeviceToCredential } from '@/lib/webauthn';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

export async function POST(req: NextRequest) {
  try {
    console.log('[WebAuthn Register Verify] Starting verification');
    
    // Get current session
    const session = await auth();
    
    if (!session?.user) {
      console.log('[WebAuthn Register Verify] Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[WebAuthn Register Verify] User authenticated:', session.user.id);

    // Get request body
    const body: RegistrationResponseJSON = await req.json();
    console.log('[WebAuthn Register Verify] Received registration response');
    console.log('[WebAuthn Register Verify] Response ID:', body.id?.substring(0, 20));

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

    console.log('[WebAuthn Register Verify] Verification result:', verification.verified);

    if (!verification.verified || !verification.registrationInfo) {
      console.log('[WebAuthn Register Verify] Verification failed');
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }

    console.log('[WebAuthn Register Verify] Credential registered successfully');

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

    return NextResponse.json({ 
      verified: true,
      email: user.email 
    });
  } catch (error) {
    console.error('WebAuthn registration verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
