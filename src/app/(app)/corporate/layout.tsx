'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, Target, FileText, Settings, ArrowLeft } from 'lucide-react';

interface CorporateAccount {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [account, setAccount] = useState<CorporateAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract slug from pathname
  const slugMatch = pathname.match(/\/corporate\/([^/]+)/);
  const slug = slugMatch ? slugMatch[1] : null;

  useEffect(() => {
    if (!slug || slug === 'join') {
      setLoading(false);
      return;
    }

    fetch(`/api/corporate/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.account) {
          setAccount(data.account);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  // Don't show layout for join pages
  if (pathname.includes('/join/')) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-storm/50">Loading...</div>
      </div>
    );
  }

  if (!account && slug && slug !== 'join') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-storm-light dark:text-dark-text-secondary mb-4">
            Corporate account not found
          </p>
          <Link href="/dashboard" className="text-ocean dark:text-sky hover:underline">
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: `/corporate/${slug}`, label: 'Dashboard', icon: Building2 },
    { href: `/corporate/${slug}/employees`, label: 'Employees', icon: Users },
    { href: `/corporate/${slug}/campaigns`, label: 'Campaigns', icon: Target },
    { href: `/corporate/${slug}/reports`, label: 'Reports', icon: FileText },
    { href: `/corporate/${slug}/settings`, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white dark:bg-dark-border/50 border-b border-gray-200 dark:border-foam/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-storm-light dark:text-dark-text-secondary hover:text-ocean dark:hover:text-sky transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-200 dark:bg-foam/20" />
              <div className="flex items-center gap-3">
                {account?.logoUrl ? (
                  <img
                    src={account.logoUrl}
                    alt={account?.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: account?.primaryColor || '#0D47A1' }}
                  >
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="font-semibold text-ocean dark:text-sky">
                    {account?.name || 'Corporate Portal'}
                  </h1>
                  <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                    Employee Giving Portal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {slug && (
        <div className="bg-white dark:bg-dark-border/50 border-b border-gray-200 dark:border-foam/10">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-1 overflow-x-auto py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-ocean dark:bg-sky text-white'
                        : 'text-storm-light dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-foam/10'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
