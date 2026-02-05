import type { ReactNode } from "react";
import Link from "next/link";
import { Droplets } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-water-gradient flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Droplets className="h-8 w-8 text-white" />
        <span className="font-heading font-bold text-2xl tracking-wide text-white">
          DELUGE
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
