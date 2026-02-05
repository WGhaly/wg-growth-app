import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateRegistrationOptionsOpts,
  type GenerateAuthenticationOptionsOpts,
  type VerifyRegistrationResponseOpts,
  type VerifyAuthenticationResponseOpts,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorDevice
} from '@simplewebauthn/types';

// ============================================================================
// WebAuthn Configuration
// ============================================================================

// Get configuration from environment or infer from deployment
const getWebAuthnConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Use environment variables if explicitly set
  if (process.env.WEBAUTHN_RP_ID && process.env.WEBAUTHN_ORIGIN) {
    const rpId = process.env.WEBAUTHN_RP_ID.trim();
    const origin = process.env.WEBAUTHN_ORIGIN.trim();
    console.log('[WebAuthn] Using explicit configuration:', {
      rpId,
      origin
    });
    return {
      rpName: (process.env.WEBAUTHN_RP_NAME || 'WG Life OS').trim(),
      rpId,
      origin
    };
  }
  
  // Try to get from NEXTAUTH_URL or PUBLIC_APP_URL
  const appUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL)?.trim();
  if (isProduction && appUrl) {
    try {
      const url = new URL(appUrl);
      const rpId = url.hostname;
      const origin = url.origin;
      console.log('[WebAuthn] Using app URL configuration:', { rpId, origin, source: appUrl });
      return {
        rpName: process.env.WEBAUTHN_RP_NAME || 'WG Life OS',
        rpId,
        origin
      };
    } catch (err) {
      console.error('[WebAuthn] Failed to parse app URL:', appUrl, err);
    }
  }
  
  // Try Vercel URL as fallback
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (isProduction && vercelUrl) {
    const domain = vercelUrl.replace(/^https?:\/\//, '').trim();
    const config = {
      rpName: (process.env.WEBAUTHN_RP_NAME || 'WG Life OS').trim(),
      rpId: domain,
      origin: `https://${domain}`
    };
    console.log('[WebAuthn] Using VERCEL_URL configuration:', config);
    return config;
  }
  
  // Default to localhost for development
  console.log('[WebAuthn] Using localhost configuration');
  return {
    rpName: 'WG Life OS',
    rpId: 'localhost',
    origin: 'http://localhost:3000'
  };
};

const config = getWebAuthnConfig();
const RP_NAME = config.rpName;
const RP_ID = config.rpId;
const ORIGIN = config.origin;

// Log configuration on startup (helps with debugging)
console.log('[WebAuthn] Configuration loaded:', { RP_NAME, RP_ID, ORIGIN });

// ============================================================================
// Registration Options
// ============================================================================

export async function generateWebAuthnRegistrationOptions(
  userId: string,
  userName: string,
  userDisplayName: string,
  existingCredentials: AuthenticatorDevice[] = []
): Promise<ReturnType<typeof generateRegistrationOptions>> {
  const options: GenerateRegistrationOptionsOpts = {
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: userId,
    userName: userName,
    userDisplayName: userDisplayName,
    timeout: 60000,
    attestationType: 'none',
    excludeCredentials: existingCredentials.map(device => ({
      id: device.credentialID,
      type: 'public-key',
      transports: device.transports
    })),
    authenticatorSelection: {
      residentKey: 'required', // Required for passwordless/discoverable credentials
      userVerification: 'preferred',
      authenticatorAttachment: 'platform' // Prefer platform authenticators (Face ID, Touch ID)
    }
  };

  return generateRegistrationOptions(options);
}

// ============================================================================
// Verify Registration Response
// ============================================================================

export async function verifyWebAuthnRegistration(
  response: RegistrationResponseJSON,
  expectedChallenge: string
): Promise<VerifiedRegistrationResponse> {
  const options: VerifyRegistrationResponseOpts = {
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID
  };

  return verifyRegistrationResponse(options);
}

// ============================================================================
// Authentication Options
// ============================================================================

export async function generateWebAuthnAuthenticationOptions(
  existingCredentials?: AuthenticatorDevice[]
): Promise<ReturnType<typeof generateAuthenticationOptions>> {
  const options: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    userVerification: 'preferred',
    rpID: RP_ID
  };

  // Only include allowCredentials if we have credentials (traditional flow)
  // For passwordless flow, omit this to allow discoverable credentials
  if (existingCredentials && existingCredentials.length > 0) {
    options.allowCredentials = existingCredentials.map(device => ({
      id: device.credentialID,
      type: 'public-key',
      transports: device.transports
    }));
  }

  return generateAuthenticationOptions(options);
}

// ============================================================================
// Verify Authentication Response
// ============================================================================

export async function verifyWebAuthnAuthentication(
  response: AuthenticationResponseJSON,
  expectedChallenge: string,
  authenticator: AuthenticatorDevice
): Promise<VerifiedAuthenticationResponse> {
  const options: VerifyAuthenticationResponseOpts = {
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    authenticator
  };

  return verifyAuthenticationResponse(options);
}

// ============================================================================
// Helper: Convert Credential to AuthenticatorDevice
// ============================================================================

export function credentialToAuthenticatorDevice(credential: any): AuthenticatorDevice {
  return {
    credentialID: Buffer.from(credential.credentialID, 'base64'),
    credentialPublicKey: Buffer.from(credential.credentialPublicKey, 'base64'),
    counter: credential.counter,
    transports: credential.transports
  };
}

// ============================================================================
// Helper: Convert AuthenticatorDevice to Storable Credential
// ============================================================================

export function authenticatorDeviceToCredential(device: AuthenticatorDevice) {
  return {
    credentialID: Buffer.from(device.credentialID).toString('base64'),
    credentialPublicKey: Buffer.from(device.credentialPublicKey).toString('base64'),
    counter: device.counter,
    transports: device.transports
  };
}
