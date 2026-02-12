import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateToken, hashPassword, comparePassword, requireAuth, requireRole } from "./auth";
import { insertUserSchema, insertCompanySchema, insertLocationSchema, insertEmployeeSchema, insertTrainingRecordSchema } from "@shared/schema";
import { authRateLimit } from "./rate-limit";
import adminRoutes from "./admin-routes";
import type { UserRole } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.use("/api/admin", adminRoutes);

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
