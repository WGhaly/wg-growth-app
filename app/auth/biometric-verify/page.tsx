'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { Fingerprint } from 'lucide-react';

export default function BiometricVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const { authenticateWithCredential, isLoading, error } = useWebAuthn();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (email && attempts === 0) {
      handleVerify();
    }
  }, [email]);

  async function handleVerify() {
    if (!email) return;

    setAttempts(prev => prev + 1);
    const success = await authenticateWithCredential(email);

    if (success) {
      router.push('/dashboard');
    }
  }

  function handleUsePassword() {
    router.push('/auth/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${isLoading ? 'bg-accent-primary/20 animate-pulse' : 'bg-accent-primary/10'}`}>
              <Fingerprint size={64} className="text-accent-primary" />
            </div>
          </div>
          <CardTitle className="text-center">
            Biometric Verification
          </CardTitle>
          <CardDescription className="text-center">
            Use Face ID or Touch ID to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          {isLoading && (
            <div className="text-center py-4">
              <p className="text-text-secondary">
                Authenticating...
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleVerify} 
              fullWidth 
              isLoading={isLoading}
              disabled={!email}
            >
              <Fingerprint size={18} className="mr-2" />
              Verify with Biometric
            </Button>

            <Button 
              variant="secondary" 
              fullWidth 
              onClick={handleUsePassword}
              disabled={isLoading}
            >
              Use Password Instead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
