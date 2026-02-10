import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h2 className="font-heading font-bold text-2xl text-gray-900 dark:text-white mb-2">
        Page Not Found
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        The admin page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/admin"
        className="px-6 py-2.5 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90 transition-colors"
      >
        Go to Admin Dashboard
      </Link>
    </div>
  );
}
