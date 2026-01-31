'use client';

import { useState } from 'react';
import { createPerson, updatePerson } from '@/actions/people';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { CustomSelect, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/CustomSelect';
import { X } from 'lucide-react';

interface CreatePersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  editPerson?: {
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
  };
}

const relationshipTypeOptions = [
  { value: 'friend', label: 'Friend' },
  { value: 'family', label: 'Family' },
  { value: 'partner', label: 'Partner' },
  { value: 'potential_partner', label: 'Potential Partner' },
  { value: 'business_partner', label: 'Business Partner' },
  { value: 'ex', label: 'Ex' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'accountability', label: 'Accountability Partner' },
];

const circleOptions = [
  { value: 'inner', label: 'Inner Circle' },
  { value: 'middle', label: 'Middle Circle' },
  { value: 'outer', label: 'Outer Circle' },
  { value: 'distant', label: 'Distant' },
];

const trustLevelOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'none', label: 'None' },
];

export function CreatePersonModal({ isOpen, onClose, editPerson }: CreatePersonModalProps) {
  const [firstName, setFirstName] = useState(editPerson?.firstName || '');
  const [lastName, setLastName] = useState(editPerson?.lastName || '');
  const [relationshipType, setRelationshipType] = useState(editPerson?.relationshipType || 'friend');
  const [circle, setCircle] = useState(editPerson?.circle || 'outer');
  const [trustLevel, setTrustLevel] = useState(editPerson?.trustLevel || 'medium');
  const [dateOfBirth, setDateOfBirth] = useState(editPerson?.dateOfBirth || '');
  const [phoneNumber, setPhoneNumber] = useState(editPerson?.phoneNumber || '');
  const [email, setEmail] = useState(editPerson?.email || '');
  const [notes, setNotes] = useState(editPerson?.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const data = {
      firstName,
      lastName: lastName || undefined,
      relationshipType: relationshipType as any,
      circle: circle as any,
      trustLevel: trustLevel as any,
      dateOfBirth: dateOfBirth || undefined,
      phoneNumber: phoneNumber || undefined,
      email: email || undefined,
      notes: notes || undefined,
    };

    const result = editPerson 
      ? await updatePerson(editPerson.id, data)
      : await createPerson(data);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error || 'An error occurred');
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    setRelationshipType('friend');
    setCircle('outer');
    setTrustLevel('medium');
    setDateOfBirth('');
    setPhoneNumber('');
    setEmail('');
    setNotes('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-bg-secondary border-b border-border-primary px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {editPerson ? 'Edit Person' : 'Add New Person'}
          </h2>
          <button
            onClick={handleClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Relationship Type <span className="text-red-500">*</span>
              </label>
              <CustomSelect value={relationshipType} onValueChange={setRelationshipType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {relationshipTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </CustomSelect>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Circle <span className="text-red-500">*</span>
              </label>
              <CustomSelect value={circle} onValueChange={setCircle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select circle" />
                </SelectTrigger>
                <SelectContent>
                  {circleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </CustomSelect>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Trust Level <span className="text-red-500">*</span>
              </label>
              <CustomSelect value={trustLevel} onValueChange={setTrustLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trust" />
                </SelectTrigger>
                <SelectContent>
                  {trustLevelOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </CustomSelect>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth</label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional information, context, or reminders about this person..."
              rows={4}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : editPerson ? 'Update Person' : 'Add Person'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
