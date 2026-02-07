"use client";

import { useEffect, useRef, useId, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FocusTrap } from "@/components/a11y/focus-trap";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            ref={overlayRef}
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === overlayRef.current) onClose();
            }}
          />
          <FocusTrap active={open}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              className={cn(
                "relative z-10 bg-white h-full w-full shadow-xl overflow-y-auto dark:bg-dark-elevated dark:border-l dark:border-dark-border",
                width
              )}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border sticky top-0 bg-white dark:bg-dark-elevated z-10">
                  <h2
                    id={titleId}
                    className="text-lg font-heading font-semibold text-storm dark:text-dark-text"
                  >
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="p-1 rounded-lg text-storm-light hover:bg-gray-100 transition-colors dark:text-dark-text-secondary dark:hover:bg-dark-border"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              )}
              <div className="px-6 py-4">{children}</div>
            </motion.div>
          </FocusTrap>
        </div>
      )}
    </AnimatePresence>
  );
}
