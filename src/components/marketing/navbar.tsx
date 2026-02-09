"use client";

import Link from "next/link";
import { useState } from "react";
import { Droplets, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/about/how-it-works", label: "How It Works" },
  { href: "/about/transparency", label: "Transparency" },
  { href: "/about/team", label: "Team" },
];

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Home link */}
          <Link href="/" className="flex items-center gap-2 group">
            <Droplets className="h-5 w-5 text-ocean dark:text-sky group-hover:scale-110 transition-transform" />
            <span className="font-heading font-bold text-sm tracking-wide text-ocean dark:text-sky">
              DELUGE
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-storm-light hover:text-ocean dark:hover:text-sky transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs + Theme */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-storm-light hover:text-ocean dark:hover:text-sky transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-heading font-semibold px-4 py-1.5 bg-ocean dark:bg-sky text-white rounded-lg hover:bg-ocean-light dark:hover:bg-sky/90 transition-colors"
            >
              Join
            </Link>
          </div>

          {/* Mobile: theme + menu */}
          <div className="sm:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-1.5 text-storm-light hover:text-storm"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-950">
          <nav className="px-4 py-3 space-y-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-medium text-storm-light hover:text-ocean dark:hover:text-sky transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2 flex gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-storm-light hover:text-ocean dark:hover:text-sky"
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-heading font-semibold px-4 py-1.5 bg-ocean dark:bg-sky text-white rounded-lg"
                onClick={() => setOpen(false)}
              >
                Join
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
