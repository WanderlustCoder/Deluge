import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { SkipToContent } from "@/components/a11y/skip-to-content";
import { MobileNav } from "@/components/pwa/mobile-nav";
import { PWAProvider } from "@/components/pwa/pwa-provider";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Deluge" },
  description: "Your Deluge dashboard — manage donations, circles, and community impact.",
};
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <PWAProvider>
        <div className="flex flex-col min-h-screen">
          <SkipToContent />
          <Navbar />
          <main
            id="main-content"
            className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8"
          >
            {children}
          </main>
          <MobileNav />
        </div>
      </PWAProvider>
    </Providers>
  );
}
