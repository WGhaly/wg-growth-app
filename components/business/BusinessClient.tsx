'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Briefcase, TrendingUp, Play, Pause, DollarSign, X } from 'lucide-react';
import { CompanyCard } from './CompanyCard';
import { AddCompanyModal } from './AddCompanyModal';

type Status = 'all' | 'active' | 'paused' | 'sold' | 'closed';

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

interface BusinessClientProps {
  initialCompanies: Company[];
}

export function BusinessClient({ initialCompanies }: BusinessClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<Status>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const statusOptions: { value: Status; label: string; icon: typeof Briefcase }[] = [
    { value: 'all', label: 'All Companies', icon: Briefcase },
    { value: 'active', label: 'Active', icon: Play },
    { value: 'paused', label: 'Paused', icon: Pause },
    { value: 'sold', label: 'Sold', icon: TrendingUp },
    { value: 'closed', label: 'Closed', icon: X },
  ];

  const filteredCompanies = selectedStatus === 'all'
    ? initialCompanies
    : initialCompanies.filter(c => c.status === selectedStatus);

  const counts = {
    all: initialCompanies.length,
    active: initialCompanies.filter(c => c.status === 'active').length,
    paused: initialCompanies.filter(c => c.status === 'paused').length,
    sold: initialCompanies.filter(c => c.status === 'sold').length,
    closed: initialCompanies.filter(c => c.status === 'closed').length,
  };

  // Calculate total owned valuation (company valuation × equity percentage)
  const totalValuation = useMemo(() => {
    return initialCompanies.reduce((sum, company) => {
      if (company.valuation) {
        const valuation = parseFloat(company.valuation);
        const equity = company.equityPercentage ? parseFloat(company.equityPercentage) / 100 : 1;
        return sum + (valuation * equity);
      }
      return sum;
    }, 0);
  }, [initialCompanies]);

  // Calculate total profits
  const totalProfits = useMemo(() => {
    return initialCompanies
      .filter(c => c.status === 'active')
      .reduce((sum, company) => {
        if (company.profits) {
          return sum + parseFloat(company.profits);
        }
        return sum;
      }, 0);
  }, [initialCompanies]);

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Business</h1>
            <p className="text-text-secondary mt-1">Track companies and revenue</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={18} className="mr-2" />
            Add Company
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border-accent-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Total Valuation</CardTitle>
                <DollarSign size={20} className="text-accent-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                EGP {totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-text-tertiary mt-1">All companies</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Active Profits</CardTitle>
                <TrendingUp size={20} className="text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${totalProfits < 0 ? 'text-red-400' : ''}`}>
                EGP {totalProfits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                {counts.active} active {counts.active === 1 ? 'company' : 'companies'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Portfolio</CardTitle>
                <Briefcase size={20} className="text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{initialCompanies.length}</p>
              <p className="text-sm text-text-tertiary mt-1">
                Total {initialCompanies.length === 1 ? 'company' : 'companies'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSelectedStatus(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedStatus === value
                  ? 'bg-accent-primary text-bg-primary'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon size={16} />
              {label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  selectedStatus === value
                    ? 'bg-bg-primary/20 text-bg-primary'
                    : 'bg-bg-primary text-text-tertiary'
                }`}
              >
                {counts[value]}
              </span>
            </button>
          ))}
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-text-tertiary opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  {selectedStatus === 'all' ? 'No companies yet' : `No ${selectedStatus} companies`}
                </h3>
                <p className="text-text-secondary mb-6">
                  {selectedStatus === 'all'
                    ? 'Add your first company to start tracking your business ventures'
                    : `No companies with ${selectedStatus} status`}
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus size={18} className="mr-2" />
                  Add Company
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AddCompanyModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
