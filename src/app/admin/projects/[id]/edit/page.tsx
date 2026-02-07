import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import Link from "next/link";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") redirect("/dashboard");

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-ocean hover:underline">
          &larr; Back to Admin
        </Link>
      </div>
      <h1 className="font-heading font-bold text-2xl text-storm mb-6">
        Edit Project
      </h1>
      <ProjectForm mode="edit" initialData={project} />
    </div>
  );
}
