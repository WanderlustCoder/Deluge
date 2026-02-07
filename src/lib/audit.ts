import { prisma } from "@/lib/prisma";

interface AuditParams {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
}

export function logAudit(params: AuditParams) {
  // Fire-and-forget — don't block the response
  prisma.auditLog
    .create({
      data: {
        adminId: params.adminId,
        adminEmail: params.adminEmail,
        action: params.action,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        details: params.details ?? null,
      },
    })
    .catch(() => {
      // Silently fail — audit logging should never break admin actions
    });
}
