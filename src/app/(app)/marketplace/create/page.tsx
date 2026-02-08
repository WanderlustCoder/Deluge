'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

interface Community {
  id: string;
  name: string;
}

const LISTING_TYPES = [
  { value: 'product', label: 'Product', description: 'Physical item for sale' },
  { value: 'service', label: 'Service', description: 'Work you can do for others' },
  { value: 'skill', label: 'Skill', description: 'Knowledge or expertise to share' },
  { value: 'rental', label: 'Rental', description: 'Item available for temporary use' },
  { value: 'free', label: 'Free', description: 'Giving away at no cost' },
];

const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Books',
  'Sports',
  'Home & Garden',
  'Vehicles',
  'Services',
  'Education',
  'Creative',
  'Other',
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'For Parts'];

export default function CreateListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    communityId: '',
    title: '',
    description: '',
    type: 'product',
    category: '',
    subcategory: '',
    price: '',
    pricingType: 'fixed',
    condition: '',
    location: '',
    isDeliverable: false,
    deliveryRadius: '',
    quantity: '1',
    tags: '',
    donatePercent: '0',
  });

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const res = await fetch('/api/communities?my=true');
      const data = await res.json();
      setCommunities(data.communities || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityId: formData.communityId,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          category: formData.category,
          subcategory: formData.subcategory || undefined,
          price: formData.type === 'free' ? null : parseFloat(formData.price) || null,
          pricingType: formData.pricingType,
          condition: formData.condition || undefined,
          location: formData.location || undefined,
          isDeliverable: formData.isDeliverable,
          deliveryRadius: formData.deliveryRadius
            ? parseFloat(formData.deliveryRadius)
            : undefined,
          quantity: parseInt(formData.quantity, 10) || 1,
          tags: formData.tags
            ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : undefined,
          donatePercent: parseInt(formData.donatePercent, 10) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create listing');
      }

      toast('Listing created! Your listing is now live.', 'success');

      router.push(`/marketplace/${data.listing.id}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to create listing', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <nav className="mb-6 text-sm">
        <Link href="/marketplace" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          Marketplace
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white">Create Listing</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Create a Listing
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Community Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Community *
          </label>
          <select
            name="communityId"
            value={formData.communityId}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
          >
            <option value="">Select a community</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {communities.length === 0 && (
            <p className="mt-1 text-sm text-gray-500">
              You need to{' '}
              <Link href="/communities" className="text-ocean hover:underline">
                join a community
              </Link>{' '}
              first.
            </p>
          )}
        </div>

        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Listing Type *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {LISTING_TYPES.map((t) => (
              <label
                key={t.value}
                className={`flex flex-col p-3 rounded-lg border cursor-pointer ${
                  formData.type === t.value
                    ? 'border-ocean bg-ocean/5 dark:bg-ocean/10'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t.value}
                  checked={formData.type === t.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {t.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t.description}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="What are you listing?"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Describe your item or service in detail..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
          />
        </div>

        {/* Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subcategory
            </label>
            <input
              type="text"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
            />
          </div>
        </div>

        {/* Price (not for free items) */}
        {formData.type !== 'free' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-7 pr-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pricing Type
              </label>
              <select
                name="pricingType"
                value={formData.pricingType}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              >
                <option value="fixed">Fixed Price</option>
                <option value="negotiable">Negotiable</option>
                <option value="hourly">Per Hour</option>
                <option value="daily">Per Day</option>
              </select>
            </div>
          </div>
        )}

        {/* Condition (for products/rentals) */}
        {(formData.type === 'product' || formData.type === 'rental') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
            >
              <option value="">Select condition</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Location & Delivery */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City or neighborhood"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
            />
          </div>
        </div>

        {/* Delivery Options */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="isDeliverable"
            id="isDeliverable"
            checked={formData.isDeliverable}
            onChange={handleChange}
            className="mt-1"
          />
          <div>
            <label
              htmlFor="isDeliverable"
              className="font-medium text-gray-700 dark:text-gray-300"
            >
              Delivery available
            </label>
            {formData.isDeliverable && (
              <div className="mt-2">
                <input
                  type="number"
                  name="deliveryRadius"
                  value={formData.deliveryRadius}
                  onChange={handleChange}
                  min="1"
                  placeholder="Delivery radius in miles"
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="vintage, handmade, eco-friendly (comma-separated)"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
          />
        </div>

        {/* Community Donation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Community Donation (% of sale)
          </label>
          <input
            type="range"
            name="donatePercent"
            value={formData.donatePercent}
            onChange={handleChange}
            min="0"
            max="100"
            step="5"
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>0%</span>
            <span className="font-medium text-ocean">{formData.donatePercent}%</span>
            <span>100%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This percentage will go to your community&apos;s projects
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/marketplace"
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || communities.length === 0}
            className="px-6 py-2 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
