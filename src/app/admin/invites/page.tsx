import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InviteAdminForm } from "@/components/admin/invite-admin-form";

export default async function AdminInvitesPage() {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") redirect("/dashboard");

  const invites = await prisma.adminInvite.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serialized = invites.map((inv) => ({
    ...inv,
    expiresAt: inv.expiresAt.toISOString(),
    acceptedAt: inv.acceptedAt?.toISOString() ?? null,
    createdAt: inv.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Admin Invites
        </h1>
        <p className="text-storm-light mt-1">
          Invite new administrators to the platform.
        </p>
      </div>

      <InviteAdminForm initialInvites={serialized} />
    </div>
  );
}
