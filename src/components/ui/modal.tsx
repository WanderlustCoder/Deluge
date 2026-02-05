"use client";

import { useEffect, useRef, useId, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FocusTrap } from "@/components/a11y/focus-trap";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
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
                "relative z-10 bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto dark:bg-dark-elevated dark:border dark:border-dark-border",
                className
              )}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border">
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
