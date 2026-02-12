import { Router } from "express";
import { requireAuth, requireRole } from "./auth";
import { adminRateLimit } from "./rate-limit";
import { auditFromReq, getAuditLogs } from "./audit";
import { db } from "./db";
import { users, companies } from "@shared/schema";
import { sql } from "drizzle-orm";
import { storage } from "./storage";
import { isStripeConfigured, getSubscriptionStatus, listCustomerInvoices } from "./stripe";

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

function maskId(id: string | null | undefined): string | null {
  if (!id) return null;
  if (id.length <= 8) return "***" + id.slice(-4);
  return id.slice(0, 4) + "***" + id.slice(-4);
}

router.get("/organizations", async (_req, res) => {
  try {
    const orgs = await storage.getAllCompanies();

    const result = await Promise.all(
      orgs.map(async (org) => {
        const admin = await storage.getPrimaryAdminForCompany(org.id);
        return {
          orgId: org.id,
          orgName: org.name,
          primaryAdminEmail: admin?.email || null,
          plan: org.plan || "trial",
          billingStatus: org.billingStatus || "trial",
          trialEndsAt: org.trialEndDate,
          stripeCustomerId: maskId(org.stripeCustomerId),
          stripeSubscriptionId: maskId(org.stripeSubscriptionId),
          createdAt: org.createdAt,
        };
      }),
    );

    res.json(result);
  } catch (err) {
    console.error("Admin organizations error:", err);
    res.status(500).json({ error: "Failed to load organizations" });
  }
});

router.get("/organizations/:orgId/billing", async (req, res) => {
  try {
    const { orgId } = req.params;
    const company = await storage.getCompany(orgId);
    if (!company) {
      return res.status(404).json({ error: "Organization not found" });
    }

    let subscriptionStatus: string | null = null;
    let currentPeriodEnd: string | null = null;
    let invoices: { id: string; date: string; amount: string; status: string; hostedUrl: string | null }[] = [];

    if (isStripeConfigured()) {
      if (company.stripeSubscriptionId) {
        try {
          const subData = await getSubscriptionStatus(company.stripeSubscriptionId);
          subscriptionStatus = subData.status;
          currentPeriodEnd = subData.currentPeriodEnd?.toISOString() || null;
        } catch (err) {
          console.error("Failed to fetch subscription for org:", orgId, err);
        }
      }

      if (company.stripeCustomerId) {
        try {
          invoices = await listCustomerInvoices(company.stripeCustomerId, 10);
        } catch (err) {
          console.error("Failed to fetch invoices for org:", orgId, err);
        }
      }
    }

    res.json({
      orgId: company.id,
      orgName: company.name,
      plan: company.plan || "trial",
      billingStatus: company.billingStatus || "trial",
      trialEndsAt: company.trialEndDate,
      subscriptionStatus,
      currentPeriodEnd,
      invoices,
    });
  } catch (err) {
    console.error("Admin org billing error:", err);
    res.status(500).json({ error: "Failed to load organization billing" });
  }
});

export default router;
