import { users, caseTypes, type User, type InsertUser, type CaseType, type InsertCaseType } from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  getCaseType(id: number): Promise<CaseType | undefined>;
  getAllCaseTypes(): Promise<CaseType[]>;
  createCaseType(caseType: InsertCaseType): Promise<CaseType>;
  updateCaseType(id: number, caseType: Partial<InsertCaseType>): Promise<CaseType>;
  deleteCaseType(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCaseType(id: number): Promise<CaseType | undefined> {
    const [caseType] = await db
      .select()
      .from(caseTypes)
      .where(eq(caseTypes.id, id));
    return caseType || undefined;
  }

  async getAllCaseTypes(): Promise<CaseType[]> {
    return await db
      .select()
      .from(caseTypes)
      .where(eq(caseTypes.isActive, true))
      .orderBy(asc(caseTypes.displayOrder), asc(caseTypes.label));
  }

  async createCaseType(insertCaseType: InsertCaseType): Promise<CaseType> {
    const [caseType] = await db
      .insert(caseTypes)
      .values(insertCaseType)
      .returning();
    return caseType;
  }

  async updateCaseType(id: number, updates: Partial<InsertCaseType>): Promise<CaseType> {
    const [caseType] = await db
      .update(caseTypes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(caseTypes.id, id))
      .returning();
    return caseType;
  }

  async deleteCaseType(id: number): Promise<void> {
    await db.delete(caseTypes).where(eq(caseTypes.id, id));
  }
}

export const storage = new DatabaseStorage();
