"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SharePlatform, generateShareText } from "@/lib/shares";

interface ShareModalProps {
  projectId: string;
  projectTitle: string;
  fundingPercent: number;
  isOpen: boolean;
  onClose: () => void;
}

const PLATFORMS = [
  { id: "twitter" as SharePlatform, label: "X (Twitter)", icon: "𝕏" },
  { id: "facebook" as SharePlatform, label: "Facebook", icon: "f" },
  { id: "email" as SharePlatform, label: "Email", icon: "✉" },
  { id: "copy" as SharePlatform, label: "Copy Link", icon: "🔗" },
];

export function ShareModal({
  projectId,
  projectTitle,
  fundingPercent,
  isOpen,
  onClose,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);

  const projectUrl = typeof window !== "undefined"
    ? `${window.location.origin}/projects/${projectId}`
    : `/projects/${projectId}`;

  const shareTexts = generateShareText(projectTitle, fundingPercent, projectUrl);

  async function trackShare(platform: SharePlatform) {
    try {
      await fetch(`/api/projects/${projectId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
    } catch {
      // Silent fail for tracking
    }
  }

  async function handleShare(platform: SharePlatform) {
    setSharing(platform);

    await trackShare(platform);

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTexts.twitter)}`,
          "_blank",
          "width=550,height=420"
        );
        break;

      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}&quote=${encodeURIComponent(shareTexts.facebook)}`,
          "_blank",
          "width=550,height=420"
        );
        break;

      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(
          `Check out: ${projectTitle}`
        )}&body=${encodeURIComponent(shareTexts.email)}`;
        break;

      case "copy":
        try {
          await navigator.clipboard.writeText(projectUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Fallback for older browsers
          const textarea = document.createElement("textarea");
          textarea.value = projectUrl;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
        break;
    }

    setSharing(null);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white dark:bg-ocean-dark rounded-xl shadow-xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-ocean dark:text-white mb-2">
                Share Project
              </h2>

              <p className="text-sm text-storm mb-6">
                Help spread the word and boost momentum!
              </p>

              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handleShare(platform.id)}
                    disabled={sharing === platform.id}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-storm/20 hover:border-sky hover:bg-sky/5 transition group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {platform.icon}
                    </span>
                    <span className="text-sm font-medium text-storm group-hover:text-sky">
                      {platform.id === "copy" && copied
                        ? "Copied!"
                        : platform.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
