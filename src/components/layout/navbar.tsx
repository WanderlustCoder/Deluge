"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Droplets,
  LayoutDashboard,
  FolderOpen,
  Tv,
  Heart,
  BarChart3,
  Banknote,
  Users2,
  TrendingUp,
  UserCircle,
  LogOut,
  Menu,
  X,
  FileText,
  Store,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/proposals", label: "Propose", icon: FileText },
  { href: "/watch", label: "Watch Ads", icon: Tv },
  { href: "/fund", label: "Fund", icon: Heart },
  { href: "/impact", label: "Impact", icon: BarChart3 },
  { href: "/loans", label: "Loans", icon: Banknote },
  { href: "/communities", label: "Communities", icon: Users2 },
  { href: "/business", label: "Directory", icon: Store },
  { href: "/aquifer", label: "Aquifer", icon: Droplets },
  { href: "/leaderboards", label: "Progress", icon: TrendingUp },
  { href: "/account", label: "Account", icon: UserCircle },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 dark:bg-dark-elevated dark:border-dark-border" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Droplets className="h-7 w-7 text-ocean" aria-hidden="true" />
            <span className="font-heading font-bold text-xl tracking-wide text-ocean">
              DELUGE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-ocean-light"
                      : "text-storm-light hover:text-storm hover:bg-gray-100 dark:text-dark-text-secondary dark:hover:text-dark-text dark:hover:bg-dark-border"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center gap-4">
            {session?.user && (
              <>
                <ThemeToggle />
                <NotificationBell />
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-storm-light dark:text-dark-text-secondary">
                    {session.user.name}
                  </span>
                  {session.user.platformRoles?.length > 0 && (
                    <span className="flex gap-0.5">
                      {session.user.platformRoles.includes("verified_giver") && (
                        <span title="Verified Giver" className="text-teal text-xs">&#x2713;</span>
                      )}
                      {session.user.platformRoles.includes("sponsor") && (
                        <span title="Sponsor" className="text-gold text-xs">&#x2605;</span>
                      )}
                    </span>
                  )}
                </div>
                {session.user.accountType === "admin" && (
                  <Link
                    href="/admin"
                    className="text-sm text-gold font-medium hover:text-gold-light"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-1 text-sm text-storm-light hover:text-red-500 transition-colors dark:text-dark-text-secondary dark:hover:text-red-400"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-storm hover:bg-gray-100 dark:text-dark-text dark:hover:bg-dark-border"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-ocean-light"
                      : "text-storm-light hover:text-storm hover:bg-gray-100 dark:text-dark-text-secondary dark:hover:text-dark-text dark:hover:bg-dark-border"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
            {session?.user && (
              <div className="flex items-center gap-2 px-3 py-2">
                <ThemeToggle />
              </div>
            )}
            {session?.user && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full dark:hover:bg-red-900/20"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
