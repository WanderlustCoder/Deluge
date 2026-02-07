import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RoleConfigPanel } from "@/components/admin/role-config-panel";

export default async function AdminRolesPage() {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") redirect("/dashboard");

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Platform Roles
        </h1>
        <p className="text-storm-light mt-1">
          Configure auto-earned platform roles and their thresholds.
        </p>
      </div>

      <RoleConfigPanel />
    </div>
  );
}
