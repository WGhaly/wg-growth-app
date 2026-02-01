'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { Fingerprint, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function SetupBiometricPage() {
  const router = useRouter();
  const { registerCredential, isLoading, error } = useWebAuthn();
  const [isSetup, setIsSetup] = useState(false);
  const [browserSupport, setBrowserSupport] = useState<{
    supported: boolean;
    platformAuthenticator: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    // Check WebAuthn support on mount
    async function checkSupport() {
      if (!window.PublicKeyCredential) {
        setBrowserSupport({
          supported: false,
          platformAuthenticator: false,
          message: 'Your browser does not support biometric authentication. Please use a modern browser like Chrome, Safari, or Edge.'
        });
        return;
      }

      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setBrowserSupport({
          supported: true,
          platformAuthenticator: available,
          message: available 
            ? undefined 
            : 'Platform authenticator not available. You may need to set up Face ID, Touch ID, or Windows Hello on your device.'
        });
      } catch (err) {
        console.error('Error checking authenticator:', err);
        setBrowserSupport({
          supported: true,
          platformAuthenticator: false,
          message: 'Could not detect biometric capabilities. You can still try to set it up.'
        });
      }
    }

    checkSupport();
  }, []);

  async function handleSetup() {
    const success = await registerCredential();
    
    if (success) {
      setIsSetup(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }

  function handleSkip() {
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {isSetup ? (
              <CheckCircle size={64} className="text-semantic-success" />
            ) : (
              <Fingerprint size={64} className="text-accent-primary" />
            )}
          </div>
          <CardTitle className="text-center">
            {isSetup ? 'Biometric Setup Complete!' : 'Setup Biometric Authentication'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSetup
              ? 'You can now use Face ID or Touch ID to sign in'
              : 'Use your device biometrics for secure, fast access'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {browserSupport && !browserSupport.supported && (
            <Alert variant="error">
              <AlertCircle className="w-5 h-5" />
              <div>
                <strong>Browser Not Supported</strong>
                <p className="text-sm mt-1">{browserSupport.message}</p>
              </div>
            </Alert>
          )}

          {browserSupport && browserSupport.supported && !browserSupport.platformAuthenticator && browserSupport.message && (
            <Alert variant="warning">
              <AlertCircle className="w-5 h-5" />
              <div>
                <strong>Warning</strong>
                <p className="text-sm mt-1">{browserSupport.message}</p>
              </div>
            </Alert>
          )}

          {error && (
            <Alert variant="error">
              <AlertCircle className="w-5 h-5" />
              <div>
                <strong>Setup Failed</strong>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </Alert>
          )}

          {isSetup && (
            <Alert variant="success">
              <CheckCircle className="w-5 h-5" />
              Biometric authentication enabled successfully!
            </Alert>
          )}

          {!isSetup && (
            <>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-bg-tertiary rounded-lg">
                  <Shield className="w-5 h-5 text-accent-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Enhanced Security</h4>
                    <p className="text-sm text-text-secondary">
                      Your biometric data never leaves your device and provides an additional layer of security.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-bg-tertiary rounded-lg">
                  <CheckCircle className="w-5 h-5 text-accent-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Quick Access</h4>
                    <p className="text-sm text-text-secondary">
                      Sign in instantly with Face ID or Touch ID without entering your password.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSetup} 
                fullWidth 
                isLoading={isLoading}
                disabled={browserSupport !== null && !browserSupport.supported}
              >
                <Fingerprint size={18} className="mr-2" />
                Setup Biometric Authentication
              </Button>
            </>
          )}
        </CardContent>

        <CardFooter>
          {!isSetup && (
            <Button 
              variant="text" 
              fullWidth 
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip for now
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
