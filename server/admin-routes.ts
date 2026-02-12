import { Router } from "express";
import { requireAuth, requireRole } from "./auth";
import { adminRateLimit } from "./rate-limit";
import { auditFromReq, getAuditLogs } from "./audit";
import { db } from "./db";
import { users, companies } from "@shared/schema";
import { sql } from "drizzle-orm";

const router = Router();

router.use(adminRateLimit);
router.use(requireAuth);
router.use(requireRole(["owner_admin", "csr_admin"]));

router.get("/overview", async (_req, res) => {
  try {
    const [orgCount] = await db.select({ count: sql<number>`count(*)` }).from(companies);
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);

    res.json({
      organizationsCount: Number(orgCount.count),
      usersCount: Number(userCount.count),
      openTicketsCount: 3,
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    res.status(500).json({ error: "Failed to load overview" });
  }
});

const MOCK_TICKETS = [
  { id: "t-1", subject: "Password reset request", status: "open", orgName: "Demo Construction Co.", createdAt: "2026-02-10" },
  { id: "t-2", subject: "Cannot upload certificate", status: "open", orgName: "Acme Safety Inc.", createdAt: "2026-02-09" },
  { id: "t-3", subject: "Billing question", status: "open", orgName: "BuildRight LLC", createdAt: "2026-02-08" },
];

router.get("/tickets", (_req, res) => {
  res.json(MOCK_TICKETS);
});

router.patch("/tickets/:id", (req, res) => {
  const ticket = MOCK_TICKETS.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const { status, note } = req.body;
  if (status) ticket.status = status;

  auditFromReq(req, "ticket.update", {
    targetType: "ticket",
    targetId: req.params.id,
    metadata: { status, note },
  });

  res.json(ticket);
});

router.get("/audit", requireRole(["owner_admin"]), async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const logs = await getAuditLogs(limit);
    res.json(logs);
  } catch (err) {
    console.error("Audit log read error:", err);
    res.status(500).json({ error: "Failed to load audit logs" });
  }
});

export default router;
