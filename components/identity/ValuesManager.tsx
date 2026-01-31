'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Heart, Save } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { saveValue, deleteValue, getValues } from '@/actions/identity';

interface Value {
  id?: string;
  value: string;
  description: string | null;
  rank: number;
}

export default function ValuesManager() {
  const [values, setValues] = useState<Value[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadValues();
  }, []);

  const loadValues = async () => {
    setIsLoading(true);
    const result = await getValues();
    if (result.success && result.values) {
      setValues(result.values.map(v => ({
        id: v.id,
        value: v.value,
        description: v.description,
        rank: v.rank,
      })));
    }
    setIsLoading(false);
  };

  const addValue = () => {
    if (values.length >= 5) {
      setError('You can only have up to 5 core values');
      return;
    }
    setValues([...values, {
      value: '',
      description: null,
      rank: values.length + 1,
    }]);
  };

  const removeValue = async (index: number) => {
    const value = values[index];
    
    // If it has an ID, delete from database
    if (value.id) {
      const result = await deleteValue(value.id);
      if (!result.success) {
        setError(result.error || 'Failed to delete value');
        return;
      }
    }

    // Remove from local state and reindex
    const newValues = values.filter((_, i) => i !== index);
    const reindexed = newValues.map((v, i) => ({ ...v, rank: i + 1 }));
    setValues(reindexed);
  };

  const updateValue = (index: number, field: 'value' | 'description', val: string) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], [field]: val };
    setValues(newValues);
  };

  const handleSaveAll = async () => {
    setError('');
    
    // Validate
    const filledValues = values.filter(v => v.value.trim());
    if (filledValues.length === 0) {
      setError('Please add at least one value');
      return;
    }

    if (filledValues.length < 3) {
      setError('Please define at least 3 core values');
      return;
    }

    setIsSaving(true);

    try {
      // Save each value
      for (const value of filledValues) {
        const result = await saveValue({
          id: value.id,
          value: value.value.trim(),
          description: value.description?.trim() || undefined,
          rank: value.rank,
        });

        if (!result.success) {
          setError(result.error || 'Failed to save values');
          setIsSaving(false);
          return;
        }
      }

      // Reload to get updated IDs
      await loadValues();
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart size={24} />
            <div>
              <h2 className="text-xl font-bold">Core Values</h2>
              <p className="text-sm text-text-secondary">Loading...</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={24} />
            <div>
              <h2 className="text-xl font-bold">Core Values</h2>
              <p className="text-sm text-text-secondary">
                Define 3-5 core values that guide your decisions and actions
              </p>
            </div>
          </div>
          <Button
            onClick={addValue}
            disabled={values.length >= 5}
            variant="secondary"
            size="sm"
          >
            <Plus size={16} className="mr-1" />
            Add Value
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Values List */}
        {values.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-4">No core values defined yet</p>
            <Button onClick={addValue} variant="secondary">
              <Plus size={18} className="mr-2" />
              Add Your First Value
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {values.map((value, index) => (
              <div
                key={index}
                className="border border-border-default rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-2">
                    <GripVertical size={18} className="text-text-tertiary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                        {index + 1}
                      </div>
                      <Input
                        value={value.value}
                        onChange={(e) => updateValue(index, 'value', e.target.value)}
                        placeholder="Value name (e.g., Integrity, Growth, Family)"
                        className="flex-1"
                      />
                    </div>
                    <Textarea
                      value={value.description || ''}
                      onChange={(e) => updateValue(index, 'description', e.target.value)}
                      placeholder="Describe what this value means to you and how you live it..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeValue(index)}
                    className="mt-2 p-2 hover:bg-bg-tertiary rounded text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded p-3">
            {error}
          </div>
        )}

        {values.length > 0 && (
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              'Saving...'
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save All Values
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
