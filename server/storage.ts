import { users, caseTypes, legalRequests, type User, type InsertUser, type CaseType, type InsertCaseType, type LegalRequest, type InsertLegalRequest } from "@shared/schema";
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
  createLegalRequest(legalRequest: InsertLegalRequest): Promise<LegalRequest>;
  getLegalRequest(id: number): Promise<LegalRequest | undefined>;
  getLegalRequestByNumber(requestNumber: string): Promise<LegalRequest | undefined>;
  getAllLegalRequests(): Promise<LegalRequest[]>;
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

  // Legal Request operations
  async createLegalRequest(insertLegalRequest: InsertLegalRequest): Promise<LegalRequest> {
    const [legalRequest] = await db
      .insert(legalRequests)
      .values(insertLegalRequest)
      .returning();
    return legalRequest;
  }

  async getLegalRequest(id: number): Promise<LegalRequest | undefined> {
    const [legalRequest] = await db
      .select()
      .from(legalRequests)
      .where(eq(legalRequests.id, id));
    return legalRequest || undefined;
  }

  async getLegalRequestByNumber(requestNumber: string): Promise<LegalRequest | undefined> {
    const [legalRequest] = await db
      .select()
      .from(legalRequests)
      .where(eq(legalRequests.requestNumber, requestNumber));
    return legalRequest || undefined;
  }

  async getAllLegalRequests(): Promise<LegalRequest[]> {
    return await db
      .select()
      .from(legalRequests)
      .orderBy(asc(legalRequests.createdAt));
  }
}

export const storage = new DatabaseStorage();
