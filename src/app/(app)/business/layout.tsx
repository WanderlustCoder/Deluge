import type { ReactNode } from "react";

export const metadata = { title: "Business Directory" };

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
