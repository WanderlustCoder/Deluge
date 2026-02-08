'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/toast';

interface Listing {
  id: string;
  title: string;
  type: string;
  price: number | null;
  status: string;
  viewCount: number;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  sold: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  expired: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  removed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function MyListingsPage() {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/marketplace/listings?my=true');
      const data = await res.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSold = async (listingId: string) => {
    try {
      const res = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_sold' }),
      });

      if (res.ok) {
        toast('Listing marked as sold', 'success');
        fetchListings();
      }
    } catch (error) {
      console.error('Error marking listing as sold:', error);
    }
  };

  const handleRemove = async (listingId: string) => {
    if (!confirm('Are you sure you want to remove this listing?')) return;

    try {
      const res = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast('Listing removed', 'success');
        fetchListings();
      }
    } catch (error) {
      console.error('Error removing listing:', error);
    }
  };

  const filteredListings = filter === 'all'
    ? listings
    : listings.filter((l) => l.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Listings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your marketplace listings
          </p>
        </div>
        <Link
          href="/marketplace/create"
          className="px-4 py-2 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90"
        >
          Create Listing
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'active', 'sold', 'draft', 'expired'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${
              filter === status
                ? 'bg-ocean text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {status === 'all' ? 'All' : status}
            {status !== 'all' && (
              <span className="ml-1 opacity-75">
                ({listings.filter((l) => l.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Listings Table */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No listings found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filter === 'all'
              ? 'Create your first listing to get started.'
              : `You don't have any ${filter} listings.`}
          </p>
          {filter === 'all' && (
            <Link
              href="/marketplace/create"
              className="mt-4 inline-block px-4 py-2 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90"
            >
              Create Listing
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Listing
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Views
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-4">
                    <Link
                      href={`/marketplace/${listing.id}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-ocean"
                    >
                      {listing.title}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {listing.type} &middot;{' '}
                      {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        STATUS_COLORS[listing.status] || STATUS_COLORS.active
                      }`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-900 dark:text-white">
                    {listing.type === 'free' ? (
                      <span className="text-green-600">FREE</span>
                    ) : listing.price !== null ? (
                      `$${listing.price.toFixed(2)}`
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                    {listing.viewCount}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {listing.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleMarkSold(listing.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Mark Sold
                          </button>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                        </>
                      )}
                      <Link
                        href={`/marketplace/${listing.id}/edit`}
                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      >
                        Edit
                      </Link>
                      {listing.status !== 'removed' && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <button
                            onClick={() => handleRemove(listing.id)}
                            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 flex gap-4 justify-center">
        <Link href="/marketplace" className="text-ocean hover:underline">
          Browse Marketplace
        </Link>
        <Link href="/marketplace/offers" className="text-ocean hover:underline">
          View Offers
        </Link>
        <Link href="/marketplace/inquiries" className="text-ocean hover:underline">
          View Inquiries
        </Link>
      </div>
    </div>
  );
}
