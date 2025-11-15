import { db } from "./db";
import { 
  users, 
  companies, 
  locations, 
  employees, 
  trainingRecords,
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
} from "@shared/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  
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

  async createCompany(company: InsertCompany): Promise<Company> {
    const result = await db.insert(companies).values(company).returning();
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
}

export const storage = new DbStorage();
