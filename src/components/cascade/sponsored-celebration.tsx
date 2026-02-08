"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface SponsorData {
  id: string;
  tier: string;
  logoUrl: string | null;
  message: string | null;
  linkUrl: string | null;
  corporateName: string | null;
  businessName: string | null;
}

interface SponsoredCelebrationProps {
  show: boolean;
  projectTitle: string;
  projectId: string;
  onDone: () => void;
}

export function SponsoredCelebration({
  show,
  projectTitle,
  projectId,
  onDone,
}: SponsoredCelebrationProps) {
  const [sponsor, setSponsor] = useState<SponsorData | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    if (show && projectId) {
      // Fetch sponsor for this cascade
      fetch(`/api/cascade-sponsor?projectId=${projectId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.sponsor) {
            setSponsor(data.sponsor);
            setEventId(data.eventId);
          }
        })
        .catch(() => {
          // No sponsor, that's fine
        });
    }
  }, [show, projectId]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDone, sponsor ? 8000 : 6000);
      return () => clearTimeout(timer);
    }
  }, [show, onDone, sponsor]);

  const handleSponsorClick = () => {
    if (eventId) {
      // Track click
      fetch(`/api/sponsors/click/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "cascade" }),
      }).catch(() => {});
    }
    if (sponsor?.linkUrl) {
      window.open(sponsor.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  const sponsorName = sponsor?.businessName || sponsor?.corporateName || "Sponsor";
  const isPremium = sponsor?.tier === "premium";
  const isFeatured = sponsor?.tier === "featured" || isPremium;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Waterfall background */}
          <div className="absolute inset-0 bg-gradient-to-b from-ocean via-teal to-ocean-dark overflow-hidden">
            {/* Falling water drops */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 bg-white/40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  height: `${20 + Math.random() * 60}px`,
                }}
                initial={{ top: "-10%", opacity: 0 }}
                animate={{
                  top: "110%",
                  opacity: [0, 0.7, 0.7, 0],
                }}
                transition={{
                  duration: 1.5 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "linear",
                }}
              />
            ))}

            {/* Splash particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`splash-${i}`}
                className="absolute w-3 h-3 bg-white/30 rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  bottom: "20%",
                }}
                initial={{ scale: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  y: [0, -80 - Math.random() * 120],
                  x: (Math.random() - 0.5) * 100,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 1 + Math.random() * 3,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 text-center text-white px-4 max-w-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", damping: 10 }}
              className="text-7xl mb-6"
            >
              {isPremium ? "🌊💎" : "🌊"}
            </motion.div>

            <motion.h1
              className="font-heading font-bold text-4xl sm:text-5xl mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              CASCADE!
            </motion.h1>

            <motion.p
              className="text-xl opacity-90 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              {projectTitle}
            </motion.p>

            <motion.p
              className="text-lg opacity-80 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              has reached its funding goal!
            </motion.p>

            {/* Sponsor branding */}
            {sponsor && (
              <motion.div
                className={`mb-6 p-4 rounded-xl ${
                  isPremium
                    ? "bg-gold/20 border border-gold/40"
                    : "bg-white/10 border border-white/20"
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 }}
              >
                <p className="text-xs uppercase tracking-wider opacity-60 mb-2">
                  {isPremium ? "Premium Sponsor" : "Sponsored by"}
                </p>

                {sponsor.logoUrl && (
                  <div className="mb-3 flex justify-center">
                    <div className="relative w-24 h-12 bg-white/90 rounded-lg p-2">
                      <Image
                        src={sponsor.logoUrl}
                        alt={sponsorName}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                <p className="font-semibold text-lg">{sponsorName}</p>

                {isFeatured && sponsor.message && (
                  <p className="text-sm opacity-80 mt-2 italic">
                    &ldquo;{sponsor.message}&rdquo;
                  </p>
                )}

                {isFeatured && sponsor.linkUrl && (
                  <button
                    onClick={handleSponsorClick}
                    className="mt-3 px-4 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
                  >
                    Learn More
                  </button>
                )}
              </motion.div>
            )}

            <motion.p
              className="text-2xl font-heading italic opacity-70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: sponsor ? 2.5 : 1.5 }}
            >
              One by One, All at Once.
            </motion.p>

            <motion.button
              className="mt-8 px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
              onClick={onDone}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: sponsor ? 3 : 2 }}
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
