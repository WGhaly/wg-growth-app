'use client';

import { useState, useEffect } from 'react';
import { Save, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { updateFaithCommitment, getFaithCommitment } from '@/actions/identity';

export default function FaithCommitmentEditor() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadCommitment();
  }, []);

  const loadCommitment = async () => {
    setIsLoading(true);
    const result = await getFaithCommitment();
    if (result.success && result.faithCommitment) {
      setContent(result.faithCommitment);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setError('');
    setIsSaving(true);

    try {
      const result = await updateFaithCommitment(content.trim());
      if (result.success) {
        setLastSaved(new Date());
      } else {
        setError(result.error || 'Failed to save commitment');
      }
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
            <BookOpen size={24} />
            <div>
              <h2 className="text-xl font-bold">Faith Commitment</h2>
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
            <BookOpen size={24} />
            <div>
              <h2 className="text-xl font-bold">Faith Commitment</h2>
              <p className="text-sm text-text-secondary">
                Your personal commitment to faith and spiritual growth
              </p>
            </div>
          </div>
          {lastSaved && (
            <p className="text-xs text-text-tertiary">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your faith commitment here...&#10;&#10;Example:&#10;- I commit to daily prayer and scripture reading&#10;- I will serve others and share my faith boldly&#10;- I choose to trust God in all circumstances&#10;- I prioritize worship and fellowship with believers"
            rows={10}
            className="font-mono text-sm"
          />
          <p className="text-xs text-text-tertiary mt-2">
            {content.length} characters
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded p-3">
            {error}
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={isSaving || !content.trim()}
          className="w-full"
        >
          {isSaving ? (
            'Saving...'
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Save Commitment
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
