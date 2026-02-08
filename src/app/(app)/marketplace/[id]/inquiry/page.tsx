'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { InquiryChat } from '@/components/marketplace/inquiry-chat';
import { useToast } from '@/components/ui/toast';

interface Listing {
  id: string;
  title: string;
  price: number | null;
  images: string[];
  seller: { id: string; name: string };
}

export default function ListingInquiryPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

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

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/marketplace/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: params.id, message }),
      });

      const data = await res.json();
      if (data.inquiry) {
        setInquiryId(data.inquiry.id);
        toast('Message sent. The seller will be notified.', 'success');
      }
    } catch (error) {
      console.error('Error creating inquiry:', error);
      toast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link href="/marketplace" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          Marketplace
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link href={`/marketplace/${params.id}`} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          {listing.title}
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white">Inquiry</span>
      </nav>

      {/* Listing Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
            {listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-gray-900 dark:text-white truncate">
              {listing.title}
            </h2>
            {listing.price !== null && (
              <p className="text-ocean font-semibold">${listing.price.toFixed(2)}</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Seller: {listing.seller.name}
            </p>
          </div>
        </div>
      </div>

      {/* Chat or Initial Message */}
      {inquiryId ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-[500px]">
          <InquiryChat inquiryId={inquiryId} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ask About This Listing
          </h2>
          <form onSubmit={handleSendInquiry}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Hi, I'm interested in this listing. Could you tell me more about..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 mb-4"
              required
            />
            <div className="flex justify-end gap-3">
              <Link
                href={`/marketplace/${params.id}`}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="px-4 py-2 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90 disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
