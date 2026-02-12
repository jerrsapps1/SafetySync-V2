import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, date, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const USER_ROLES = ["workspace_user", "owner_admin", "csr_admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  fullName: text("full_name"),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("workspace_user"),
  companyId: varchar("company_id").references(() => companies.id),
});

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("trial"),
  billingStatus: text("billing_status").notNull().default("trial"),
  trialEndDate: timestamp("trial_end_date"),
  onboardingCompleted: text("onboarding_completed").notNull().default("false"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  country: text("country").default("US"),
  state: text("state"),
  phone: text("phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
});

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  locationId: varchar("location_id").references(() => locations.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  role: text("role").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const trainingRecords = pgTable("training_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  trainingType: text("training_type").notNull(),
  oshaStandard: text("osha_standard").notNull(),
  completionDate: date("completion_date").notNull(),
  expirationDate: date("expiration_date"),
  certificateUrl: text("certificate_url"),
  provider: text("provider"),
  status: text("status").notNull().default("valid"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorUserId: varchar("actor_user_id").notNull(),
  actorRole: text("actor_role").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const OVERRIDE_TYPES = ["none", "discount_percent", "fixed_price", "comped"] as const;
export type OverrideType = (typeof OVERRIDE_TYPES)[number];

export const orgBillingOverrides = pgTable("org_billing_overrides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => companies.id),
  overrideType: text("override_type").notNull().default("none"),
  discountPercent: integer("discount_percent"),
  fixedPriceCents: integer("fixed_price_cents"),
  note: text("note").notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdByUserId: varchar("created_by_user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const billingNotes = pgTable("billing_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => companies.id),
  note: text("note").notNull(),
  authorUserId: varchar("author_user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true });
export const insertTrainingRecordSchema = createInsertSchema(trainingRecords).omit({ id: true, createdAt: true });
export const insertAuditLogSchema = createInsertSchema(adminAuditLogs).omit({ id: true, createdAt: true });
export const insertBillingOverrideSchema = createInsertSchema(orgBillingOverrides).omit({ id: true, createdAt: true });
export const insertBillingNoteSchema = createInsertSchema(billingNotes).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertTrainingRecord = z.infer<typeof insertTrainingRecordSchema>;
export type TrainingRecord = typeof trainingRecords.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type InsertBillingOverride = z.infer<typeof insertBillingOverrideSchema>;
export type OrgBillingOverride = typeof orgBillingOverrides.$inferSelect;
export type InsertBillingNote = z.infer<typeof insertBillingNoteSchema>;
export type BillingNote = typeof billingNotes.$inferSelect;
