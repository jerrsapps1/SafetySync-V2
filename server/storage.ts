import { db } from "./db";
import { 
  users, 
  companies, 
  locations, 
  employees, 
  trainingRecords,
  orgBillingOverrides,
  billingNotes,
  products,
  orgEntitlements,
  type User,
  type InsertUser,
  type Company,
  type InsertCompany,
  type Location,
  type InsertLocation,
  type Employee,
  type InsertEmployee,
  type TrainingRecord,
  type InsertTrainingRecord,
  type OrgBillingOverride,
  type InsertBillingOverride,
  type BillingNote,
  type InsertBillingNote,
  type Product,
  type InsertProduct,
  type OrgEntitlement,
  type InsertOrgEntitlement,
} from "@shared/schema";
import { eq, and, gte, lte, desc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByStripeCustomerId(stripeCustomerId: string): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, data: Partial<InsertCompany>): Promise<Company>;
  
  getPrimaryAdminForCompany(companyId: string): Promise<User | undefined>;
  
  getLocations(companyId: string): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  
  getEmployees(companyId: string): Promise<Employee[]>;
  getEmployee(id: string, companyId: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, companyId: string, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: string, companyId: string): Promise<void>;
  
  getTrainingRecords(employeeId: string, companyId: string): Promise<TrainingRecord[]>;
  getTrainingRecordsByCompany(companyId: string): Promise<(TrainingRecord & { employee: Employee })[]>;
  getExpiringRecords(companyId: string, daysAhead: number): Promise<(TrainingRecord & { employee: Employee })[]>;
  createTrainingRecord(record: InsertTrainingRecord): Promise<TrainingRecord>;
  updateTrainingRecord(id: string, companyId: string, record: Partial<InsertTrainingRecord>): Promise<TrainingRecord>;
  deleteTrainingRecord(id: string, companyId: string): Promise<void>;

  getActiveOverride(orgId: string): Promise<OrgBillingOverride | undefined>;
  createOverride(data: InsertBillingOverride): Promise<OrgBillingOverride>;
  deleteOverride(orgId: string): Promise<void>;

  getBillingNotes(orgId: string): Promise<BillingNote[]>;
  createBillingNote(data: InsertBillingNote): Promise<BillingNote>;

  getDelinquentCompanies(): Promise<Company[]>;

  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(data: InsertProduct): Promise<Product>;
  getOrgEntitlements(orgId: string): Promise<OrgEntitlement[]>;
  upsertOrgEntitlement(data: InsertOrgEntitlement): Promise<OrgEntitlement>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const result = await db.select().from(companies).where(eq(companies.id, id));
    return result[0];
  }

  async getCompanyByStripeCustomerId(stripeCustomerId: string): Promise<Company | undefined> {
    const result = await db.select().from(companies).where(eq(companies.stripeCustomerId, stripeCustomerId));
    return result[0];
  }

  async getAllCompanies(): Promise<Company[]> {
    return db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async getPrimaryAdminForCompany(companyId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.companyId, companyId)).limit(1);
    return result[0];
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const result = await db.insert(companies).values(company).returning();
    return result[0];
  }

  async updateCompany(id: string, data: Partial<InsertCompany>): Promise<Company> {
    const result = await db.update(companies).set(data).where(eq(companies.id, id)).returning();
    return result[0];
  }

  async getLocations(companyId: string): Promise<Location[]> {
    return db.select().from(locations).where(eq(locations.companyId, companyId));
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const result = await db.insert(locations).values(location).returning();
    return result[0];
  }

  async getEmployees(companyId: string): Promise<Employee[]> {
    return db.select().from(employees).where(eq(employees.companyId, companyId)).orderBy(desc(employees.createdAt));
  }

  async getEmployee(id: string, companyId: string): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(and(eq(employees.id, id), eq(employees.companyId, companyId)));
    return result[0];
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const result = await db.insert(employees).values(employee).returning();
    return result[0];
  }

  async updateEmployee(id: string, companyId: string, employee: Partial<InsertEmployee>): Promise<Employee> {
    const result = await db.update(employees).set(employee).where(and(eq(employees.id, id), eq(employees.companyId, companyId))).returning();
    return result[0];
  }

  async deleteEmployee(id: string, companyId: string): Promise<void> {
    await db.delete(employees).where(and(eq(employees.id, id), eq(employees.companyId, companyId)));
  }

  async getTrainingRecords(employeeId: string, companyId: string): Promise<TrainingRecord[]> {
    const result = await db
      .select({ record: trainingRecords })
      .from(trainingRecords)
      .innerJoin(employees, eq(trainingRecords.employeeId, employees.id))
      .where(and(eq(trainingRecords.employeeId, employeeId), eq(employees.companyId, companyId)))
      .orderBy(desc(trainingRecords.completionDate));
    
    return result.map(r => r.record);
  }

  async getTrainingRecordsByCompany(companyId: string): Promise<(TrainingRecord & { employee: Employee })[]> {
    const result = await db
      .select()
      .from(trainingRecords)
      .innerJoin(employees, eq(trainingRecords.employeeId, employees.id))
      .where(eq(employees.companyId, companyId))
      .orderBy(desc(trainingRecords.createdAt));
    
    return result.map((row: any) => ({
      ...row.training_records,
      employee: row.employees,
    }));
  }

  async getExpiringRecords(companyId: string, daysAhead: number): Promise<(TrainingRecord & { employee: Employee })[]> {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const result = await db
      .select()
      .from(trainingRecords)
      .innerJoin(employees, eq(trainingRecords.employeeId, employees.id))
      .where(
        and(
          eq(employees.companyId, companyId),
          gte(trainingRecords.expirationDate, today),
          lte(trainingRecords.expirationDate, futureDate)
        )
      )
      .orderBy(trainingRecords.expirationDate);
    
    return result.map((row: any) => ({
      ...row.training_records,
      employee: row.employees,
    }));
  }

  async createTrainingRecord(record: InsertTrainingRecord): Promise<TrainingRecord> {
    const result = await db.insert(trainingRecords).values(record).returning();
    return result[0];
  }

  async updateTrainingRecord(id: string, companyId: string, record: Partial<InsertTrainingRecord>): Promise<TrainingRecord> {
    const result = await db
      .update(trainingRecords)
      .set(record)
      .where(
        and(
          eq(trainingRecords.id, id),
          sql`EXISTS (SELECT 1 FROM ${employees} WHERE ${employees.id} = ${trainingRecords.employeeId} AND ${employees.companyId} = ${companyId})`
        )
      )
      .returning();
    return result[0];
  }

  async deleteTrainingRecord(id: string, companyId: string): Promise<void> {
    await db
      .delete(trainingRecords)
      .where(
        and(
          eq(trainingRecords.id, id),
          sql`EXISTS (SELECT 1 FROM ${employees} WHERE ${employees.id} = ${trainingRecords.employeeId} AND ${employees.companyId} = ${companyId})`
        )
      );
  }

  async getActiveOverride(orgId: string): Promise<OrgBillingOverride | undefined> {
    const result = await db
      .select()
      .from(orgBillingOverrides)
      .where(eq(orgBillingOverrides.orgId, orgId))
      .orderBy(desc(orgBillingOverrides.createdAt))
      .limit(1);
    return result[0];
  }

  async createOverride(data: InsertBillingOverride): Promise<OrgBillingOverride> {
    await db.delete(orgBillingOverrides).where(eq(orgBillingOverrides.orgId, data.orgId));
    const result = await db.insert(orgBillingOverrides).values(data).returning();
    return result[0];
  }

  async deleteOverride(orgId: string): Promise<void> {
    await db.delete(orgBillingOverrides).where(eq(orgBillingOverrides.orgId, orgId));
  }

  async getBillingNotes(orgId: string): Promise<BillingNote[]> {
    return db
      .select()
      .from(billingNotes)
      .where(eq(billingNotes.orgId, orgId))
      .orderBy(desc(billingNotes.createdAt));
  }

  async createBillingNote(data: InsertBillingNote): Promise<BillingNote> {
    const result = await db.insert(billingNotes).values(data).returning();
    return result[0];
  }

  async getDelinquentCompanies(): Promise<Company[]> {
    return db
      .select()
      .from(companies)
      .where(inArray(companies.billingStatus, ["past_due", "unpaid", "canceled"]));
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(products.name);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(data).returning();
    return result[0];
  }

  async getOrgEntitlements(orgId: string): Promise<OrgEntitlement[]> {
    return db
      .select()
      .from(orgEntitlements)
      .where(eq(orgEntitlements.orgId, orgId))
      .orderBy(orgEntitlements.updatedAt);
  }

  async upsertOrgEntitlement(data: InsertOrgEntitlement): Promise<OrgEntitlement> {
    const existing = await db
      .select()
      .from(orgEntitlements)
      .where(
        and(
          eq(orgEntitlements.orgId, data.orgId),
          eq(orgEntitlements.productId, data.productId),
        ),
      );

    if (existing.length > 0) {
      const result = await db
        .update(orgEntitlements)
        .set({
          enabled: data.enabled,
          plan: data.plan,
          billingSource: data.billingSource,
          notes: data.notes,
          endsAt: data.endsAt,
          updatedByUserId: data.updatedByUserId,
          updatedAt: new Date(),
        })
        .where(eq(orgEntitlements.id, existing[0].id))
        .returning();
      return result[0];
    }

    const result = await db.insert(orgEntitlements).values(data).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
