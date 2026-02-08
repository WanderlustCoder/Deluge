'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MakeOfferModal } from '@/components/marketplace/make-offer-modal';
import { useToast } from '@/components/ui/toast';

interface Listing {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  subcategory: string | null;
  price: number | null;
  pricingType: string;
  images: string[];
  tags: string[];
  condition: string | null;
  location: string | null;
  isDeliverable: boolean;
  deliveryRadius: number | null;
  quantity: number;
  donatePercent: number;
  viewCount: number;
  status: string;
  createdAt: string;
  seller: { id: string; name: string; avatarUrl: string | null };
  community: { id: string; name: string; slug: string };
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchListing();
  }, [params.id]);

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/marketplace/listings/${params.id}`);
      const data = await res.json();
      if (data.listing) {
        setListing(data.listing);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeOffer = async (amount: number, message?: string) => {
    const res = await fetch('/api/marketplace/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: listing!.id, amount, message }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to submit offer');
    }

    toast('Offer submitted. The seller will be notified.', 'success');
  };

  const handleInquiry = async () => {
    router.push(`/marketplace/${params.id}/inquiry`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Listing Not Found
        </h1>
        <Link href="/marketplace" className="text-ocean hover:underline">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link href="/marketplace" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          Marketplace
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
            {listing.images.length > 0 ? (
              <img
                src={listing.images[selectedImage]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {listing.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    i === selectedImage
                      ? 'border-ocean'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="inline-block px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs font-medium capitalize mb-2">
                {listing.type}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {listing.title}
              </h1>
            </div>
            {listing.type === 'free' ? (
              <span className="px-3 py-1 bg-green-500 text-white rounded-lg font-semibold">
                FREE
              </span>
            ) : (
              listing.price !== null && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-ocean">
                    ${listing.price.toFixed(2)}
                  </p>
                  {listing.pricingType !== 'fixed' && (
                    <p className="text-sm text-gray-500 capitalize">
                      {listing.pricingType}
                    </p>
                  )}
                </div>
              )
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span>{listing.category}</span>
            {listing.subcategory && (
              <>
                <span>/</span>
                <span>{listing.subcategory}</span>
              </>
            )}
            <span>{listing.viewCount} views</span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-wrap">
            {listing.description}
          </p>

          {/* Details Table */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {listing.condition && (
                <>
                  <dt className="text-gray-500 dark:text-gray-400">Condition</dt>
                  <dd className="text-gray-900 dark:text-white">{listing.condition}</dd>
                </>
              )}
              {listing.location && (
                <>
                  <dt className="text-gray-500 dark:text-gray-400">Location</dt>
                  <dd className="text-gray-900 dark:text-white">{listing.location}</dd>
                </>
              )}
              <dt className="text-gray-500 dark:text-gray-400">Delivery</dt>
              <dd className="text-gray-900 dark:text-white">
                {listing.isDeliverable
                  ? listing.deliveryRadius
                    ? `Available within ${listing.deliveryRadius} miles`
                    : 'Available'
                  : 'Pickup only'}
              </dd>
              <dt className="text-gray-500 dark:text-gray-400">Quantity</dt>
              <dd className="text-gray-900 dark:text-white">{listing.quantity}</dd>
              {listing.donatePercent > 0 && (
                <>
                  <dt className="text-gray-500 dark:text-gray-400">Community Donation</dt>
                  <dd className="text-green-600 font-medium">{listing.donatePercent}% of sale</dd>
                </>
              )}
            </dl>
          </div>

          {/* Tags */}
          {listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {listing.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {listing.status === 'active' && (
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setShowOfferModal(true)}
                className="flex-1 px-4 py-3 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90"
              >
                Make Offer
              </button>
              <button
                onClick={handleInquiry}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Ask a Question
              </button>
            </div>
          )}

          {listing.status !== 'active' && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg mb-6">
              This listing is no longer available (Status: {listing.status})
            </div>
          )}

          {/* Seller Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Seller
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {listing.seller.avatarUrl ? (
                    <img
                      src={listing.seller.avatarUrl}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-gray-500">
                      {listing.seller.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {listing.seller.name}
                  </p>
                  <Link
                    href={`/communities/${listing.community.id}`}
                    className="text-sm text-ocean hover:underline"
                  >
                    {listing.community.name}
                  </Link>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Posted {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      <MakeOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        listing={{
          id: listing.id,
          title: listing.title,
          price: listing.price,
        }}
        onSubmit={handleMakeOffer}
      />
    </div>
  );
}
