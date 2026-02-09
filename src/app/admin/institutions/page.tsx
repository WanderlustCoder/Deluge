'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  School,
  Landmark,
  Heart,
  Briefcase,
  GraduationCap,
  ChevronRight,
  Calendar,
} from 'lucide-react';

interface Institution {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string;
  tier: string;
  status: string;
  contractStart: string;
  contractEnd: string | null;
  monthlyFee: number | null;
  createdAt: string;
  _count: {
    admins: number;
    pages: number;
  };
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  city: Landmark,
  university: GraduationCap,
  foundation: Heart,
  nonprofit: Heart,
  corporate: Briefcase,
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-teal/10 text-teal',
  pending: 'bg-gold/10 text-gold',
  suspended: 'bg-red-100 text-red-600',
  expired: 'bg-gray-100 text-storm/60',
};

export default function InstitutionsAdminPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchInstitutions();
  }, [statusFilter]);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/institutions?${params}`);
      const data = await res.json();
      setInstitutions(data.institutions || []);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstitutions = institutions.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Institutional Partnerships
          </h1>
          <p className="text-storm/60 mt-1">
            Manage white-label platforms for cities, universities, and foundations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90"
        >
          <Plus className="w-4 h-4" />
          New Institution
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-storm/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search institutions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          {['active', 'pending', 'suspended', 'expired'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? null : status)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-ocean text-white'
                  : 'bg-gray-100 text-storm/70 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', count: institutions.length, color: 'bg-ocean' },
          { label: 'Active', count: institutions.filter((i) => i.status === 'active').length, color: 'bg-teal' },
          { label: 'Pending', count: institutions.filter((i) => i.status === 'pending').length, color: 'bg-gold' },
          { label: 'MRR', value: `$${institutions.reduce((sum, i) => sum + (i.monthlyFee || 0), 0).toLocaleString()}`, color: 'bg-sky' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-10 h-10 ${stat.color}/10 rounded-lg flex items-center justify-center mb-2`}>
              <Building2 className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div className="text-2xl font-bold">{stat.count ?? stat.value}</div>
            <div className="text-sm text-storm/60">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Institutions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean" />
        </div>
      ) : filteredInstitutions.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <Building2 className="w-12 h-12 text-storm/30 mx-auto mb-4" />
          <h2 className="text-lg font-medium mb-2">No institutions found</h2>
          <p className="text-storm/60 mb-4">
            {searchQuery ? 'Try a different search term' : 'Create your first institutional partnership'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90"
          >
            <Plus className="w-4 h-4" />
            New Institution
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-storm/70">Institution</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-storm/70">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-storm/70">Tier</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-storm/70">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-storm/70">Contract</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-storm/70">MRR</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-storm/70"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInstitutions.map((institution) => {
                const TypeIcon = TYPE_ICONS[institution.type] || Building2;
                return (
                  <tr key={institution.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${institution.primaryColor}20` }}
                        >
                          {institution.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={institution.logoUrl} alt="" className="w-6 h-6" />
                          ) : (
                            <TypeIcon className="w-5 h-5" style={{ color: institution.primaryColor }} />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{institution.name}</div>
                          <div className="text-sm text-storm/50">{institution.slug}.deluge.fund</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize">{institution.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize">{institution.tier}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[institution.status]}`}>
                        {institution.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-storm/60">
                        <Calendar className="w-3 h-3" />
                        {new Date(institution.contractStart).toLocaleDateString()}
                        {institution.contractEnd && (
                          <> - {new Date(institution.contractEnd).toLocaleDateString()}</>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {institution.monthlyFee ? `$${institution.monthlyFee.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/institutions/${institution.id}`}
                        className="text-ocean hover:text-ocean/80"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateInstitutionModal
          onClose={() => setShowCreateModal(false)}
          onCreate={() => {
            setShowCreateModal(false);
            fetchInstitutions();
          }}
        />
      )}
    </div>
  );
}

function CreateInstitutionModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'city',
    adminEmail: '',
    description: '',
    tier: 'standard',
    contractStart: new Date().toISOString().split('T')[0],
    monthlyFee: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monthlyFee: formData.monthlyFee ? parseFloat(formData.monthlyFee) : null,
        }),
      });

      if (res.ok) {
        onCreate();
      }
    } catch (error) {
      console.error('Error creating institution:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">New Institutional Partnership</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Institution Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., City of Boise"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Slug *</label>
            <div className="flex items-center">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="boise"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-ocean focus:border-transparent"
                required
              />
              <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg text-storm/60">
                .deluge.fund
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent"
              >
                <option value="city">City/Government</option>
                <option value="university">University</option>
                <option value="foundation">Foundation</option>
                <option value="nonprofit">Nonprofit</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tier *</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent"
              >
                <option value="standard">Standard ($500/mo)</option>
                <option value="premium">Premium ($2K/mo)</option>
                <option value="enterprise">Enterprise ($5K+/mo)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Admin Email *</label>
            <input
              type="email"
              value={formData.adminEmail}
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              placeholder="admin@institution.gov"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contract Start *</label>
              <input
                type="date"
                value={formData.contractStart}
                onChange={(e) => setFormData({ ...formData, contractStart: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Monthly Fee</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-storm/40">$</span>
                <input
                  type="number"
                  value={formData.monthlyFee}
                  onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                  placeholder="500"
                  className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the partnership..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Institution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
