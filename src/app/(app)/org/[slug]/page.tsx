'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
  legalName: string | null;
  mission: string;
  description: string | null;
  website: string | null;
  email: string;
  logoUrl: string | null;
  verificationStatus: string;
  focusAreas: string[];
  members: Array<{
    id: string;
    role: string;
    user: { id: string; name: string; email: string };
  }>;
}

interface Stats {
  totalDonations: number;
  donationCount: number;
  donorCount: number;
  memberCount: number;
}

interface RecentDonation {
  id: string;
  amount: number;
  donorName: string | null;
  isAnonymous: boolean;
  createdAt: string;
  acknowledgedAt: string | null;
}

export default function OrgDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [slug]);

  async function fetchData() {
    try {
      const res = await fetch(`/api/organizations/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast('Organization not found', 'error');
          return;
        }
        throw new Error('Failed to fetch organization');
      }

      const data = await res.json();
      setOrganization(data.organization);
      setStats(data.stats);

      // Find user's role
      const membership = data.organization.members.find(
        (m: { user: { id: string } }) => m.user.id === session?.user?.id
      );
      setUserRole(membership?.role || null);

      // Fetch recent donations if user has access
      if (membership || session?.user?.accountType === 'admin') {
        const donationsRes = await fetch(
          `/api/organizations/${slug}/donations?limit=5`
        );
        if (donationsRes.ok) {
          const donationsData = await donationsRes.json();
          setRecentDonations(donationsData.donations || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast('Failed to load organization data', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Organization not found
        </h1>
      </div>
    );
  }

  const canManage = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          {organization.logoUrl ? (
            <img
              src={organization.logoUrl}
              alt={organization.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-teal to-ocean rounded-lg flex items-center justify-center text-white text-2xl font-bold">
              {organization.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {organization.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                organization.verificationStatus === 'verified'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : organization.verificationStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {organization.verificationStatus}
              </span>
              {userRole && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Your role: {userRole}
                </span>
              )}
            </div>
          </div>
        </div>
        {canManage && (
          <Link
            href={`/org/${slug}/settings`}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Settings
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-teal to-ocean p-6 rounded-xl text-white"
        >
          <p className="text-sm opacity-80">Total Donations</p>
          <p className="text-3xl font-bold">${stats?.totalDonations.toFixed(2) || '0.00'}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Donation Count</p>
          <p className="text-3xl font-bold text-storm dark:text-white">{stats?.donationCount || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Donors</p>
          <p className="text-3xl font-bold text-storm dark:text-white">{stats?.donorCount || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Team Members</p>
          <p className="text-3xl font-bold text-storm dark:text-white">{stats?.memberCount || 0}</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Link
          href={`/org/${slug}/donations`}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-teal dark:hover:border-teal transition-colors"
        >
          <h3 className="font-medium text-gray-900 dark:text-white">Donations</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">View and manage donations</p>
        </Link>
        <Link
          href={`/org/${slug}/donors`}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-teal dark:hover:border-teal transition-colors"
        >
          <h3 className="font-medium text-gray-900 dark:text-white">Donors</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage donor relationships</p>
        </Link>
        <Link
          href={`/org/${slug}/projects`}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-teal dark:hover:border-teal transition-colors"
        >
          <h3 className="font-medium text-gray-900 dark:text-white">Projects</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage projects</p>
        </Link>
        <Link
          href={`/org/${slug}/team`}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-teal dark:hover:border-teal transition-colors"
        >
          <h3 className="font-medium text-gray-900 dark:text-white">Team</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage team members</p>
        </Link>
      </div>

      {/* Recent Donations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Donations</h2>
          <Link
            href={`/org/${slug}/donations`}
            className="text-sm text-teal hover:underline"
          >
            View All
          </Link>
        </div>
        {recentDonations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No donations yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentDonations.map((donation) => (
              <div key={donation.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {donation.isAnonymous ? 'Anonymous' : donation.donorName || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(donation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-teal">${donation.amount.toFixed(2)}</p>
                  {!donation.acknowledgedAt && !donation.isAnonymous && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      Pending thank you
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
