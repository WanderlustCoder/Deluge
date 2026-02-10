"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Droplets,
  LayoutDashboard,
  DollarSign,
  FolderOpen,
  Users,
  Globe,
  ClipboardList,
  UserPlus,
  Shield,
  Waves,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Vault,
  FileStack,
  FileText,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { LucideIcon } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavSection {
  label: string;
  icon: LucideIcon;
  links: NavLink[];
}

const topLinks: NavLink[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
];

const navSections: NavSection[] = [
  {
    label: "Finance",
    icon: DollarSign,
    links: [
      { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
      { href: "/admin/reserve", label: "Reserve", icon: Vault },
      { href: "/admin/settlements", label: "Settlements", icon: FileStack },
    ],
  },
  {
    label: "Projects",
    icon: FolderOpen,
    links: [
      { href: "/admin/projects", label: "Projects", icon: FolderOpen },
      { href: "/admin/proposals", label: "Proposals", icon: FileText },
      { href: "/admin/aquifer", label: "Aquifer", icon: Waves },
    ],
  },
  {
    label: "People",
    icon: Users,
    links: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/invites", label: "Invites", icon: UserPlus },
      { href: "/admin/roles", label: "Roles", icon: Shield },
    ],
  },
  {
    label: "Trust & Safety",
    icon: ShieldCheck,
    links: [
      { href: "/admin/verification", label: "Verification", icon: ShieldCheck },
      { href: "/admin/flags", label: "Flags", icon: AlertTriangle },
      { href: "/admin/audit", label: "Audit Log", icon: ClipboardList },
    ],
  },
  {
    label: "Settings",
    icon: Globe,
    links: [
      { href: "/admin/platform", label: "Platform", icon: Globe },
    ],
  },
];

function SidebarSection({
  section,
  pathname,
  onNavigate,
}: {
  section: NavSection;
  pathname: string;
  onNavigate: () => void;
}) {
  const hasActiveChild = section.links.some((link) =>
    link.exact ? pathname === link.href : pathname.startsWith(link.href)
  );
  const [open, setOpen] = useState(hasActiveChild);
  const SectionIcon = section.icon;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors",
          hasActiveChild
            ? "text-ocean dark:text-ocean-light"
            : "text-storm-light hover:text-storm"
        )}
      >
        <span className="flex items-center gap-2">
          <SectionIcon className="h-4 w-4" />
          {section.label}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="ml-3 mt-0.5 space-y-0.5">
          {section.links.map((link) => {
            const Icon = link.icon;
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-ocean-light"
                    : "text-storm-light hover:text-storm hover:bg-gray-100 dark:hover:bg-dark-border"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-dark-border">
        <Link href="/admin" className="flex items-center gap-2">
          <Droplets className="h-7 w-7 text-ocean" />
          <span className="font-heading font-bold text-xl tracking-wide text-ocean">
            DELUGE
          </span>
        </Link>
        <p className="text-xs text-storm-light mt-1 font-medium">Admin Console</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-2" aria-label="Admin navigation">
        {/* Overview — always visible */}
        {topLinks.map((link) => {
          const Icon = link.icon;
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-ocean-light"
                  : "text-storm-light hover:text-storm hover:bg-gray-100 dark:hover:bg-dark-border"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}

        {/* Collapsible sections */}
        {navSections.map((section) => (
          <SidebarSection
            key={section.label}
            section={section}
            pathname={pathname}
            onNavigate={closeMobile}
          />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-3 border-t border-gray-200 dark:border-dark-border space-y-1">
        <div className="flex items-center gap-2 px-3 py-1.5">
          <ThemeToggle />
        </div>
        <Link
          href="/dashboard"
          onClick={closeMobile}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-storm-light hover:text-storm hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to App
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 dark:bg-dark-elevated dark:border-dark-border flex items-center px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-storm hover:bg-gray-100 dark:hover:bg-dark-border"
          aria-label="Toggle admin menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="flex items-center gap-2 ml-3">
          <Droplets className="h-5 w-5 text-ocean" />
          <span className="font-heading font-bold text-sm text-ocean">DELUGE ADMIN</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-14 left-0 bottom-0 z-50 w-64 bg-white dark:bg-dark-elevated flex flex-col transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 dark:bg-dark-elevated dark:border-dark-border">
        {sidebarContent}
      </aside>
    </>
  );
}
