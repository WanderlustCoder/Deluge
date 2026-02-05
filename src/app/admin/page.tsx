import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatCurrencyPrecise } from "@/lib/utils";
import { AdminResetButton } from "@/components/admin/reset-button";
import { ProjectActions } from "@/components/admin/project-actions";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  const [users, projects] = await Promise.all([
    prisma.user.findMany({
      include: { watershed: true, _count: { select: { adViews: true, allocations: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-3xl text-storm">
            Admin Panel
          </h1>
          <p className="text-storm-light mt-1">
            Manage projects, users, and demo data.
          </p>
        </div>
        <AdminResetButton />
      </div>

      {/* Users */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm">
            Users ({users.length})
          </h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Role
                </th>
                <th className="text-right px-6 py-3 text-storm-light font-medium">
                  Balance
                </th>
                <th className="text-right px-6 py-3 text-storm-light font-medium">
                  Ads
                </th>
                <th className="text-right px-6 py-3 text-storm-light font-medium">
                  Allocations
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-50">
                  <td className="px-6 py-3 font-medium text-storm">
                    {user.name}
                  </td>
                  <td className="px-6 py-3 text-storm-light">
                    {user.email}
                  </td>
                  <td className="px-6 py-3">
                    <Badge
                      variant={
                        user.role === "admin" ? "gold" : "default"
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-right">
                    {formatCurrencyPrecise(user.watershed?.balance ?? 0)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {user._count.adViews}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {user._count.allocations}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-lg text-storm">
              Projects ({projects.length})
            </h2>
            <Link href="/admin/projects/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Project
              </Button>
            </Link>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Category
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-storm-light font-medium">
                  Progress
                </th>
                <th className="text-right px-6 py-3 text-storm-light font-medium">
                  Backers
                </th>
                <th className="text-right px-6 py-3 text-storm-light font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const percent = Math.round(
                  (project.fundingRaised / project.fundingGoal) * 100
                );
                return (
                  <tr key={project.id} className="border-b border-gray-50">
                    <td className="px-6 py-3 font-medium text-storm">
                      {project.title}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant="ocean">{project.category}</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={
                          project.status === "funded"
                            ? "success"
                            : "default"
                        }
                      >
                        {project.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {formatCurrency(project.fundingRaised)} /{" "}
                      {formatCurrency(project.fundingGoal)} ({percent}%)
                    </td>
                    <td className="px-6 py-3 text-right">
                      {project.backerCount}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <ProjectActions projectId={project.id} projectTitle={project.title} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
