'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface ContactConfigModalProps {
  contact: Contact;
  onSave: (config: ContactConfig) => void;
  onCancel: () => void;
}

export interface ContactConfig {
  firstName: string;
  lastName?: string;
  relationshipType: 'friend' | 'family' | 'partner' | 'potential_partner' | 'business_partner' | 'ex' | 'mentor' | 'accountability';
  circle: 'inner' | 'middle' | 'outer' | 'distant';
  trustLevel: 'high' | 'medium' | 'low' | 'none';
  phoneNumber?: string;
  email?: string;
  notes?: string;
}

export function ContactConfigModal({ contact, onSave, onCancel }: ContactConfigModalProps) {
  // Parse name into first/last
  const nameParts = contact.name.split(' ');
  const defaultFirstName = nameParts[0] || '';
  const defaultLastName = nameParts.slice(1).join(' ') || '';

  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [relationshipType, setRelationshipType] = useState<ContactConfig['relationshipType']>('friend');
  const [circle, setCircle] = useState<ContactConfig['circle']>('outer');
  const [trustLevel, setTrustLevel] = useState<ContactConfig['trustLevel']>('medium');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave({
      firstName,
      lastName: lastName || undefined,
      relationshipType,
      circle,
      trustLevel,
      phoneNumber: contact.phone,
      email: contact.email,
      notes: notes || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Add to Relationships</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-surface-secondary rounded"
          >
            <X size={20} className="text-text-tertiary" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Contact Info (read-only display) */}
          {(contact.phone || contact.email) && (
            <div className="bg-surface-secondary rounded-lg p-3 space-y-1">
              {contact.phone && (
                <p className="text-sm text-text-secondary">📱 {contact.phone}</p>
              )}
              {contact.email && (
                <p className="text-sm text-text-secondary">✉️ {contact.email}</p>
              )}
            </div>
          )}

          {/* Relationship Type */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Relationship Type *
            </label>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as ContactConfig['relationshipType'])}
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="friend">Friend</option>
              <option value="family">Family</option>
              <option value="partner">Partner</option>
              <option value="potential_partner">Potential Partner</option>
              <option value="business_partner">Business Partner</option>
              <option value="ex">Ex</option>
              <option value="mentor">Mentor</option>
              <option value="accountability">Accountability Partner</option>
            </select>
          </div>

          {/* Circle */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Circle *
            </label>
            <select
              value={circle}
              onChange={(e) => setCircle(e.target.value as ContactConfig['circle'])}
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="inner">Inner Circle - Closest people</option>
              <option value="middle">Middle Circle - Regular contact</option>
              <option value="outer">Outer Circle - Occasional contact</option>
              <option value="distant">Distant - Rare contact</option>
            </select>
          </div>

          {/* Trust Level */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Trust Level *
            </label>
            <select
              value={trustLevel}
              onChange={(e) => setTrustLevel(e.target.value as ContactConfig['trustLevel'])}
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="high">High - Completely trustworthy</option>
              <option value="medium">Medium - Generally trustworthy</option>
              <option value="low">Low - Limited trust</option>
              <option value="none">None - No trust</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes about this person..."
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface border-t border-border p-4 flex gap-3">
          <Button variant="secondary" onClick={onCancel} fullWidth>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} fullWidth disabled={!firstName}>
            Add to Relationships
          </Button>
        </div>
      </div>
    </div>
  );
}
