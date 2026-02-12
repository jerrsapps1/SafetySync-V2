import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateToken, hashPassword, comparePassword, requireAuth, requireRole } from "./auth";
import { insertUserSchema, insertCompanySchema, insertLocationSchema, insertEmployeeSchema, insertTrainingRecordSchema } from "@shared/schema";
import { authRateLimit } from "./rate-limit";
import adminRoutes from "./admin-routes";
import type { UserRole } from "@shared/schema";
import { isStripeConfigured, getPlansFromEnv, getOrCreateStripeCustomer, createCheckoutSession, createPortalSession, getSubscriptionStatus } from "./stripe";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.use("/api/admin", adminRoutes);

  app.post("/api/auth/create-account", authRateLimit, async (req, res) => {
    try {
      const { organizationName, fullName, email, password, country, state, phone } = req.body;

      if (!organizationName || !fullName || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }

      const hashedPassword = await hashPassword(password);

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      const company = await storage.createCompany({
        name: organizationName,
        plan: "trial",
        billingStatus: "trial",
        trialEndDate,
        onboardingCompleted: "false",
        country: country || "US",
        state: state || null,
        phone: phone || null,
      });

      const username = email.split("@")[0] + "-" + Date.now().toString(36);
      const user = await storage.createUser({
        username,
        fullName,
        email,
        password: hashedPassword,
        role: "owner_admin",
        companyId: company.id,
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: "owner_admin" as UserRole,
        orgId: company.id,
      });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        },
        company: {
          id: company.id,
          name: company.name,
          plan: company.plan,
          billingStatus: company.billingStatus,
          trialEndDate: company.trialEndDate,
        },
      });
    } catch (error: any) {
      console.error("Create account error:", error);
      res.status(500).json({ error: "Account creation failed" });
    }
  });

  app.patch("/api/companies/:id/onboarding", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (companyId !== req.params.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const updated = await storage.updateCompany(companyId, { onboardingCompleted: "true" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update onboarding status" });
    }
  });

  app.post("/api/auth/register", authRateLimit, async (req, res) => {
    try {
      const { username, email, password, companyName } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }

      const hashedPassword = await hashPassword(password);
      
      let companyId = null;
      if (companyName) {
        const company = await storage.createCompany({ name: companyName });
        companyId = company.id;
      }

      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        companyId,
      });

      const token = generateToken({ 
        userId: user.id, 
        email: user.email,
        role: (user.role as UserRole) || "workspace_user",
        orgId: user.companyId,
      });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", authRateLimit, async (req, res) => {
    try {
      const { email, password } = req.body;

      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.getUserByUsername(email);
      }
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: (user.role as UserRole) || "workspace_user",
        orgId: user.companyId,
      });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/whoami", requireAuth, async (req, res) => {
    const user = (req as any).user;
    res.json({
      userId: user.id,
      role: user.role,
      orgId: user.orgId,
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.get("/api/companies/:id", requireAuth, async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to get company" });
    }
  });

  app.get("/api/locations", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }
      const locations = await storage.getLocations(companyId);
      res.json(locations);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to get locations" });
    }
  });

  app.post("/api/locations", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }

      const result = insertLocationSchema.safeParse({ ...req.body, companyId });
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }

      const location = await storage.createLocation(result.data);
      res.json(location);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create location" });
    }
  });

  app.get("/api/employees", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }
      const employees = await storage.getEmployees(companyId);
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to get employees" });
    }
  });

  app.get("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }

      const employee = await storage.getEmployee(req.params.id, companyId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to get employee" });
    }
  });

  app.post("/api/employees", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }

      const result = insertEmployeeSchema.safeParse({ ...req.body, companyId });
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }

      const employee = await storage.createEmployee(result.data);
      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  app.patch("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }

      const employee = await storage.updateEmployee(req.params.id, companyId, req.body);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found or unauthorized" });
      }
      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }

      await storage.deleteEmployee(req.params.id, companyId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  app.get("/api/training-records", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }
      
      const records = await storage.getTrainingRecordsByCompany(companyId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to get training records" });
    }
  });

  app.get("/api/training-records/expiring", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }
      
      const daysAhead = parseInt(req.query.days as string) || 30;
      const records = await storage.getExpiringRecords(companyId, daysAhead);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to get expiring records" });
    }
  });

  app.get("/api/employees/:employeeId/training-records", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }

      const records = await storage.getTrainingRecords(req.params.employeeId, companyId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to get training records" });
    }
  });

  app.post("/api/training-records", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }

      const result = insertTrainingRecordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }

      const employee = await storage.getEmployee(result.data.employeeId, companyId);
      if (!employee) {
        return res.status(403).json({ error: "Cannot create training record for employee outside your company" });
      }

      const record = await storage.createTrainingRecord(result.data);
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create training record" });
    }
  });

  app.patch("/api/training-records/:id", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }

      const record = await storage.updateTrainingRecord(req.params.id, companyId, req.body);
      if (!record) {
        return res.status(404).json({ error: "Training record not found or unauthorized" });
      }
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update training record" });
    }
  });

  app.delete("/api/training-records/:id", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }

      await storage.deleteTrainingRecord(req.params.id, companyId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete training record" });
    }
  });

  app.get("/api/billing/summary", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }

      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      const employeesList = await storage.getEmployees(companyId);
      const records = await storage.getTrainingRecordsByCompany(companyId);

      let plan = company.plan || "trial";
      let billingStatus = company.billingStatus || "trial";
      let trialEndsAt = company.trialEndDate;

      if (company.stripeSubscriptionId && isStripeConfigured()) {
        try {
          const subStatus = await getSubscriptionStatus(company.stripeSubscriptionId);
          billingStatus = subStatus.status;
          if (subStatus.planKey) {
            plan = subStatus.planKey;
          }
          if (billingStatus === "active" || billingStatus === "past_due") {
            if (company.plan !== plan || company.billingStatus !== billingStatus) {
              await storage.updateCompany(companyId, { plan, billingStatus });
            }
          }
        } catch (err) {
          console.error("Failed to fetch Stripe subscription status:", err);
        }
      }

      res.json({
        plan,
        billingStatus,
        trialEndsAt,
        employeesCount: employeesList.length,
        trainingRecordsCount: records.length,
        certificatesCount: 0,
        invoices: [],
      });
    } catch (error: any) {
      console.error("Billing summary error:", error);
      res.status(500).json({ error: "Failed to get billing summary" });
    }
  });

  app.post("/api/billing/checkout-complete", requireAuth, async (req, res) => {
    try {
      if (!isStripeConfigured()) {
        return res.status(501).json({ error: "Stripe is not configured." });
      }

      const { sessionId } = req.body;
      if (!sessionId || typeof sessionId !== "string") {
        return res.status(400).json({ error: "Missing sessionId" });
      }

      const companyId = (req as any).user.orgId;
      if (!companyId) {
        return res.status(403).json({ error: "No company associated with user" });
      }

      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      const { getCheckoutSession: fetchSession } = await import("./stripe");
      const session = await fetchSession(sessionId);

      if (session.metadata?.org_id !== companyId) {
        return res.status(403).json({ error: "Session does not belong to this organization" });
      }

      const subscriptionId = typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription as any)?.id;

      if (!subscriptionId) {
        return res.json({ status: "pending" });
      }

      const planKey = session.metadata?.plan_key;
      if (!planKey) {
        return res.status(400).json({ error: "No plan_key in session metadata" });
      }

      if (subscriptionId !== company.stripeSubscriptionId) {
        await storage.updateCompany(companyId, {
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: company.stripeCustomerId || (typeof session.customer === "string" ? session.customer : undefined),
          plan: planKey,
          billingStatus: "active",
        });
      }

      res.json({ status: "activated", plan: planKey });
    } catch (error: any) {
      console.error("Checkout complete error:", error);
      res.status(500).json({ error: "Failed to process checkout completion" });
    }
  });

  const fallbackPlans = [
    {
      planKey: "pro",
      name: "Pro",
      priceId: "",
      interval: "month",
      currency: "usd",
      displayPrice: "",
      features: [
        "Up to 100 employees",
        "Unlimited training records",
        "Compliance dashboard",
        "Priority support",
      ],
    },
    {
      planKey: "enterprise",
      name: "Enterprise",
      priceId: "",
      interval: "month",
      currency: "usd",
      displayPrice: "",
      features: [
        "Unlimited employees",
        "Unlimited training records",
        "Advanced analytics",
        "Dedicated support",
        "Custom integrations",
      ],
    },
  ];

  app.get("/api/billing/plans", requireAuth, async (req, res) => {
    try {
      if (!isStripeConfigured()) {
        return res.json(fallbackPlans);
      }

      const plans = getPlansFromEnv();
      res.json(plans.length > 0 ? plans : fallbackPlans);
    } catch (error: any) {
      console.error("Billing plans error:", error);
      res.status(500).json({ error: "Failed to get billing plans" });
    }
  });

  app.post("/api/billing/checkout", requireAuth, async (req, res) => {
    try {
      if (!isStripeConfigured()) {
        return res.status(501).json({
          error: "Stripe is not configured. Please contact support.",
        });
      }

      const { planKey, successUrl, cancelUrl } = req.body;
      if (!planKey || !successUrl || !cancelUrl) {
        return res.status(400).json({ error: "Missing planKey, successUrl, or cancelUrl" });
      }

      const plans = getPlansFromEnv();
      const plan = plans.find((p) => p.planKey === planKey);
      if (!plan) {
        return res.status(400).json({ error: `Unknown plan: ${planKey}` });
      }

      const companyId = (req as any).user.orgId;
      const userEmail = (req as any).user.email;
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      const customerId = await getOrCreateStripeCustomer(
        companyId,
        company.stripeCustomerId,
        company.name,
        userEmail,
      );

      if (!company.stripeCustomerId) {
        await storage.updateCompany(companyId, { stripeCustomerId: customerId });
      }

      const baseUrl = process.env.APP_URL || req.headers.origin || `${req.protocol}://${req.headers.host}`;
      const fullSuccessUrl = successUrl.startsWith("http") ? successUrl : `${baseUrl}${successUrl}`;
      const fullCancelUrl = cancelUrl.startsWith("http") ? cancelUrl : `${baseUrl}${cancelUrl}`;

      const url = await createCheckoutSession(
        customerId,
        plan.priceId,
        fullSuccessUrl,
        fullCancelUrl,
        { orgId: companyId, planKey: plan.planKey },
      );
      res.json({ url });
    } catch (error: any) {
      console.error("Billing checkout error:", error);
      if (error.message === "STRIPE_NOT_CONFIGURED") {
        return res.status(501).json({ error: "Stripe is not configured." });
      }
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/billing/portal", requireAuth, async (req, res) => {
    try {
      if (!isStripeConfigured()) {
        return res.status(501).json({
          error: "Billing portal is not configured. Stripe integration is not yet set up.",
        });
      }

      const companyId = (req as any).user.orgId;
      const userEmail = (req as any).user.email;
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      const customerId = await getOrCreateStripeCustomer(
        companyId,
        company.stripeCustomerId,
        company.name,
        userEmail,
      );

      if (!company.stripeCustomerId) {
        await storage.updateCompany(companyId, { stripeCustomerId: customerId });
      }

      const { returnUrl } = req.body;
      const baseUrl = process.env.APP_URL || req.headers.origin || `${req.protocol}://${req.headers.host}`;
      const fullReturnUrl = returnUrl?.startsWith("http") ? returnUrl : `${baseUrl}${returnUrl || "/billing"}`;

      const url = await createPortalSession(customerId, fullReturnUrl);
      res.json({ url });
    } catch (error: any) {
      console.error("Billing portal error:", error);
      if (error.message === "STRIPE_NOT_CONFIGURED") {
        return res.status(501).json({ error: "Stripe is not configured." });
      }
      res.status(500).json({ error: "Failed to create billing portal session" });
    }
  });

  if (process.env.NODE_ENV === "development") {
    app.post("/api/dev/seed", async (req, res) => {
      try {
        const { seedDatabase } = await import("./seed");
        await seedDatabase();
        res.json({ success: true, message: "Database seeded successfully" });
      } catch (error: any) {
        console.error("Seed error:", error);
        res.status(500).json({ error: "Seed failed", details: error.message });
      }
    });
  }

  const httpServer = createServer(app);

  return httpServer;
}
