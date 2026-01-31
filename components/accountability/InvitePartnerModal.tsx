'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createAccountabilityInvite } from '@/actions/accountability';

interface InvitePartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PERMISSION_SCOPES = [
  { value: 'profile', label: 'Profile', description: 'Basic profile information' },
  { value: 'identity', label: 'Identity', description: 'Manifesto, values, and calling' },
  { value: 'goals', label: 'Goals', description: 'All goals and progress' },
  { value: 'routines', label: 'Routines', description: 'Daily/weekly routines and completions' },
  { value: 'habits', label: 'All Habits', description: 'Good and bad habits' },
  { value: 'habits_good', label: 'Good Habits Only', description: 'Only good habits' },
  { value: 'habits_bad', label: 'Bad Habits Only', description: 'Only bad habits' },
  { value: 'relationships', label: 'Relationships', description: 'People and interactions' },
  { value: 'prayer', label: 'Prayer', description: 'Prayer items and requests' },
  { value: 'finance', label: 'Finance', description: 'Financial accounts and investments' },
  { value: 'business', label: 'Business', description: 'Companies and revenue' },
  { value: 'insights', label: 'Insights', description: 'AI-generated insights' },
];

export function InvitePartnerModal({ open, onOpenChange, onSuccess }: InvitePartnerModalProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [inviteUrl, setInviteUrl] = useState('');

  const toggleScope = (scope: string) => {
    setSelectedScopes(prev =>
      prev.includes(scope)
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createAccountabilityInvite({
        inviteeEmail: email,
        scopes: selectedScopes,
        expiresInDays,
      });

      if (result.success) {
        setInviteUrl(result.inviteUrl || '');
        alert('Invitation created! Share the link below with your partner.');
        onSuccess?.();
      } else {
        alert(result.error || 'Failed to create invitation');
      }
    } catch (error) {
      alert('Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSelectedScopes([]);
    setExpiresInDays(7);
    setInviteUrl('');
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-bg-secondary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border-default">
        <div className="p-6 border-b border-border-default">
          <h2 className="text-xl font-semibold text-text-primary">Invite Accountability Partner</h2>
          <p className="text-sm text-text-secondary mt-1">
            Grant someone access to specific areas of your life for accountability
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!inviteUrl ? (
            <>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Partner's Email *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-3">
                  Grant Access To: *
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {PERMISSION_SCOPES.map((scope) => (
                    <label
                      key={scope.value}
                      className="flex items-start gap-3 p-2 hover:bg-bg-secondary rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope.value)}
                        onChange={() => toggleScope(scope.value)}
                        className="mt-1 rounded border-border-default"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{scope.label}</div>
                        <div className="text-xs text-text-secondary">{scope.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedScopes.length === 0 && (
                  <p className="text-xs text-red-600">Select at least one permission</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="expires" className="block text-sm font-medium text-text-primary">
                  Invitation Expires In
                </label>
                <select
                  id="expires"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary"
                >
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={0}>Never expires</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || selectedScopes.length === 0}
                >
                  {loading ? 'Creating...' : 'Create Invitation'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <p className="text-green-400 font-medium">✓ Invitation Created!</p>
                  <p className="text-sm text-green-300 mt-1">
                    Share this link with your accountability partner
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Invitation Link</label>
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}${inviteUrl}`}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}${inviteUrl}`);
                        alert('Link copied to clipboard!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-text-secondary">
                  This invitation will expire in {expiresInDays} day{expiresInDays > 1 ? 's' : ''}.
                  The recipient must have an account to accept.
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-border-default">
                <Button onClick={handleClose}>
                  Done
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
