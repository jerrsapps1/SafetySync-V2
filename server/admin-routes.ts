import { Router } from "express";
import { requireAuth, requireRole } from "./auth";
import { adminRateLimit } from "./rate-limit";
import { auditFromReq, getAuditLogs } from "./audit";
import { db } from "./db";
import { users, companies, OVERRIDE_TYPES } from "@shared/schema";
import { sql } from "drizzle-orm";
import { storage } from "./storage";
import { isStripeConfigured, getSubscriptionStatus, listCustomerInvoices, createPortalSession } from "./stripe";
import { z } from "zod";

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

    const override = await storage.getActiveOverride(orgId);

    res.json({
      orgId: company.id,
      orgName: company.name,
      plan: company.plan || "trial",
      billingStatus: company.billingStatus || "trial",
      trialEndsAt: company.trialEndDate,
      subscriptionStatus,
      currentPeriodEnd,
      invoices,
      override: override
        ? {
            id: override.id,
            overrideType: override.overrideType,
            discountPercent: override.discountPercent,
            fixedPriceCents: override.fixedPriceCents,
            note: override.note,
            startsAt: override.startsAt,
            endsAt: override.endsAt,
            createdAt: override.createdAt,
          }
        : null,
    });
  } catch (err) {
    console.error("Admin org billing error:", err);
    res.status(500).json({ error: "Failed to load organization billing" });
  }
});

const overrideBodySchema = z.object({
  overrideType: z.enum(["discount_percent", "fixed_price", "comped"]),
  discountPercent: z.number().min(1).max(100).optional().nullable(),
  fixedPriceCents: z.number().min(0).optional().nullable(),
  note: z.string().min(1, "Note is required"),
  endsAt: z.string().optional().nullable(),
});

router.post(
  "/organizations/:orgId/billing-override",
  requireRole(["owner_admin"]),
  async (req, res) => {
    try {
      const { orgId } = req.params;
      const company = await storage.getCompany(orgId);
      if (!company) {
        return res.status(404).json({ error: "Organization not found" });
      }

      const parsed = overrideBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
      }

      const { overrideType, discountPercent, fixedPriceCents, note, endsAt } = parsed.data;
      const user = (req as any).user;

      if (overrideType === "discount_percent" && !discountPercent) {
        return res.status(400).json({ error: "discountPercent is required for discount_percent type" });
      }
      if (overrideType === "fixed_price" && (fixedPriceCents == null || fixedPriceCents === undefined)) {
        return res.status(400).json({ error: "fixedPriceCents is required for fixed_price type" });
      }

      const override = await storage.createOverride({
        orgId,
        overrideType,
        discountPercent: overrideType === "discount_percent" ? (discountPercent ?? null) : null,
        fixedPriceCents: overrideType === "fixed_price" ? (fixedPriceCents ?? null) : null,
        note,
        startsAt: new Date(),
        endsAt: endsAt ? new Date(endsAt) : null,
        createdByUserId: user.id,
      });

      auditFromReq(req, "billing_override.create", {
        targetType: "organization",
        targetId: orgId,
        metadata: { overrideType, discountPercent, fixedPriceCents, note, endsAt },
      });

      res.json(override);
    } catch (err) {
      console.error("Create billing override error:", err);
      res.status(500).json({ error: "Failed to create billing override" });
    }
  },
);

router.delete(
  "/organizations/:orgId/billing-override",
  requireRole(["owner_admin"]),
  async (req, res) => {
    try {
      const { orgId } = req.params;
      const company = await storage.getCompany(orgId);
      if (!company) {
        return res.status(404).json({ error: "Organization not found" });
      }

      await storage.deleteOverride(orgId);

      auditFromReq(req, "billing_override.delete", {
        targetType: "organization",
        targetId: orgId,
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Delete billing override error:", err);
      res.status(500).json({ error: "Failed to remove billing override" });
    }
  },
);

router.get("/billing/delinquent", async (_req, res) => {
  try {
    const orgs = await storage.getDelinquentCompanies();

    const result = await Promise.all(
      orgs.map(async (org) => {
        const admin = await storage.getPrimaryAdminForCompany(org.id);
        let lastInvoice: { date: string; status: string } | null = null;

        if (isStripeConfigured() && org.stripeCustomerId) {
          try {
            const invoices = await listCustomerInvoices(org.stripeCustomerId, 1);
            if (invoices.length > 0) {
              lastInvoice = { date: invoices[0].date, status: invoices[0].status };
            }
          } catch (_e) {}
        }

        return {
          orgId: org.id,
          orgName: org.name,
          primaryAdminEmail: admin?.email || null,
          plan: org.plan || "trial",
          billingStatus: org.billingStatus || "trial",
          lastInvoice,
        };
      }),
    );

    res.json(result);
  } catch (err) {
    console.error("Delinquent orgs error:", err);
    res.status(500).json({ error: "Failed to load delinquent organizations" });
  }
});

router.post("/organizations/:orgId/portal-link", async (req, res) => {
  try {
    const { orgId } = req.params;
    const company = await storage.getCompany(orgId);
    if (!company) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (!isStripeConfigured()) {
      return res.status(400).json({ error: "Stripe is not configured" });
    }
    if (!company.stripeCustomerId) {
      return res.status(400).json({ error: "Organization has no Stripe customer" });
    }

    const appUrl = process.env.APP_URL || `https://${req.headers.host}`;
    const url = await createPortalSession(company.stripeCustomerId, `${appUrl}/admin/billing/${orgId}`);

    auditFromReq(req, "billing_portal_link.generate", {
      targetType: "organization",
      targetId: orgId,
    });

    res.json({ url });
  } catch (err) {
    console.error("Generate portal link error:", err);
    res.status(500).json({ error: "Failed to generate portal link" });
  }
});

router.get("/organizations/:orgId/billing-notes", async (req, res) => {
  try {
    const { orgId } = req.params;
    const company = await storage.getCompany(orgId);
    if (!company) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const notes = await storage.getBillingNotes(orgId);
    res.json(notes);
  } catch (err) {
    console.error("Get billing notes error:", err);
    res.status(500).json({ error: "Failed to load billing notes" });
  }
});

const noteBodySchema = z.object({
  note: z.string().min(1, "Note is required"),
});

router.post("/organizations/:orgId/billing-notes", async (req, res) => {
  try {
    const { orgId } = req.params;
    const company = await storage.getCompany(orgId);
    if (!company) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const parsed = noteBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    }

    const user = (req as any).user;
    const billingNote = await storage.createBillingNote({
      orgId,
      note: parsed.data.note,
      authorUserId: user.id,
    });

    auditFromReq(req, "billing_note.create", {
      targetType: "organization",
      targetId: orgId,
      metadata: { noteId: billingNote.id },
    });

    res.json(billingNote);
  } catch (err) {
    console.error("Create billing note error:", err);
    res.status(500).json({ error: "Failed to create billing note" });
  }
});

export default router;
