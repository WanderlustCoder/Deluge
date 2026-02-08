'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getShareUrl, ShareData } from '@/lib/social/sharing';
import { SHARE_PLATFORMS, SharePlatform } from '@/lib/social';

interface ShareButtonsProps {
  entityType: string;
  entityId: string;
  title: string;
  description: string;
  url: string;
  hashtags?: string[];
  platforms?: SharePlatform[];
  onShare?: (platform: SharePlatform) => void;
}

export function ShareButtons({
  entityType,
  entityId,
  title,
  description,
  url,
  hashtags,
  platforms = ['twitter', 'facebook', 'linkedin', 'whatsapp', 'email', 'copy'],
  onShare,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareData: ShareData = {
    title,
    description,
    url,
    hashtags,
  };

  async function handleShare(platform: SharePlatform) {
    if (platform === 'copy') {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      const shareUrl = getShareUrl(platform, shareData);
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    // Record the share
    try {
      await fetch('/api/social/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          platform,
          shareType: 'link',
        }),
      });
    } catch (error) {
      console.error('Error recording share:', error);
    }

    onShare?.(platform);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => (
        <button
          key={platform}
          onClick={() => handleShare(platform)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title={SHARE_PLATFORMS[platform].name}
        >
          <span>{SHARE_PLATFORMS[platform].icon}</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {platform === 'copy' && copied ? 'Copied!' : SHARE_PLATFORMS[platform].name}
          </span>
        </button>
      ))}
    </div>
  );
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  entityId: string;
  title: string;
  description: string;
  url: string;
  hashtags?: string[];
}

export function ShareModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  title,
  description,
  url,
  hashtags,
}: ShareModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Share
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                {url}
              </p>
            </div>

            <ShareButtons
              entityType={entityType}
              entityId={entityId}
              title={title}
              description={description}
              url={url}
              hashtags={hashtags}
              onShare={() => {}}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
