'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { verifyEmail } from '@/actions/auth';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      handleVerification(token);
    }
  }, [token]);

  async function handleVerification(verificationToken: string) {
    setIsVerifying(true);
    setError(null);

    const result = await verifyEmail(verificationToken);

    if (result.success) {
      setIsVerified(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } else {
      setError(result.error || 'Failed to verify email');
    }

    setIsVerifying(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {isVerified ? (
              <CheckCircle2 size={64} className="text-semantic-success" />
            ) : error ? (
              <AlertCircle size={64} className="text-semantic-error" />
            ) : (
              <Mail size={64} className="text-accent-primary" />
            )}
          </div>
          <CardTitle className="text-center">
            {isVerified ? 'Email Verified!' : 'Verify Your Email'}
          </CardTitle>
          <CardDescription className="text-center">
            {isVerified
              ? 'Your email has been successfully verified'
              : 'Check your inbox for a verification link'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          {isVerifying && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
              <p className="mt-4 text-text-secondary">Verifying your email...</p>
            </div>
          )}

          {isVerified && (
            <Alert variant="success">
              Redirecting you to login...
            </Alert>
          )}

          {!token && !isVerifying && !isVerified && (
            <div className="space-y-4">
              <p className="text-text-secondary text-center">
                We've sent a verification link to your email address. 
                Click the link to verify your account and complete registration.
              </p>
              
              <div className="pt-4">
                <Link href="/auth/login">
                  <Button variant="secondary" fullWidth>
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {error && (
            <div className="pt-4">
              <Link href="/auth/register">
                <Button variant="secondary" fullWidth>
                  Register Again
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
