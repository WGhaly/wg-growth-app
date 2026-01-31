'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MoreVertical, Trash2, Calendar, Building2 } from 'lucide-react';
import { deleteCompany } from '@/actions/business';
import { format } from 'date-fns';

interface Company {
  id: string;
  name: string;
  status: string;
  industry: string | null;
  foundedDate: string | null;
  closedDate: string | null;
  equityPercentage: string | null;
  valuation: string | null;
  profits: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CompanyCardProps {
  company: Company;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  sold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  closed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  sold: 'Sold',
  closed: 'Closed',
};

export function CompanyCard({ company }: CompanyCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteCompany(company.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const profits = company.profits ? parseFloat(company.profits) : 0;
  const valuation = company.valuation ? parseFloat(company.valuation) : 0;
  const equity = company.equityPercentage ? parseFloat(company.equityPercentage) : 0;
  const statusColor = statusColors[company.status] || 'bg-bg-secondary0/20 text-text-tertiary border-gray-500/30';

  return (
    <>
      <Card className="hover:border-accent-primary/50 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{company.name}</CardTitle>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColor}`}>
                {statusLabels[company.status]}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-bg-primary rounded"
              >
                <MoreVertical size={18} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-bg-secondary border border-border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-bg-primary text-red-500 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {company.industry && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 size={16} className="text-text-tertiary" />
                <span className="text-text-secondary">{company.industry}</span>
              </div>
            )}

            {company.foundedDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-text-tertiary" />
                <span className="text-text-secondary">
                  Founded {format(new Date(company.foundedDate), 'MMM yyyy')}
                </span>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-border-default">
              {equity > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-tertiary">Equity</span>
                  <span className="font-medium">{equity.toFixed(2)}%</span>
                </div>
              )}
              
              {valuation > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-tertiary">Valuation</span>
                  <span className="font-medium">EGP {valuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary">Profits</span>
                <span className={`font-medium ${profits < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  EGP {profits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {company.notes && (
              <p className="text-sm text-text-secondary mt-3 line-clamp-2">
                {company.notes}
              </p>
            )}
          </div>
        </CardHeader>
      </Card>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-secondary rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Delete {company.name}?</h3>
            <p className="text-text-secondary mb-6">
              This will permanently delete this company and all associated revenue logs. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600"
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
