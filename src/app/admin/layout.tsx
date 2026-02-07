import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <AdminSidebar />
        {/* Content area: offset by sidebar on desktop, offset by top bar on mobile */}
        <main className="lg:pl-60 pt-14 lg:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </Providers>
  );
}
