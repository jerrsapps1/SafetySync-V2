import { db } from "./db";
import { adminAuditLogs } from "@shared/schema";
import { desc } from "drizzle-orm";
import type { Request } from "express";

interface AuditEntry {
  actorUserId: string;
  actorRole: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await db.insert(adminAuditLogs).values({
      actorUserId: entry.actorUserId,
      actorRole: entry.actorRole,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      metadata: entry.metadata ?? null,
    });
  } catch (err) {
    console.error("Audit log write failed:", err);
  }
}

export function auditFromReq(req: Request, action: string, extra?: Partial<AuditEntry>) {
  const user = (req as any).user;
  if (!user) return;
  logAudit({
    actorUserId: user.id,
    actorRole: user.role,
    action,
    ...extra,
  });
}

export async function getAuditLogs(limit = 100) {
  return db
    .select()
    .from(adminAuditLogs)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(limit);
}
