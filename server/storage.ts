import { users, caseTypes, legalRequests, smtpSettings, emailHistory, type User, type InsertUser, type CaseType, type InsertCaseType, type LegalRequest, type InsertLegalRequest, type SmtpSettings, type InsertSmtpSettings, type EmailHistory, type InsertEmailHistory } from "@shared/schema";
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
  // SMTP Settings
  getSmtpSettings(): Promise<SmtpSettings | undefined>;
  createSmtpSettings(smtpSettings: InsertSmtpSettings): Promise<SmtpSettings>;
  updateSmtpSettings(id: number, smtpSettings: Partial<InsertSmtpSettings>): Promise<SmtpSettings>;
  // Email History
  createEmailHistory(emailHistory: InsertEmailHistory): Promise<EmailHistory>;
  getAllEmailHistory(): Promise<EmailHistory[]>;
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

  // SMTP Settings operations
  async getSmtpSettings(): Promise<SmtpSettings | undefined> {
    const [settings] = await db
      .select()
      .from(smtpSettings)
      .where(eq(smtpSettings.isActive, true));
    return settings || undefined;
  }

  async createSmtpSettings(insertSmtpSettings: InsertSmtpSettings): Promise<SmtpSettings> {
    const [settings] = await db
      .insert(smtpSettings)
      .values(insertSmtpSettings)
      .returning();
    return settings;
  }

  async updateSmtpSettings(id: number, updates: Partial<InsertSmtpSettings>): Promise<SmtpSettings> {
    const [settings] = await db
      .update(smtpSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(smtpSettings.id, id))
      .returning();
    return settings;
  }

  // Email History operations
  async createEmailHistory(insertEmailHistory: InsertEmailHistory): Promise<EmailHistory> {
    const [history] = await db
      .insert(emailHistory)
      .values(insertEmailHistory)
      .returning();
    return history;
  }

  async getAllEmailHistory(): Promise<EmailHistory[]> {
    return await db
      .select()
      .from(emailHistory)
      .orderBy(asc(emailHistory.timestamp));
  }
}

export const storage = new DatabaseStorage();
