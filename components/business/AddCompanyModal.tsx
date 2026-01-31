'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { CustomSelect, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/CustomSelect';
import { X } from 'lucide-react';
import { createCompany } from '@/actions/business';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCompanyModal({ isOpen, onClose }: AddCompanyModalProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<string>('active');
  const [industry, setIndustry] = useState('');
  const [foundedDate, setFoundedDate] = useState('');
  const [equityPercentage, setEquityPercentage] = useState('');
  const [valuation, setValuation] = useState('');
  const [profits, setProfits] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await createCompany({
        name,
        status: status as any,
        industry: industry || undefined,
        foundedDate: foundedDate || undefined,
        equityPercentage: equityPercentage || undefined,
        valuation: valuation || undefined,
        profits: profits || undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        setName('');
        setStatus('active');
        setIndustry('');
        setFoundedDate('');
        setEquityPercentage('');
        setValuation('');
        setProfits('');
        setNotes('');
        onClose();
      } else {
        setError(result.error || 'Failed to add company');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Add Company</h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Acme Corp, My Startup"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <CustomSelect
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </CustomSelect>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., SaaS, E-commerce"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Founded Date</label>
              <Input
                type="date"
                value={foundedDate}
                onChange={(e) => setFoundedDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Equity Percentage
                <span className="text-text-tertiary text-xs ml-1">(0-100%)</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={equityPercentage}
                onChange={(e) => setEquityPercentage(e.target.value)}
                placeholder="e.g., 25.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Valuation</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={valuation}
                onChange={(e) => setValuation(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Profits (Net Income)
                <span className="text-text-tertiary text-xs ml-1">(can be negative)</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={profits}
                onChange={(e) => setProfits(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this company..."
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name}>
              {isSubmitting ? 'Adding...' : 'Add Company'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
