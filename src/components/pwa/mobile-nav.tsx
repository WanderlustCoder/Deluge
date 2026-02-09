"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderHeart, Users, TrendingUp, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderHeart },
  { href: "/communities", label: "Communities", icon: Users },
  { href: "/impact", label: "Impact", icon: TrendingUp },
  { href: "/account", label: "Account", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border md:hidden safe-area-pb">
      <div className="flex items-stretch justify-around h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 transition-colors ${
                isActive
                  ? "text-ocean"
                  : "text-storm-light hover:text-storm"
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
