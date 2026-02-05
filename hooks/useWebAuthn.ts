'use client';

import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type { 
  RegistrationResponseJSON, 
  AuthenticationResponseJSON 
} from '@simplewebauthn/types';

// Helper to log errors to server
async function logErrorToServer(context: string, error: any) {
  try {
    await fetch('/api/logs/client-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context,
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
          toString: error.toString(),
        },
        url: window.location.href,
        timestamp: new Date().toISOString(),
      })
    }).catch(() => {
      // Silently fail if logging fails
      console.warn('Failed to log error to server');
    });
  } catch (e) {
    // Don't let logging errors break the app
  }
}

export function useWebAuthn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register new credential (biometric setup)
  const registerCredential = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      // Get registration options from server
      const optionsResponse = await fetch('/api/webauthn/register/options', {
        method: 'POST'
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get registration options');
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
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Registration verification failed');
      }

      const result = await verifyResponse.json();

      if (!result.verified) {
        throw new Error('Registration verification failed');
      }

      // Store email for auto-biometric login
      if (result.email && typeof window !== 'undefined') {
        localStorage.setItem('biometric_email', result.email);
      }

      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('WebAuthn registration error:', err);
      
      // Log to server for debugging
      await logErrorToServer('WebAuthn Registration', err);
      
      // Provide user-friendly error messages
      let errorMessage = err.message || 'Failed to register biometric';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permission denied. Please allow biometric access and try again.';
      } else if (err.name === 'InvalidStateError') {
        errorMessage = 'This authenticator is already registered. Try using a different one.';
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Security error. Make sure you are on a secure connection (HTTPS or localhost).';
      } else if (err.name === 'AbortError') {
        errorMessage = 'Operation cancelled or timed out. Please try again.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  // Authenticate with existing credential (biometric login)
  const authenticateWithCredential = async (email: string): Promise<boolean> => {
    console.log('[useWebAuthn] Starting authentication for:', email);
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useWebAuthn] Fetching authentication options...');
      // Get authentication options from server
      const optionsResponse = await fetch('/api/webauthn/authenticate/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      console.log('[useWebAuthn] Options response status:', optionsResponse.status);
      if (!optionsResponse.ok) {
        const errorText = await optionsResponse.text();
        console.error('[useWebAuthn] Options response error:', errorText);
        throw new Error('Failed to get authentication options');
      }

      const options = await optionsResponse.json();
      console.log('[useWebAuthn] Got options, starting browser authentication...');

      // Start authentication with browser
      const authenticationResponse: AuthenticationResponseJSON = await startAuthentication(options);
      console.log('[useWebAuthn] Browser authentication complete');

      // Verify authentication with server
      console.log('[useWebAuthn] Verifying with server...');
      const verifyResponse = await fetch('/api/webauthn/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          response: authenticationResponse
        })
      });

      console.log('[useWebAuthn] Verify response status:', verifyResponse.status);
      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error('[useWebAuthn] Verify response error:', errorText);
        throw new Error('Authentication verification failed');
      }

      const result = await verifyResponse.json();
      console.log('[useWebAuthn] Verification result:', result);

      if (!result.verified) {
        throw new Error('Authentication verification failed');
      }

      // Sign in with NextAuth using biometric verification
      console.log('[useWebAuthn] Creating NextAuth session...');
      const { signIn } = await import('next-auth/react');
      const signInResult = await signIn('credentials', {
        email,
        biometricVerified: 'true',
        redirect: false
      });

      console.log('[useWebAuthn] SignIn result:', signInResult);
      if (signInResult?.error) {
        throw new Error('Failed to create session: ' + signInResult.error);
      }

      setIsLoading(false);
      console.log('[useWebAuthn] Authentication successful!');
      
      return true;
    } catch (err: any) {
      console.error('[useWebAuthn] Authentication error:', err);
      
      // Log to server for debugging
      await logErrorToServer('WebAuthn Authentication', err);
      
      setError(err.message || 'Failed to authenticate with biometric');
      setIsLoading(false);
      return false;
    }
  };

  // Authenticate with passwordless (discoverable credentials)
  const authenticatePasswordless = async (): Promise<boolean> => {
    console.log('[useWebAuthn] Starting passwordless authentication');
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useWebAuthn] Fetching passwordless authentication options...');
      // Get authentication options from server (no email)
      const optionsResponse = await fetch('/api/webauthn/authenticate/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // No email for passwordless
      });

      console.log('[useWebAuthn] Options response status:', optionsResponse.status);
      if (!optionsResponse.ok) {
        const errorText = await optionsResponse.text();
        console.error('[useWebAuthn] Options response error:', errorText);
        throw new Error('Failed to get authentication options');
      }

      const options = await optionsResponse.json();
      console.log('[useWebAuthn] Got options, starting browser authentication...');

      // Start authentication with browser (will use discoverable credentials)
      const authenticationResponse: AuthenticationResponseJSON = await startAuthentication(options);
      console.log('[useWebAuthn] Browser authentication complete, userHandle:', authenticationResponse.response.userHandle);

      // Verify authentication with server (no email, server uses userHandle)
      console.log('[useWebAuthn] Verifying with server...');
      const verifyResponse = await fetch('/api/webauthn/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: authenticationResponse
        })
      });

      console.log('[useWebAuthn] Verify response status:', verifyResponse.status);
      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error('[useWebAuthn] Verify response error:', errorText);
        throw new Error('Authentication verification failed');
      }

      const result = await verifyResponse.json();
      console.log('[useWebAuthn] Verification result:', result);

      if (!result.verified) {
        throw new Error('Authentication verification failed');
      }

      // Sign in with NextAuth using biometric verification
      console.log('[useWebAuthn] Creating NextAuth session...');
      const { signIn } = await import('next-auth/react');
      const signInResult = await signIn('credentials', {
        email: result.user?.email, // Email from verification result
        biometricVerified: 'true',
        redirect: false
      });

      console.log('[useWebAuthn] SignIn result:', signInResult);
      if (signInResult?.error) {
        throw new Error('Failed to create session: ' + signInResult.error);
      }

      setIsLoading(false);
      console.log('[useWebAuthn] Passwordless authentication successful!');
      
      return true;
    } catch (err: any) {
      console.error('[useWebAuthn] Passwordless authentication error:', err);
      
      // Log to server for debugging
      await logErrorToServer('WebAuthn Passwordless Authentication', err);
      
      setError(err.message || 'Failed to authenticate with biometric');
      setIsLoading(false);
      return false;
    }
  };

  return {
    registerCredential,
    authenticateWithCredential,
    authenticatePasswordless,
    isLoading,
    error
  };
}
