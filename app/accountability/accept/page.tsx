'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { acceptAccountabilityInvite } from '@/actions/accountability';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { Suspense } from 'react';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided');
    }
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const result = await acceptAccountabilityInvite({ token });

      if (result.success) {
        setAccepted(true);
        setTimeout(() => {
          router.push('/accountability');
        }, 2000);
      } else {
        setError(result.error || 'Failed to accept invitation');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-secondary">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Accountability Partnership</h1>
          <p className="text-text-secondary">
            You've been invited to be an accountability partner
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-5 w-5" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        ) : accepted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Invitation Accepted!</p>
                <p className="text-sm text-green-700 mt-1">
                  Redirecting to your accountability dashboard...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                By accepting this invitation, you agree to hold this person accountable 
                in their spiritual and personal growth journey. You'll be able to view 
                the areas they've chosen to share with you.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={handleAccept}
                disabled={loading || !token}
              >
                {loading ? 'Accepting...' : 'Accept Invitation'}
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => router.push('/dashboard')}
              >
                Decline
              </Button>
            </div>
          </>
        )}

        <p className="text-xs text-center text-text-tertiary mt-6">
          You must be logged in to accept this invitation
        </p>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary flex items-center justify-center">Loading...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
