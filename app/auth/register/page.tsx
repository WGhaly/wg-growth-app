'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { registerUser } from '@/actions/auth';
import { Mail, Lock, User, Calendar } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      dateOfBirth: formData.get('dateOfBirth') as string
    };

    const result = await registerUser(data);

    if (result.success) {
      setSuccess(result.message || 'Account created successfully!');
      setTimeout(() => {
        router.push('/auth/verify-email');
      }, 2000);
    } else {
      setError(result.error || 'Failed to create account');
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Join WG Life OS and start building your personal operating system
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success">
                {success}
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="firstName"
                label="First Name"
                icon={<User size={18} />}
                required
                disabled={isLoading}
              />
              <Input
                name="lastName"
                label="Last Name"
                icon={<User size={18} />}
                required
                disabled={isLoading}
              />
            </div>

            <Input
              name="email"
              type="email"
              label="Email"
              icon={<Mail size={18} />}
              required
              disabled={isLoading}
            />

            <Input
              name="dateOfBirth"
              type="date"
              label="Date of Birth"
              icon={<Calendar size={18} />}
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
              helperText="Min 12 characters with uppercase, lowercase, number, and special character"
            />

            <Button type="submit" fullWidth isLoading={isLoading}>
              Create Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-4">
          <div className="text-sm text-text-secondary text-center">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-accent-primary hover:text-accent-hover">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
