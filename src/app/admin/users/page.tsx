import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrencyPrecise } from "@/lib/utils";
import { AdminUserTable } from "@/components/admin/user-table";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") redirect("/dashboard");

  const users = await prisma.user.findMany({
    include: {
      watershed: true,
      roles: { where: { isActive: true }, select: { role: true } },
      _count: { select: { adViews: true, allocations: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    accountType: u.accountType,
    archivedAt: u.archivedAt?.toISOString() ?? null,
    balance: u.watershed?.balance ?? 0,
    adViews: u._count.adViews,
    allocations: u._count.allocations,
    platformRoles: u.roles.map((r) => r.role),
    createdAt: u.createdAt.toISOString(),
  }));

  const nonArchived = serialized.filter((u) => !u.archivedAt);

  const counts = {
    active: nonArchived.filter((u) => u.accountType === "user").length,
    admins: nonArchived.filter((u) => u.accountType === "admin").length,
    archived: serialized.filter((u) => u.archivedAt).length,
    verified_giver: nonArchived.filter((u) => u.platformRoles.includes("verified_giver")).length,
    sponsor: nonArchived.filter((u) => u.platformRoles.includes("sponsor")).length,
    trusted_borrower: nonArchived.filter((u) => u.platformRoles.includes("trusted_borrower")).length,
    mentor: nonArchived.filter((u) => u.platformRoles.includes("mentor")).length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Users
        </h1>
        <p className="text-storm-light mt-1">
          Manage user accounts and roles.
        </p>
      </div>

      <AdminUserTable
        users={serialized}
        currentUserId={session.user.id!}
        counts={counts}
      />
    </div>
  );
}
