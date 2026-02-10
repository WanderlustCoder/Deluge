import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center text-white">
      <h2 className="font-heading font-bold text-2xl mb-2">Page Not Found</h2>
      <p className="text-white/70 mb-6">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/login"
        className="inline-block px-6 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
      >
        Go to Login
      </Link>
    </div>
  );
}
