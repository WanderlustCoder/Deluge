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
  CreditCard,
  Heart,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
  { href: "/admin/reserve", label: "Reserve", icon: Vault },
  { href: "/admin/settlements", label: "Settlements", icon: FileStack },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/proposals", label: "Proposals", icon: FileText },
  { href: "/admin/aquifer", label: "Aquifer", icon: Waves },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/platform", label: "Platform", icon: Globe },
  { href: "/admin/invites", label: "Invites", icon: UserPlus },
  { href: "/admin/roles", label: "Roles", icon: Shield },
  { href: "/admin/credit-reporting", label: "Credit Reporting", icon: CreditCard },
  { href: "/admin/advocates", label: "Advocates", icon: Heart },
  { href: "/admin/flags", label: "Flags", icon: AlertTriangle },
  { href: "/admin/verification", label: "Verification", icon: ShieldCheck },
  { href: "/admin/audit", label: "Audit Log", icon: ClipboardList },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-200 dark:border-dark-border">
        <Link href="/admin" className="flex items-center gap-2">
          <Droplets className="h-7 w-7 text-ocean" />
          <span className="font-heading font-bold text-xl tracking-wide text-ocean">
            DELUGE
          </span>
        </Link>
        <p className="text-xs text-storm-light mt-1 font-medium">Admin Console</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Admin navigation">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
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
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-dark-border space-y-1">
        <div className="flex items-center gap-2 px-3 py-2">
          <ThemeToggle />
        </div>
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-storm-light hover:text-storm hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to App
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors"
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
