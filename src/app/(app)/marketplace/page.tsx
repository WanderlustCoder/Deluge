'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ListingGrid } from '@/components/marketplace/listing-grid';
import { ListingFilters } from '@/components/marketplace/listing-filters';

interface Listing {
  id: string;
  title: string;
  type: string;
  category: string;
  price: number | null;
  images: string[];
  status: string;
  createdAt: string;
  seller: { id: string; name: string };
  community: { id: string; name: string };
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<{
    type?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }>({});

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set('type', filters.type);
      if (filters.category) params.set('category', filters.category);
      if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`/api/marketplace/listings?${params.toString()}`);
      const data = await res.json();
      setListings(data.listings || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Community Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Buy, sell, and share with your community
          </p>
        </div>
        <Link
          href="/marketplace/create"
          className="px-4 py-2 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90"
        >
          Create Listing
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Listings</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Products</p>
          <p className="text-2xl font-bold text-sky-600">
            {listings.filter((l) => l.type === 'product').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Services</p>
          <p className="text-2xl font-bold text-purple-600">
            {listings.filter((l) => l.type === 'service').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Free Items</p>
          <p className="text-2xl font-bold text-green-600">
            {listings.filter((l) => l.type === 'free').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ListingFilters onFilterChange={handleFilterChange} />
      </div>

      {/* Listings Grid */}
      <ListingGrid listings={listings} loading={loading} />

      {/* My Listings Link */}
      <div className="mt-8 text-center">
        <Link
          href="/marketplace/my-listings"
          className="text-ocean hover:underline"
        >
          View My Listings
        </Link>
      </div>
    </div>
  );
}
