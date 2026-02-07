import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AuditLogTable } from "@/components/admin/audit-log-table";

export default async function AuditPage() {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") redirect("/dashboard");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Serialize dates for client component
  const serialized = logs.map((log) => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Audit Log
        </h1>
        <p className="text-storm-light mt-1">
          Track all admin actions across the platform.
        </p>
      </div>

      <AuditLogTable initialLogs={serialized} />
    </div>
  );
}
