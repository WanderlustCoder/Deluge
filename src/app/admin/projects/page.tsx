import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminProjectFilters } from "@/components/admin/project-filters";

export default async function AdminProjectsPage() {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") redirect("/dashboard");

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  const statuses = Array.from(new Set(projects.map((p) => p.status)));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-3xl text-storm">
            Projects
          </h1>
          <p className="text-storm-light mt-1">
            Manage and monitor all community projects.
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </Button>
        </Link>
      </div>

      <AdminProjectFilters
        projects={JSON.parse(JSON.stringify(projects))}
        statuses={statuses}
      />
    </div>
  );
}
