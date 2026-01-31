'use client';

import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type { 
  RegistrationResponseJSON, 
  AuthenticationResponseJSON 
} from '@simplewebauthn/types';

export function useWebAuthn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register new credential (biometric setup)
  const registerCredential = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get registration options from server
      const optionsResponse = await fetch('/api/webauthn/register/options', {
        method: 'POST'
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options');
      }

      const options = await optionsResponse.json();

      // Start registration with browser
      const registrationResponse: RegistrationResponseJSON = await startRegistration(options);

      // Verify registration with server
      const verifyResponse = await fetch('/api/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationResponse)
      });

      if (!verifyResponse.ok) {
        throw new Error('Registration verification failed');
      }

      const result = await verifyResponse.json();

      if (!result.verified) {
        throw new Error('Registration verification failed');
      }

      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('WebAuthn registration error:', err);
      setError(err.message || 'Failed to register biometric');
      setIsLoading(false);
      return false;
    }
  };

  // Authenticate with existing credential (biometric login)
  const authenticateWithCredential = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get authentication options from server
      const optionsResponse = await fetch('/api/webauthn/authenticate/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get authentication options');
      }

      const options = await optionsResponse.json();

      // Start authentication with browser
      const authenticationResponse: AuthenticationResponseJSON = await startAuthentication(options);

      // Verify authentication with server
      const verifyResponse = await fetch('/api/webauthn/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          response: authenticationResponse
        })
      });

      if (!verifyResponse.ok) {
        throw new Error('Authentication verification failed');
      }

      const result = await verifyResponse.json();

      if (!result.verified) {
        throw new Error('Authentication verification failed');
      }

      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('WebAuthn authentication error:', err);
      setError(err.message || 'Failed to authenticate with biometric');
      setIsLoading(false);
      return false;
    }
  };

  return {
    registerCredential,
    authenticateWithCredential,
    isLoading,
    error
  };
}
