import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyWebAuthnAuthentication, credentialToAuthenticatorDevice } from '@/lib/webauthn';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';

export async function POST(req: NextRequest) {
  try {
    const body: { email: string; response: AuthenticationResponseJSON } = await req.json();

    if (!body.email || !body.response) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (!user || !user.webauthnChallenge) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
    }

    // Parse existing credentials
    const existingCredentials = Array.isArray(user.webauthnCredentials)
      ? user.webauthnCredentials
      : [];

    // Find the credential being used
    const credentialId = body.response.id;
    const credential = existingCredentials.find(
      (cred: any) => cred.credentialID === credentialId
    );

    if (!credential) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 400 }
      );
    }

    // Convert to AuthenticatorDevice format
    const authenticator = credentialToAuthenticatorDevice(credential);

    // Verify authentication response
    const verification = await verifyWebAuthnAuthentication(
      body.response,
      user.webauthnChallenge,
      authenticator
    );

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }

    // Update counter for the credential
    const updatedCredentials = existingCredentials.map((cred: any) => {
      if (cred.credentialID === credentialId) {
        return {
          ...cred,
          counter: verification.authenticationInfo.newCounter
        };
      }
      return cred;
    });

    // Update user
    await db
      .update(users)
      .set({
        webauthnCredentials: updatedCredentials,
        webauthnChallenge: null,
        lastBiometricVerification: new Date(),
        lastActivity: new Date(),
        sessionExpiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      verified: true,
      userId: user.id,
      email: user.email
    });
  } catch (error) {
    console.error('WebAuthn authentication verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json(
      { 
        error: 'Authentication verification failed',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
