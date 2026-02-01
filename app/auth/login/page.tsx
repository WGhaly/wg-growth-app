'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { loginUser } from '@/actions/auth';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { Mail, Lock, Fingerprint } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [hasBiometricEmail, setHasBiometricEmail] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const { authenticateWithCredential, isLoading: isBiometricLoading } = useWebAuthn();

  // Check for stored biometric email and standalone mode
  useState(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('biometric_email');
      if (storedEmail) {
        setEmail(storedEmail);
        setHasBiometricEmail(true);
      }
      // Check if running as PWA
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
    }
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };

    setEmail(data.email);

    const result = await loginUser(data);

    if (result.success) {
      if (result.requiresBiometric) {
        // Redirect to biometric verification
        router.push(`/auth/biometric-verify?email=${encodeURIComponent(data.email)}`);
      } else {
        // Redirect to setup biometric
        router.push('/auth/setup-biometric');
      }
    } else {
      setError(result.error || 'Failed to log in');
    }

    setIsLoading(false);
  }

  async function handleBiometricLogin() {
    // Get stored email if not already set
    let emailToUse = email;
    if (!emailToUse) {
      const storedEmail = localStorage.getItem('biometric_email');
      if (storedEmail) {
        emailToUse = storedEmail;
        setEmail(storedEmail);
      } else {
        setError('Please enter your email first or set up biometrics');
        return;
      }
    }

    const success = await authenticateWithCredential(emailToUse);

    if (success) {
      router.push('/dashboard');
    } else {
      setError('Biometric authentication failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      {!isStandalone && (
        <div className="fixed top-0 left-0 right-0 bg-accent-primary text-white px-4 py-3 text-center z-50">
          <p className="text-sm font-medium">
            📱 For the best app experience: Tap Share → Add to Home Screen
          </p>
        </div>
      )}
      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your WG Life OS account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Input
              name="email"
              type="email"
              label="Email"
              icon={<Mail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            <Input
              name="password"
              type="password"
              label="Password"
              icon={<Lock size={18} />}
              required
              disabled={isLoading}
            />

            <Button type="submit" fullWidth isLoading={isLoading}>
              Sign In
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-default"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-bg-secondary text-text-tertiary">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleBiometricLogin}
              isLoading={isBiometricLoading}
              disabled={!email && !hasBiometricEmail}
            >
              <Fingerprint size={18} className="mr-2" />
              Sign in with Biometric
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-4">
          <div className="text-sm text-text-secondary text-center">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-accent-primary hover:text-accent-hover">
              Create one
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
