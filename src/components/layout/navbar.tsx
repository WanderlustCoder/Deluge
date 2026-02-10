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
  ChevronDown,
  Compass,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Primary nav - most used actions
const primaryLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/watch", label: "Watch", icon: Tv },
  { href: "/fund", label: "Fund", icon: Heart },
  { href: "/projects", label: "Projects", icon: FolderOpen },
];

// Explore dropdown - discovery features
const exploreLinks = [
  { href: "/communities", label: "Communities", icon: Users2 },
  { href: "/aquifer", label: "Aquifer", icon: Droplets },
  { href: "/leaderboards", label: "Leaderboards", icon: TrendingUp },
];

// More dropdown - additional features
const moreLinks = [
  { href: "/loans", label: "Loans", icon: Banknote },
  { href: "/proposals", label: "Propose", icon: FileText },
  { href: "/impact", label: "My Impact", icon: BarChart3 },
];

// All links for mobile
const allLinks = [
  ...primaryLinks,
  ...exploreLinks,
  ...moreLinks,
  { href: "/account", label: "Account", icon: UserCircle },
];

function NavDropdown({
  label,
  icon: Icon,
  links,
  pathname
}: {
  label: string;
  icon: React.ElementType;
  links: typeof exploreLinks;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAnyActive = links.some(link => pathname.startsWith(link.href));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isAnyActive
            ? "bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-ocean-light"
            : "text-storm-light hover:text-storm hover:bg-gray-100 dark:text-dark-text-secondary dark:hover:text-dark-text dark:hover:bg-dark-border"
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-dark-elevated rounded-lg shadow-lg border border-gray-200 dark:border-dark-border py-1 z-50">
          {links.map((link) => {
            const LinkIcon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-ocean-light"
                    : "text-storm-light hover:text-storm hover:bg-gray-50 dark:text-dark-text-secondary dark:hover:text-dark-text dark:hover:bg-dark-border"
                )}
              >
                <LinkIcon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
            {/* Primary links */}
            {primaryLinks.map((link) => {
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

            {/* Explore dropdown */}
            <NavDropdown label="Explore" icon={Compass} links={exploreLinks} pathname={pathname} />

            {/* More dropdown */}
            <NavDropdown label="More" icon={Menu} links={moreLinks} pathname={pathname} />
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user && (
              <>
                <ThemeToggle />
                <NotificationBell />
                <Link
                  href="/account"
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm transition-colors",
                    pathname.startsWith("/account")
                      ? "text-ocean"
                      : "text-storm-light hover:text-storm dark:text-dark-text-secondary dark:hover:text-dark-text"
                  )}
                >
                  <UserCircle className="h-4 w-4" />
                  <span>{session.user.name?.split(' ')[0]}</span>
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
                </Link>
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
            {allLinks.map((link) => {
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
              <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 dark:border-dark-border mt-2 pt-2">
                <ThemeToggle />
                {session.user.accountType === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm text-gold font-medium"
                  >
                    Admin Panel
                  </Link>
                )}
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
