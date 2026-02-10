import type { ReactNode } from "react";
import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: { default: "Deluge", template: "%s | Deluge" },
  description:
    "Community-powered giving platform. Pool resources, fund projects, and create lasting impact together.",
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>;
}
