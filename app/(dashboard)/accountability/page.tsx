'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { InvitePartnerModal } from '@/components/accountability/InvitePartnerModal';
import { 
  getAccountabilityLinks, 
  deleteAccountabilityLink,
  updateAccountabilityLink,
  getPendingInvites 
} from '@/actions/accountability';
import { UserPlus, Shield, Trash2, Eye, Mail } from 'lucide-react';
import { PageContainer } from '@/components/ui/Navigation';

interface AccountabilityLink {
  link: {
    id: string;
    ownerId: string;
    accountabilityPartnerId: string;
    scopesGranted: string[];
    status: string;
    invitedAt: Date;
    acceptedAt: Date | null;
    revokedAt: Date | null;
    revocationReason: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  partner?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  owner?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface PendingInvite {
  id: string;
  token: string;
  ownerId: string;
  inviteeEmail: string;
  scopesOffered: string[];
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export default function AccountabilityPage() {
  const [ownedLinks, setOwnedLinks] = useState<AccountabilityLink[]>([]);
  const [partnerLinks, setPartnerLinks] = useState<AccountabilityLink[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    
    const [linksResult, invitesResult] = await Promise.all([
      getAccountabilityLinks(),
      getPendingInvites()
    ]);

    if (linksResult.success && linksResult.data) {
      setOwnedLinks(linksResult.data.ownedLinks as AccountabilityLink[]);
      setPartnerLinks(linksResult.data.partnerLinks as AccountabilityLink[]);
    }

    if (invitesResult.success && invitesResult.data) {
      setPendingInvites(invitesResult.data as PendingInvite[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevoke = async (linkId: string) => {
    if (!confirm('Are you sure you want to revoke this accountability link?')) return;

    const reason = prompt('Optional: Provide a reason for revocation');
    const result = await updateAccountabilityLink(linkId, {
      status: 'revoked',
      revocationReason: reason || undefined
    });

    if (result.success) {
      alert('Accountability link revoked');
      loadData();
    } else {
      alert(result.error || 'Failed to revoke link');
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to permanently delete this link?')) return;

    const result = await deleteAccountabilityLink(linkId);
    if (result.success) {
      alert('Link deleted');
      loadData();
    } else {
      alert(result.error || 'Failed to delete link');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatScopes = (scopes: string[]) => {
    return scopes.map(s => s.replace(/_/g, ' ')).join(', ');
  };

  return (
    <PageContainer>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Accountability Partners</h1>
          <p className="text-text-secondary">
            Invite trusted friends to hold you accountable in your journey
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Partner
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">Loading...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Pending Invitations ({pendingInvites.length})
              </h2>
              <div className="space-y-3">
                {pendingInvites.map((invite) => {
                  const isExpired = new Date() > new Date(invite.expiresAt);
                  return (
                    <Card key={invite.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{invite.inviteeEmail}</p>
                          <p className="text-sm text-text-secondary mt-1">
                            Scopes: {formatScopes(invite.scopesOffered)}
                          </p>
                          <p className="text-xs text-text-tertiary mt-1">
                            {isExpired ? (
                              <span className="text-red-600">Expired on {formatDate(invite.expiresAt)}</span>
                            ) : (
                              <span>Expires on {formatDate(invite.expiresAt)}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Partners I'm Sharing With */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              People Watching Me ({ownedLinks.length})
            </h2>
            {ownedLinks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-text-secondary">No accountability partners yet</p>
                <p className="text-sm text-text-tertiary mt-2">
                  Invite someone to hold you accountable
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {ownedLinks.map(({ link, partner }) => (
                  <Card key={link.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">
                          {partner?.firstName} {partner?.lastName}
                        </p>
                        <p className="text-sm text-text-secondary">{partner?.email}</p>
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            link.status === 'active' 
                              ? 'bg-green-100 text-green-700'
                              : link.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {link.status}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mt-2">
                          Can see: {formatScopes(link.scopesGranted)}
                        </p>
                        <p className="text-xs text-text-tertiary mt-1">
                          {link.acceptedAt 
                            ? `Accepted on ${formatDate(link.acceptedAt)}`
                            : `Invited on ${formatDate(link.invitedAt)}`}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {link.status === 'active' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRevoke(link.id)}
                          >
                            Revoke
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* People I'm Watching */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              People I'm Watching ({partnerLinks.length})
            </h2>
            {partnerLinks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-text-secondary">You're not watching anyone yet</p>
                <p className="text-sm text-text-tertiary mt-2">
                  Accept an invitation to become someone's accountability partner
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {partnerLinks.map(({ link, owner }) => (
                  <Card key={link.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">
                          {owner?.firstName} {owner?.lastName}
                        </p>
                        <p className="text-sm text-text-secondary">{owner?.email}</p>
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            link.status === 'active' 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {link.status}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mt-2">
                          You can see: {formatScopes(link.scopesGranted)}
                        </p>
                        <p className="text-xs text-text-tertiary mt-1">
                          Accepted on {formatDate(link.acceptedAt || link.createdAt)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.location.href = `/accountability/view/${link.ownerId}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <InvitePartnerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={loadData}
      />
    </div>
    </PageContainer>
  );
}
