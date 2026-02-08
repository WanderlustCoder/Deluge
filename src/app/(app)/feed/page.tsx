import type { Metadata } from "next";
import { FeedList } from "@/components/feed/feed-list";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Your Feed | Deluge",
  description: "See updates from projects and communities you follow.",
};

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-ocean dark:text-white">
          Your Feed
        </h1>
        <p className="text-storm mt-1">
          Updates from projects, communities, and people you follow.
        </p>
      </div>

      <FeedList />
    </div>
  );
}
