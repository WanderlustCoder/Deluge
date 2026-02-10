import type { ReactNode } from "react";

export const metadata = { title: "Giving Circles" };

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
