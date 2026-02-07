"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Star, Bookmark, BookmarkCheck, Crown } from "lucide-react";

interface BusinessCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  imageUrl?: string | null;
  tier: string;
  isSaved: boolean;
  recommendationCount: number;
  onToggleSave?: () => void;
}

export function BusinessCard({
  id,
  name,
  category,
  description,
  location,
  imageUrl,
  tier,
  isSaved,
  recommendationCount,
  onToggleSave,
}: BusinessCardProps) {
  const isPremium = tier === "premium" || tier === "featured";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow ${
        isPremium ? "ring-2 ring-gold" : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {isPremium && (
        <div className="absolute top-2 left-2 z-10 bg-gold text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          <Crown className="w-3 h-3" />
          {tier === "premium" ? "Premium" : "Featured"}
        </div>
      )}

      <Link href={`/business/${id}`}>
        <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">🏪</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/business/${id}`} className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-ocean">
              {name}
            </h3>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleSave?.();
            }}
            className="text-gray-400 hover:text-gold transition-colors"
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-gold" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        <p className="text-xs text-ocean font-medium mt-1">{category}</p>

        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{location}</span>
          </div>
          {recommendationCount > 0 && (
            <div className="flex items-center gap-1 text-gold text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span>{recommendationCount}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
