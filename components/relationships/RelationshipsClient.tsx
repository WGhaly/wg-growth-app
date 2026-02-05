'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MobileFilterSelect } from '@/components/ui/MobileFilterSelect';
import { Plus, Users, Heart, Building2, UserCheck } from 'lucide-react';
import { PersonCard } from './PersonCard';
import { CreatePersonModal } from './CreatePersonModal';
import { InteractionsList } from './InteractionsList';
import { ContactsImportButton } from './ContactsImportButton';

type Circle = 'all' | 'inner' | 'middle' | 'outer' | 'distant';

interface RelationshipsClientProps {
  initialPeople: Array<{
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
  }>;
}

export function RelationshipsClient({ initialPeople }: RelationshipsClientProps) {
  const [selectedCircle, setSelectedCircle] = useState<Circle>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [interactionsPerson, setInteractionsPerson] = useState<{ id: string; name: string } | null>(null);

  const circleOptions: { value: Circle; label: string; icon: typeof Users }[] = [
    { value: 'all', label: 'All People', icon: Users },
    { value: 'inner', label: 'Inner Circle', icon: Heart },
    { value: 'middle', label: 'Middle Circle', icon: UserCheck },
    { value: 'outer', label: 'Outer Circle', icon: Users },
    { value: 'distant', label: 'Distant', icon: Building2 },
  ];

  const filteredPeople = selectedCircle === 'all'
    ? initialPeople
    : initialPeople.filter(p => p.circle === selectedCircle);

  const counts = {
    all: initialPeople.length,
    inner: initialPeople.filter(p => p.circle === 'inner').length,
    middle: initialPeople.filter(p => p.circle === 'middle').length,
    outer: initialPeople.filter(p => p.circle === 'outer').length,
    distant: initialPeople.filter(p => p.circle === 'distant').length,
  };

  const handleEdit = (person: any) => {
    setEditingPerson(person);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingPerson(null);
  };

  const handleViewInteractions = (person: any) => {
    const fullName = `${person.firstName}${person.lastName ? ' ' + person.lastName : ''}`;
    setInteractionsPerson({ id: person.id, name: fullName });
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Relationships</h1>
              <p className="text-text-secondary mt-1">Track meaningful connections and interactions</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={18} className="mr-2" />
              Add Person
            </Button>
          </div>
          
          {/* Contacts Import */}
          <div className="max-w-sm">
            <ContactsImportButton />
          </div>
        </div>

        {/* Circle Filter */}
        <div className="mb-6">
          <MobileFilterSelect
            label="Relationship Circle"
            options={circleOptions.map(opt => ({
              id: opt.value,
              label: opt.label,
              count: counts[opt.value],
              icon: <opt.icon size={16} />,
            }))}
            value={selectedCircle}
            onChange={(value) => setSelectedCircle(value as Circle)}
          />
        </div>

        {/* Stats Cards */}
        {selectedCircle === 'all' && initialPeople.length > 0 && (
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart size={16} className="text-accent-secondary" />
                  Inner Circle
                </CardTitle>
                <p className="text-3xl font-bold mt-2">{counts.inner}</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck size={16} className="text-blue-400" />
                  Middle Circle
                </CardTitle>
                <p className="text-3xl font-bold mt-2">{counts.middle}</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users size={16} className="text-purple-400" />
                  Outer Circle
                </CardTitle>
                <p className="text-3xl font-bold mt-2">{counts.outer}</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 size={16} className="text-text-tertiary" />
                  Distant
                </CardTitle>
                <p className="text-3xl font-bold mt-2">{counts.distant}</p>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* People Grid */}
        {filteredPeople.length === 0 ? (
          <Card>
            <div className="text-center py-16 text-text-tertiary">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {selectedCircle === 'all' ? 'No people added yet' : `No people in ${selectedCircle} circle`}
              </h3>
              <p className="text-sm mb-6">
                {selectedCircle === 'all'
                  ? 'Start tracking your relationships by adding people'
                  : `Add people to your ${selectedCircle} circle to see them here`}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus size={18} className="mr-2" />
                Add Your First Person
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPeople.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onEdit={() => handleEdit(person)}
                onViewInteractions={() => handleViewInteractions(person)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePersonModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        editPerson={editingPerson}
      />

      {interactionsPerson && (
        <InteractionsList
          personId={interactionsPerson.id}
          personName={interactionsPerson.name}
          isOpen={!!interactionsPerson}
          onClose={() => setInteractionsPerson(null)}
        />
      )}
    </div>
  );
}
