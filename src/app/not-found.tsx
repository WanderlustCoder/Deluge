import Link from "next/link";
import { Droplets } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-foam flex flex-col items-center justify-center p-4 text-center">
      <Droplets className="h-16 w-16 text-ocean/30 mb-6" />
      <h1 className="font-heading font-bold text-6xl text-ocean mb-2">404</h1>
      <h2 className="font-heading font-semibold text-xl text-storm mb-4">
        Page Not Found
      </h2>
      <p className="text-storm-light max-w-md mb-8">
        This page seems to have evaporated. Let&apos;s get you back to flowing water.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center px-6 py-3 bg-ocean text-white rounded-lg font-heading font-semibold hover:bg-ocean-light transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
