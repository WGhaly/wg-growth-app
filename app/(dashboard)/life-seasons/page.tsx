'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LifeSeasonModal } from '@/components/life-seasons/LifeSeasonModal';
import { getLifeSeasons, deleteLifeSeason, setCurrentLifeSeason } from '@/actions/life-seasons';
import { Plus, Star, Trash2, Edit, Calendar } from 'lucide-react';
import { PageContainer } from '@/components/ui/Navigation';

interface LifeSeason {
  id: string;
  seasonName: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  keyLearnings?: string | null;
  definingMoments?: string | null;
  annualTheme?: string | null;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function LifeSeasonsPage() {
  const [seasons, setSeasons] = useState<LifeSeason[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<LifeSeason | null>(null);

  const loadSeasons = async () => {
    setLoading(true);
    const result = await getLifeSeasons();
    if (result.success && result.data) {
      setSeasons(result.data as LifeSeason[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this season?')) return;

    const result = await deleteLifeSeason(id);
    if (result.success) {
      alert('Season deleted');
      loadSeasons();
    } else {
      alert(result.error || 'Failed to delete season');
    }
  };

  const handleSetCurrent = async (id: string) => {
    const result = await setCurrentLifeSeason(id);
    if (result.success) {
      alert('Current season updated');
      loadSeasons();
    } else {
      alert(result.error || 'Failed to update current season');
    }
  };

  const handleEdit = (season: LifeSeason) => {
    setSelectedSeason(season);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedSeason(null);
    setModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <PageContainer>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Life Seasons</h1>
          <p className="text-muted-foreground">
            Document the chapters of your journey - each season with its lessons and moments
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Season
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading seasons...</p>
        </div>
      ) : seasons.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No life seasons yet</h3>
          <p className="text-muted-foreground mb-4">
            Start documenting the chapters of your life journey
          </p>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Season
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {seasons.map((season) => (
            <Card key={season.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{season.seasonName}</h3>
                    {season.isCurrent && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        <Star className="h-3 w-3 fill-current" />
                        Current Season
                      </span>
                    )}
                    {season.annualTheme && (
                      <span className="text-sm text-muted-foreground italic">
                        {season.annualTheme}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>Started: {formatDate(season.startDate)}</span>
                    {season.endDate && <span>Ended: {formatDate(season.endDate)}</span>}
                  </div>

                  {season.description && (
                    <p className="text-sm mb-4">{season.description}</p>
                  )}

                  {season.keyLearnings && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-1">Key Learnings</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {season.keyLearnings}
                      </p>
                    </div>
                  )}

                  {season.definingMoments && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Defining Moments</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {season.definingMoments}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {!season.isCurrent && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSetCurrent(season.id)}
                      title="Set as current"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(season)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(season.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <LifeSeasonModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        season={selectedSeason}
        onSuccess={loadSeasons}
      />
    </div>
    </PageContainer>
  );
}
