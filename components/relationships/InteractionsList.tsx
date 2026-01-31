'use client';

import { useState, useEffect } from 'react';
import { getInteractionsByPerson, createInteraction, deleteInteraction } from '@/actions/interactions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { CustomSelect, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/CustomSelect';
import { X, Plus, Smile, Frown, Meh, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface InteractionsListProps {
  personId: string;
  personName: string;
  isOpen: boolean;
  onClose: () => void;
}

const emotionalImpactOptions = [
  { value: 'very_positive', label: 'Very Positive' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
  { value: 'very_negative', label: 'Very Negative' },
];

const impactIcons: Record<string, { icon: typeof Smile; color: string }> = {
  very_positive: { icon: ThumbsUp, color: 'text-green-500' },
  positive: { icon: Smile, color: 'text-green-400' },
  neutral: { icon: Meh, color: 'text-text-tertiary' },
  negative: { icon: Frown, color: 'text-orange-500' },
  very_negative: { icon: ThumbsDown, color: 'text-red-500' },
};

export function InteractionsList({ personId, personName, isOpen, onClose }: InteractionsListProps) {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [interactionDate, setInteractionDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [emotionalImpact, setEmotionalImpact] = useState('neutral');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInteractions();
    }
  }, [isOpen, personId]);

  const loadInteractions = async () => {
    setIsLoading(true);
    const result = await getInteractionsByPerson(personId);
    if (result.success && result.data) {
      setInteractions(result.data);
    }
    setIsLoading(false);
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const result = await createInteraction({
      personId,
      interactionDate,
      summary,
      emotionalImpact: emotionalImpact as any,
    });

    if (result.success) {
      await loadInteractions();
      setSummary('');
      setInteractionDate(new Date().toISOString().split('T')[0]);
      setEmotionalImpact('neutral');
      setShowAddForm(false);
    } else {
      setError(result.error || 'Failed to add interaction');
    }
    setIsSaving(false);
  };

  const handleDeleteInteraction = async (id: string) => {
    if (!confirm('Delete this interaction?')) return;
    await deleteInteraction(id);
    await loadInteractions();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-bg-secondary border-b border-border-primary px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Interactions with {personName}</h2>
            <p className="text-sm text-text-tertiary mt-1">
              {interactions.length} {interactions.length === 1 ? 'interaction' : 'interactions'} recorded
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-6"
            >
              <Plus size={18} className="mr-2" />
              Add Interaction
            </Button>
          )}

          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>New Interaction</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddInteraction} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={interactionDate}
                        onChange={(e) => setInteractionDate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Emotional Impact <span className="text-red-500">*</span>
                      </label>
                      <CustomSelect value={emotionalImpact} onValueChange={setEmotionalImpact}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select impact" />
                        </SelectTrigger>
                        <SelectContent>
                          {emotionalImpactOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </CustomSelect>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Summary <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="What happened during this interaction? Include key topics, outcomes, or memorable moments..."
                      rows={4}
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowAddForm(false);
                        setSummary('');
                        setError(null);
                      }}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? 'Adding...' : 'Add Interaction'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-text-tertiary">
              Loading interactions...
            </div>
          ) : interactions.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              <p>No interactions recorded yet</p>
              <p className="text-sm mt-2">Add your first interaction to start tracking your relationship</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interactions.map((interaction) => {
                const ImpactIcon = impactIcons[interaction.emotionalImpact].icon;
                const impactColor = impactIcons[interaction.emotionalImpact].color;
                
                return (
                  <Card key={interaction.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`flex items-center gap-1.5 text-sm ${impactColor}`}>
                              <ImpactIcon size={16} />
                              {emotionalImpactOptions.find(o => o.value === interaction.emotionalImpact)?.label}
                            </span>
                            <span className="text-sm text-text-tertiary">
                              {format(new Date(interaction.interactionDate), 'MMM d, yyyy')}
                            </span>
                            <span className="text-xs text-text-tertiary">
                              ({formatDistanceToNow(new Date(interaction.interactionDate), { addSuffix: true })})
                            </span>
                          </div>
                          <p className="text-text-secondary">{interaction.summary}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteInteraction(interaction.id)}
                          className="text-text-tertiary hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
