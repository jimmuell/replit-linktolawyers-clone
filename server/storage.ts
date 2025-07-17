import { users, caseTypes, legalRequests, smtpSettings, emailHistory, attorneys, attorneyFeeSchedule, requestAttorneyAssignments, type User, type InsertUser, type CaseType, type InsertCaseType, type LegalRequest, type InsertLegalRequest, type SmtpSettings, type InsertSmtpSettings, type EmailHistory, type InsertEmailHistory, type Attorney, type InsertAttorney, type AttorneyFeeSchedule, type InsertAttorneyFeeSchedule, type SelectRequestAttorneyAssignment, type InsertRequestAttorneyAssignment } from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc, and } from "drizzle-orm";

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
  updateLegalRequest(id: number, updates: Partial<InsertLegalRequest>): Promise<LegalRequest>;
  deleteLegalRequest(id: number): Promise<void>;
  // SMTP Settings
  getSmtpSettings(): Promise<SmtpSettings | undefined>;
  createSmtpSettings(smtpSettings: InsertSmtpSettings): Promise<SmtpSettings>;
  updateSmtpSettings(id: number, smtpSettings: Partial<InsertSmtpSettings>): Promise<SmtpSettings>;
  // Email History
  createEmailHistory(emailHistory: InsertEmailHistory): Promise<EmailHistory>;
  getAllEmailHistory(): Promise<EmailHistory[]>;
  // Attorney Management
  createAttorney(attorney: InsertAttorney): Promise<Attorney>;
  getAttorney(id: number): Promise<Attorney | undefined>;
  getAllAttorneys(): Promise<Attorney[]>;
  updateAttorney(id: number, updates: Partial<InsertAttorney>): Promise<Attorney>;
  deleteAttorney(id: number): Promise<void>;
  // Attorney Fee Schedule
  createAttorneyFeeSchedule(feeSchedule: InsertAttorneyFeeSchedule): Promise<AttorneyFeeSchedule>;
  getAttorneyFeeSchedule(id: number): Promise<AttorneyFeeSchedule | undefined>;
  getAttorneyFeeScheduleByAttorney(attorneyId: number): Promise<AttorneyFeeSchedule[]>;
  getAttorneyFeeScheduleByAttorneyAndCaseType(attorneyId: number, caseTypeId: number): Promise<AttorneyFeeSchedule | undefined>;
  getAllAttorneyFeeSchedules(): Promise<AttorneyFeeSchedule[]>;
  updateAttorneyFeeSchedule(id: number, updates: Partial<InsertAttorneyFeeSchedule>): Promise<AttorneyFeeSchedule>;
  deleteAttorneyFeeSchedule(id: number): Promise<void>;
  bulkCreateAttorneyFeeSchedules(feeSchedules: InsertAttorneyFeeSchedule[]): Promise<AttorneyFeeSchedule[]>;
  // Request Attorney Assignments
  createRequestAttorneyAssignment(assignment: InsertRequestAttorneyAssignment): Promise<SelectRequestAttorneyAssignment>;
  getRequestAttorneyAssignments(requestId: number): Promise<SelectRequestAttorneyAssignment[]>;
  getAttorneyAssignments(attorneyId: number): Promise<SelectRequestAttorneyAssignment[]>;
  updateRequestAttorneyAssignment(id: number, updates: Partial<InsertRequestAttorneyAssignment>): Promise<SelectRequestAttorneyAssignment>;
  deleteRequestAttorneyAssignment(id: number): Promise<void>;
  bulkCreateRequestAttorneyAssignments(assignments: InsertRequestAttorneyAssignment[]): Promise<SelectRequestAttorneyAssignment[]>;
  updateRequestAttorneyAssignments(requestId: number, attorneyIds: number[]): Promise<SelectRequestAttorneyAssignment[]>;
  updateRequestAttorneyAssignmentEmail(assignmentId: number, emailSent: boolean): Promise<SelectRequestAttorneyAssignment>;
  getAttorneysByCaseType(caseTypeValue: string): Promise<Array<Attorney & { fee?: number; feeType?: string }>>;
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
      .orderBy(desc(legalRequests.createdAt));
  }

  async updateLegalRequest(id: number, updates: Partial<InsertLegalRequest>): Promise<LegalRequest> {
    const [legalRequest] = await db
      .update(legalRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(legalRequests.id, id))
      .returning();
    return legalRequest;
  }

  async deleteLegalRequest(id: number): Promise<void> {
    await db.delete(legalRequests).where(eq(legalRequests.id, id));
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

  // Attorney Management operations
  async createAttorney(insertAttorney: InsertAttorney): Promise<Attorney> {
    const [attorney] = await db
      .insert(attorneys)
      .values(insertAttorney)
      .returning();
    return attorney;
  }

  async getAttorney(id: number): Promise<Attorney | undefined> {
    const [attorney] = await db
      .select()
      .from(attorneys)
      .where(eq(attorneys.id, id));
    return attorney || undefined;
  }

  async getAllAttorneys(): Promise<Attorney[]> {
    return await db
      .select()
      .from(attorneys)
      .orderBy(asc(attorneys.lastName), asc(attorneys.firstName));
  }

  async updateAttorney(id: number, updates: Partial<InsertAttorney>): Promise<Attorney> {
    const [attorney] = await db
      .update(attorneys)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(attorneys.id, id))
      .returning();
    return attorney;
  }

  async deleteAttorney(id: number): Promise<void> {
    await db.delete(attorneys).where(eq(attorneys.id, id));
  }

  // Attorney Fee Schedule operations
  async createAttorneyFeeSchedule(insertFeeSchedule: InsertAttorneyFeeSchedule): Promise<AttorneyFeeSchedule> {
    const [feeSchedule] = await db
      .insert(attorneyFeeSchedule)
      .values(insertFeeSchedule)
      .returning();
    return feeSchedule;
  }

  async getAttorneyFeeSchedule(id: number): Promise<AttorneyFeeSchedule | undefined> {
    const [feeSchedule] = await db
      .select()
      .from(attorneyFeeSchedule)
      .where(eq(attorneyFeeSchedule.id, id));
    return feeSchedule || undefined;
  }

  async getAttorneyFeeScheduleByAttorney(attorneyId: number): Promise<AttorneyFeeSchedule[]> {
    return await db
      .select()
      .from(attorneyFeeSchedule)
      .where(eq(attorneyFeeSchedule.attorneyId, attorneyId))
      .orderBy(asc(attorneyFeeSchedule.caseTypeId));
  }

  async getAttorneyFeeScheduleByAttorneyAndCaseType(attorneyId: number, caseTypeId: number): Promise<AttorneyFeeSchedule | undefined> {
    const [feeSchedule] = await db
      .select()
      .from(attorneyFeeSchedule)
      .where(and(
        eq(attorneyFeeSchedule.attorneyId, attorneyId),
        eq(attorneyFeeSchedule.caseTypeId, caseTypeId)
      ));
    return feeSchedule || undefined;
  }

  async getAllAttorneyFeeSchedules(): Promise<AttorneyFeeSchedule[]> {
    return await db
      .select()
      .from(attorneyFeeSchedule)
      .orderBy(asc(attorneyFeeSchedule.attorneyId), asc(attorneyFeeSchedule.caseTypeId));
  }

  async updateAttorneyFeeSchedule(id: number, updates: Partial<InsertAttorneyFeeSchedule>): Promise<AttorneyFeeSchedule> {
    const [feeSchedule] = await db
      .update(attorneyFeeSchedule)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(attorneyFeeSchedule.id, id))
      .returning();
    return feeSchedule;
  }

  async deleteAttorneyFeeSchedule(id: number): Promise<void> {
    await db.delete(attorneyFeeSchedule).where(eq(attorneyFeeSchedule.id, id));
  }

  async bulkCreateAttorneyFeeSchedules(feeSchedules: InsertAttorneyFeeSchedule[]): Promise<AttorneyFeeSchedule[]> {
    return await db
      .insert(attorneyFeeSchedule)
      .values(feeSchedules)
      .returning();
  }

  // Request Attorney Assignments
  async createRequestAttorneyAssignment(assignment: InsertRequestAttorneyAssignment): Promise<SelectRequestAttorneyAssignment> {
    const [result] = await db
      .insert(requestAttorneyAssignments)
      .values(assignment)
      .returning();
    return result;
  }

  async getRequestAttorneyAssignments(requestId: number): Promise<SelectRequestAttorneyAssignment[]> {
    const result = await db
      .select({
        assignment: requestAttorneyAssignments,
        attorney: attorneys
      })
      .from(requestAttorneyAssignments)
      .leftJoin(attorneys, eq(requestAttorneyAssignments.attorneyId, attorneys.id))
      .where(eq(requestAttorneyAssignments.requestId, requestId))
      .orderBy(asc(requestAttorneyAssignments.assignedAt));

    return result.map(({ assignment, attorney }) => ({
      ...assignment,
      attorney
    }));
  }

  async getAttorneyAssignments(attorneyId: number): Promise<SelectRequestAttorneyAssignment[]> {
    return await db
      .select()
      .from(requestAttorneyAssignments)
      .where(eq(requestAttorneyAssignments.attorneyId, attorneyId))
      .orderBy(desc(requestAttorneyAssignments.assignedAt));
  }

  async updateRequestAttorneyAssignment(id: number, updates: Partial<InsertRequestAttorneyAssignment>): Promise<SelectRequestAttorneyAssignment> {
    const [result] = await db
      .update(requestAttorneyAssignments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(requestAttorneyAssignments.id, id))
      .returning();
    return result;
  }

  async deleteRequestAttorneyAssignment(id: number): Promise<void> {
    await db.delete(requestAttorneyAssignments).where(eq(requestAttorneyAssignments.id, id));
  }

  async bulkCreateRequestAttorneyAssignments(assignments: InsertRequestAttorneyAssignment[]): Promise<SelectRequestAttorneyAssignment[]> {
    return await db
      .insert(requestAttorneyAssignments)
      .values(assignments)
      .returning();
  }

  async updateRequestAttorneyAssignments(requestId: number, attorneyIds: number[]): Promise<SelectRequestAttorneyAssignment[]> {
    // First, remove all existing assignments for this request
    await db.delete(requestAttorneyAssignments).where(eq(requestAttorneyAssignments.requestId, requestId));
    
    // If no attorney IDs provided, return empty array
    if (attorneyIds.length === 0) {
      return [];
    }
    
    // Create new assignments
    const assignments = attorneyIds.map((attorneyId: number) => ({
      requestId,
      attorneyId,
      status: 'assigned' as const,
      notes: null
    }));

    return await db
      .insert(requestAttorneyAssignments)
      .values(assignments)
      .returning();
  }

  async updateRequestAttorneyAssignmentEmail(assignmentId: number, emailSent: boolean): Promise<SelectRequestAttorneyAssignment> {
    const [result] = await db
      .update(requestAttorneyAssignments)
      .set({ 
        emailSent,
        emailSentAt: emailSent ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(requestAttorneyAssignments.id, assignmentId))
      .returning();
    return result;
  }

  async getAttorneysByCaseType(caseTypeValue: string): Promise<Array<Attorney & { fee?: number; feeType?: string }>> {
    // First get the case type ID
    const [caseType] = await db
      .select()
      .from(caseTypes)
      .where(eq(caseTypes.value, caseTypeValue))
      .limit(1);

    if (!caseType) {
      return [];
    }

    // Get attorneys with their fee schedules for this case type
    const result = await db
      .select({
        attorney: attorneys,
        feeSchedule: attorneyFeeSchedule
      })
      .from(attorneys)
      .innerJoin(
        attorneyFeeSchedule,
        and(
          eq(attorneyFeeSchedule.attorneyId, attorneys.id),
          eq(attorneyFeeSchedule.caseTypeId, caseType.id),
          eq(attorneyFeeSchedule.isActive, true)
        )
      )
      .where(eq(attorneys.isActive, true))
      .orderBy(asc(attorneys.lastName), asc(attorneys.firstName));

    return result.map(({ attorney, feeSchedule }) => ({
      ...attorney,
      fee: feeSchedule?.fee,
      feeType: feeSchedule?.feeType
    }));
  }
}

export const storage = new DatabaseStorage();
