'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Fingerprint } from 'lucide-react';

export default function AutoLockPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { authenticateWithCredential, isLoading, error } = useWebAuthn();
  const [unlockError, setUnlockError] = useState<string | null>(null);

  async function handleUnlock() {
    if (!user?.email) {
      setUnlockError('Session expired. Please log in again.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      return;
    }

    const success = await authenticateWithCredential(user.email);

    if (success) {
      router.push('/dashboard');
    } else {
      setUnlockError('Failed to unlock. Please try again.');
    }
  }

  function handleSignOut() {
    router.push('/auth/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-semantic-warning/20">
              <Lock size={64} className="text-semantic-warning" />
            </div>
          </div>
          <CardTitle className="text-center">
            Session Locked
          </CardTitle>
          <CardDescription className="text-center">
            Your session was locked due to inactivity
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {(error || unlockError) && (
            <Alert variant="error">
              {error || unlockError}
            </Alert>
          )}

          <div className="py-4 px-6 bg-bg-tertiary rounded-lg text-center">
            <p className="text-sm text-text-secondary">
              For your security, WG Life OS automatically locks after 15 minutes of inactivity.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleUnlock} 
              fullWidth 
              isLoading={isLoading}
            >
              <Fingerprint size={18} className="mr-2" />
              Unlock with Biometric
            </Button>

            <Button 
              variant="secondary" 
              fullWidth 
              onClick={handleSignOut}
              disabled={isLoading}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
