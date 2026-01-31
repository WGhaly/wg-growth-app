'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { logoutUser } from '@/actions/auth';
import { Mail, Shield } from 'lucide-react';
import { PageContainer } from '@/components/ui/Navigation';

export default function ProfilePage() {
  const { user } = useAuth();

  async function handleLogout() {
    await logoutUser();
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-text-secondary mt-1">Manage your account settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-bg-tertiary rounded-lg">
              <Mail className="w-5 h-5 text-accent-primary" />
              <div>
                <p className="text-sm text-text-tertiary">Email</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-bg-tertiary rounded-lg">
              <Shield className="w-5 h-5 text-accent-primary" />
              <div>
                <p className="text-sm text-text-tertiary">Role</p>
                <p className="font-semibold capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-bg-tertiary rounded-lg">
              <Shield className="w-5 h-5 text-accent-primary" />
              <div>
                <p className="text-sm text-text-tertiary">Biometric Authentication</p>
                <p className="font-semibold">
                  {user?.biometricEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border-default">
              <Button variant="danger" onClick={handleLogout} fullWidth>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageContainer>
  );
}
