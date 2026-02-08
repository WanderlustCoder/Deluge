'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface AuctionItemCardProps {
  item: {
    id: string;
    title: string;
    description: string;
    images: string[];
    category: string | null;
    startingBid: number;
    currentBid: number | null;
    bidIncrement: number;
    buyNowPrice: number | null;
    estimatedValue: number | null;
    donorName: string | null;
    biddingEnd: Date | string;
    status: string;
    bidCount: number;
    isActive: boolean;
  };
  onBid?: (itemId: string, amount: number) => Promise<void>;
}

export function AuctionItemCard({ item, onBid }: AuctionItemCardProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState('');

  const biddingEnd = typeof item.biddingEnd === 'string' ? new Date(item.biddingEnd) : item.biddingEnd;
  const minimumBid = (item.currentBid || item.startingBid) + item.bidIncrement;

  const handleBid = async () => {
    if (!onBid) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minimumBid) {
      setError(`Minimum bid is $${minimumBid.toFixed(2)}`);
      return;
    }

    setBidding(true);
    setError('');
    try {
      await onBid(item.id, amount);
      setBidAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Image */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
        {item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="material-icons text-4xl">gavel</span>
          </div>
        )}

        {/* Status badge */}
        {item.status === 'sold' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
              SOLD
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
          {item.title}
        </h3>

        {item.donorName && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Donated by {item.donorName}
          </p>
        )}

        {item.estimatedValue && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Est. value: ${item.estimatedValue.toLocaleString()}
          </p>
        )}

        {/* Current bid */}
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-500">Current bid</span>
            <span className="text-xl font-bold text-ocean">
              ${(item.currentBid || item.startingBid).toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {item.bidCount} bid{item.bidCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Bidding */}
        {item.isActive && onBid && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">
              Ends {formatDistanceToNow(biddingEnd, { addSuffix: true })}
            </p>

            {error && (
              <p className="text-xs text-red-500 mb-2">{error}</p>
            )}

            <div className="flex gap-2">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Min $${minimumBid.toFixed(2)}`}
                min={minimumBid}
                step="0.01"
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
              />
              <button
                onClick={handleBid}
                disabled={bidding}
                className="px-4 py-2 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90 disabled:opacity-50"
              >
                {bidding ? '...' : 'Bid'}
              </button>
            </div>

            {item.buyNowPrice && (
              <button
                onClick={() => onBid(item.id, item.buyNowPrice!)}
                disabled={bidding}
                className="w-full mt-2 px-4 py-2 border border-teal text-teal rounded-lg font-medium hover:bg-teal/10 disabled:opacity-50"
              >
                Buy Now ${item.buyNowPrice.toFixed(2)}
              </button>
            )}
          </div>
        )}

        {item.status === 'unsold' && (
          <p className="mt-3 text-center text-sm text-gray-500">
            Auction ended - Reserve not met
          </p>
        )}
      </div>
    </div>
  );
}
