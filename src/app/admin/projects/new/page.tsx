import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import Link from "next/link";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-ocean hover:underline">
          &larr; Back to Admin
        </Link>
      </div>
      <h1 className="font-heading font-bold text-2xl text-storm mb-6">
        Create New Project
      </h1>
      <ProjectForm mode="create" />
    </div>
  );
}
