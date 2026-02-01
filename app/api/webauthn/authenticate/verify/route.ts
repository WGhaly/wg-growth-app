import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyWebAuthnAuthentication, credentialToAuthenticatorDevice } from '@/lib/webauthn';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';

export async function POST(req: NextRequest) {
  try {
    const body: { email: string; response: AuthenticationResponseJSON } = await req.json();
    console.log('[WebAuthn Auth Verify] Request for email:', body.email, 'Response ID:', body.response?.id);

    if (!body.email || !body.response) {
      console.error('[WebAuthn Auth Verify] Missing email or response');
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);
    
    console.log('[WebAuthn Auth Verify] User found:', !!user, 'Has challenge:', !!user?.webauthnChallenge);

    if (!user || !user.webauthnChallenge) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
    }

    // Parse existing credentials
    const existingCredentials = Array.isArray(user.webauthnCredentials)
      ? user.webauthnCredentials
      : [];

    // Find the credential being used
    const credentialId = body.response.id;
    console.log('[WebAuthn Auth Verify] Looking for credential ID:', credentialId);
    console.log('[WebAuthn Auth Verify] Available credential IDs:', existingCredentials.map((c: any) => c.credentialID));
    
    // Normalize base64 strings by removing padding for comparison
    const normalizeBase64 = (str: string) => str.replace(/=+$/, '');
    
    const credential = existingCredentials.find(
      (cred: any) => normalizeBase64(cred.credentialID) === normalizeBase64(credentialId)
    );

    if (!credential) {
      console.error('[WebAuthn Auth Verify] Credential not found in user records');
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 400 }
      );
    }
    
    console.log('[WebAuthn Auth Verify] Credential found, converting to AuthenticatorDevice');

    // Convert to AuthenticatorDevice format
    const authenticator = credentialToAuthenticatorDevice(credential);
    console.log('[WebAuthn Auth Verify] Authenticator device created, calling verification');

    // Verify authentication response
    const verification = await verifyWebAuthnAuthentication(
      body.response,
      user.webauthnChallenge,
      authenticator
    );
    
    console.log('[WebAuthn Auth Verify] Verification result:', verification.verified);

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
    console.error('[WebAuthn Auth Verify] ERROR:', error);
    console.error('[WebAuthn Auth Verify] Error stack:', error instanceof Error ? error.stack : 'No stack');
    const errorMessage = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json(
      { 
        error: 'Authentication verification failed',
        details: errorMessage,
        errorName: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    );
  }
}
