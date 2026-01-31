'use client';

import { useState } from 'react';
import { deletePerson, updateLastContactedAt } from '@/actions/people';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MoreVertical, Edit, Trash2, MessageCircle, Phone, Mail, Calendar, Shield, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PersonCardProps {
  person: {
    id: string;
    firstName: string;
    lastName: string | null;
    relationshipType: string;
    circle: string;
    trustLevel: string;
    dateOfBirth: string | null;
    phoneNumber: string | null;
    email: string | null;
    notes: string | null;
    lastContactedAt: Date | null;
    createdAt: Date;
  };
  onEdit: () => void;
  onViewInteractions: () => void;
}

const relationshipTypeLabels: Record<string, string> = {
  friend: 'Friend',
  family: 'Family',
  partner: 'Partner',
  potential_partner: 'Potential Partner',
  business_partner: 'Business Partner',
  ex: 'Ex',
  mentor: 'Mentor',
  accountability: 'Accountability',
};

const circleColors: Record<string, string> = {
  inner: 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30',
  middle: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  outer: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  distant: 'bg-text-tertiary/20 text-text-tertiary border-text-tertiary/30',
};

const trustLevelIcons: Record<string, { icon: typeof Shield; color: string }> = {
  high: { icon: Shield, color: 'text-green-500' },
  medium: { icon: Shield, color: 'text-yellow-500' },
  low: { icon: Shield, color: 'text-orange-500' },
  none: { icon: Shield, color: 'text-red-500' },
};

export function PersonCard({ person, onEdit, onViewInteractions }: PersonCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fullName = `${person.firstName}${person.lastName ? ' ' + person.lastName : ''}`;
  const TrustIcon = trustLevelIcons[person.trustLevel].icon;

  const handleDelete = async () => {
    setIsDeleting(true);
    await deletePerson(person.id);
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  const handleMarkContacted = async () => {
    await updateLastContactedAt(person.id);
    setShowMenu(false);
  };

  return (
    <>
      <Card className="hover:border-accent-primary/50 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{fullName}</h3>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${circleColors[person.circle]}`}>
                  {person.circle.charAt(0).toUpperCase() + person.circle.slice(1)}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-text-tertiary/20 text-text-secondary border border-text-tertiary/30">
                  {relationshipTypeLabels[person.relationshipType]}
                </span>
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-bg-primary border border-border-primary ${trustLevelIcons[person.trustLevel].color}`}>
                  <TrustIcon size={12} />
                  {person.trustLevel.charAt(0).toUpperCase() + person.trustLevel.slice(1)}
                </span>
              </div>

              {person.lastContactedAt && (
                <p className="text-sm text-text-tertiary mt-3 flex items-center gap-1">
                  <MessageCircle size={14} />
                  Last contact: {formatDistanceToNow(new Date(person.lastContactedAt), { addSuffix: true })}
                </p>
              )}

              {(person.phoneNumber || person.email) && (
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-text-secondary">
                  {person.phoneNumber && (
                    <span className="flex items-center gap-1">
                      <Phone size={14} />
                      {person.phoneNumber}
                    </span>
                  )}
                  {person.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={14} />
                      {person.email}
                    </span>
                  )}
                </div>
              )}

              {person.dateOfBirth && (
                <p className="text-sm text-text-tertiary mt-2 flex items-center gap-1">
                  <Calendar size={14} />
                  Birthday: {new Date(person.dateOfBirth).toLocaleDateString()}
                </p>
              )}

              {person.notes && (
                <p className="text-sm text-text-secondary mt-3 line-clamp-2">
                  {person.notes}
                </p>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-bg-primary rounded-lg transition-colors"
              >
                <MoreVertical size={20} />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-bg-secondary border border-border-primary rounded-lg shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={onViewInteractions}
                      className="w-full px-4 py-2.5 text-left hover:bg-bg-primary transition-colors flex items-center gap-3"
                    >
                      <Users size={16} />
                      View Interactions
                    </button>
                    <button
                      onClick={handleMarkContacted}
                      className="w-full px-4 py-2.5 text-left hover:bg-bg-primary transition-colors flex items-center gap-3"
                    >
                      <MessageCircle size={16} />
                      Mark as Contacted
                    </button>
                    <button
                      onClick={() => {
                        onEdit();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-bg-primary transition-colors flex items-center gap-3"
                    >
                      <Edit size={16} />
                      Edit Person
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-bg-primary transition-colors flex items-center gap-3 text-red-500"
                    >
                      <Trash2 size={16} />
                      Delete Person
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-secondary rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Person</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete {fullName}? This will also delete all associated interactions. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
