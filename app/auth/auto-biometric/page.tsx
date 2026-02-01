'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Fingerprint, LogIn } from 'lucide-react';

export default function AutoBiometricLoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (status === 'authenticated') {
      router.push('/dashboard');
      return;
    }

    // Check if user has stored biometric email
    const storedEmail = localStorage.getItem('biometric_email');
    if (storedEmail) {
      setUserEmail(storedEmail);
      // Auto-trigger biometric authentication
      handleBiometricAuth(storedEmail);
    }
  }, [status]);

  async function handleBiometricAuth(email: string) {
    setIsAuthenticating(true);
    setError(null);

    try {
      // Import dynamically to avoid SSR issues
      const { startAuthentication } = await import('@simplewebauthn/browser');

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
      const authenticationResponse = await startAuthentication(options);

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

      if (result.verified) {
        // Success - redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error('Authentication verification failed');
      }
    } catch (err: any) {
      console.error('Biometric authentication error:', err);
      
      let errorMessage = 'Biometric authentication failed';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Authentication cancelled or permission denied';
      } else if (err.name === 'InvalidStateError') {
        errorMessage = 'No biometric credentials found';
      }
      
      setError(errorMessage);
      setIsAuthenticating(false);
    }
  }

  function handleUsePassword() {
    router.push('/auth/login');
  }

  function handleTryAgain() {
    if (userEmail) {
      handleBiometricAuth(userEmail);
    }
  }

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // If no biometric email stored, redirect to normal login
  if (!userEmail && !isAuthenticating) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${isAuthenticating ? 'bg-accent-primary/20 animate-pulse' : 'bg-accent-primary/10'}`}>
              <Fingerprint size={64} className="text-accent-primary" />
            </div>
          </div>
          <CardTitle className="text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Use Face ID or Touch ID to sign in
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {isAuthenticating && (
            <div className="text-center py-4">
              <p className="text-text-secondary">
                Authenticating...
              </p>
            </div>
          )}

          <div className="space-y-3">
            {error && (
              <Button 
                onClick={handleTryAgain} 
                fullWidth
                variant="secondary"
              >
                <Fingerprint size={18} className="mr-2" />
                Try Again
              </Button>
            )}

            <Button 
              onClick={handleUsePassword} 
              fullWidth 
              variant="text"
            >
              <LogIn size={18} className="mr-2" />
              Sign in with Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
