'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/toast';

interface Pledge {
  id: string;
  amount: number;
  tipAmount: number;
  status: string;
  message: string | null;
  createdAt: string;
  campaign: {
    id: string;
    slug: string;
    title: string;
    status: string;
    endDate: string;
    project: { id: string; title: string; category: string };
    creator: { id: string; name: string };
  };
  reward: {
    id: string;
    title: string;
    amount: number;
  } | null;
  fulfillment: {
    id: string;
    status: string;
  } | null;
}

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'collected', label: 'Collected' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function PledgesPage() {
  const toast = useToast();
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPledges();
  }, [statusFilter]);

  const fetchPledges = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/pledges?${params.toString()}`);
      const data = await res.json();
      setPledges(data.pledges || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching pledges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPledge = async (pledgeId: string) => {
    if (!confirm('Are you sure you want to cancel this pledge?')) {
      return;
    }

    setCancellingId(pledgeId);
    try {
      const res = await fetch(`/api/pledges/${pledgeId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.toast('Pledge cancelled successfully', 'success');
        fetchPledges();
      } else {
        const data = await res.json();
        toast.toast(data.error || 'Failed to cancel pledge', 'error');
      }
    } catch (error) {
      toast.toast('Failed to cancel pledge', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'collected':
        return 'bg-teal/10 text-teal';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'refunded':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        My Pledges
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Track your campaign pledges and reward fulfillment
      </p>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              statusFilter === tab.value
                ? 'bg-ocean text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pledges List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : pledges.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="material-icons text-4xl text-gray-400">volunteer_activism</span>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No pledges yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Find campaigns to support and make your first pledge!
          </p>
          <Link
            href="/campaigns"
            className="mt-4 inline-block px-4 py-2 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90"
          >
            Browse Campaigns
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pledges.map((pledge) => {
            const campaignEnded = new Date(pledge.campaign.endDate) < new Date();

            return (
              <div
                key={pledge.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/campaigns/${pledge.campaign.slug}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-ocean"
                    >
                      {pledge.campaign.title}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      by {pledge.campaign.creator.name}
                    </p>
                  </div>

                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(pledge.status)}`}>
                    {pledge.status.charAt(0).toUpperCase() + pledge.status.slice(1)}
                  </span>
                </div>

                {/* Pledge Details */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${pledge.amount.toLocaleString()}
                      {pledge.tipAmount > 0 && (
                        <span className="text-gray-500 text-xs"> + ${pledge.tipAmount} tip</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Reward</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pledge.reward ? pledge.reward.title : 'No reward'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Pledged</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(pledge.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Campaign Status</p>
                    <p className={`font-medium ${
                      pledge.campaign.status === 'successful' ? 'text-teal' :
                      pledge.campaign.status === 'failed' ? 'text-red-500' :
                      'text-gray-900 dark:text-white'
                    }`}>
                      {pledge.campaign.status.charAt(0).toUpperCase() + pledge.campaign.status.slice(1)}
                    </p>
                  </div>
                </div>

                {/* Fulfillment Status */}
                {pledge.fulfillment && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Reward fulfillment: </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {pledge.fulfillment.status.charAt(0).toUpperCase() + pledge.fulfillment.status.slice(1)}
                      </span>
                    </p>
                  </div>
                )}

                {/* Actions */}
                {pledge.status === 'active' && !campaignEnded && (
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/pledges/${pledge.id}/edit`}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Edit Pledge
                    </Link>
                    <button
                      onClick={() => handleCancelPledge(pledge.id)}
                      disabled={cancellingId === pledge.id}
                      className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      {cancellingId === pledge.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {!loading && total > 0 && (
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {pledges.length} of {total} pledges
        </p>
      )}
    </div>
  );
}
