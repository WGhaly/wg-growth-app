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
  const vercelUrl = process.env.VERCEL_URL;
  
  // Use environment variables if explicitly set
  if (process.env.WEBAUTHN_RP_ID && process.env.WEBAUTHN_ORIGIN) {
    return {
      rpName: process.env.WEBAUTHN_RP_NAME || 'WG Life OS',
      rpId: process.env.WEBAUTHN_RP_ID,
      origin: process.env.WEBAUTHN_ORIGIN
    };
  }
  
  // Auto-detect for Vercel deployment
  if (isProduction && vercelUrl) {
    const domain = vercelUrl.replace(/^https?:\/\//, '');
    return {
      rpName: process.env.WEBAUTHN_RP_NAME || 'WG Life OS',
      rpId: domain,
      origin: `https://${domain}`
    };
  }
  
  // Default to localhost for development
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
      residentKey: 'preferred',
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
  existingCredentials: AuthenticatorDevice[] = []
): Promise<ReturnType<typeof generateAuthenticationOptions>> {
  const options: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: existingCredentials.map(device => ({
      id: device.credentialID,
      type: 'public-key',
      transports: device.transports
    })),
    userVerification: 'preferred',
    rpID: RP_ID
  };

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
