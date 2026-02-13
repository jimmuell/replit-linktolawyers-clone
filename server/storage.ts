import { users, caseTypes, legalRequests, smtpSettings, emailHistory, attorneys, attorneyFeeSchedule, requestAttorneyAssignments, blogPosts, emailTemplates, referralAssignments, quotes, cases, attorneyNotes, chatbotPrompts, conversations, messages, structuredIntakes, flows, organizations, type User, type InsertUser, type CaseType, type InsertCaseType, type LegalRequest, type InsertLegalRequest, type SmtpSettings, type InsertSmtpSettings, type EmailHistory, type InsertEmailHistory, type Attorney, type InsertAttorney, type AttorneyFeeSchedule, type InsertAttorneyFeeSchedule, type SelectRequestAttorneyAssignment, type InsertRequestAttorneyAssignment, type RequestAttorneyAssignmentWithAttorney, type BlogPost, type InsertBlogPost, type EmailTemplate, type InsertEmailTemplate, type ChatbotPrompt, type InsertChatbotPrompt, type Conversation, type InsertConversation, type Message, type InsertMessage, type StructuredIntake, type InsertStructuredIntake, type Flow, type InsertFlow, type Organization, type InsertOrganization } from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc, and, or, isNull, sql, inArray } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getCaseType(id: number): Promise<CaseType | undefined>;
  getCaseTypeByValue(value: string): Promise<CaseType | undefined>;
  getAllCaseTypes(includeInactive?: boolean): Promise<CaseType[]>;
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
  // Organization Management
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getOrganization(id: number): Promise<Organization | undefined>;
  getAllOrganizations(): Promise<Organization[]>;
  updateOrganization(id: number, updates: Partial<InsertOrganization>): Promise<Organization>;
  deleteOrganization(id: number): Promise<void>;
  // Attorney Management
  createAttorney(attorney: InsertAttorney): Promise<Attorney>;
  getAttorney(id: number): Promise<Attorney | undefined>;
  getAttorneyByUserId(userId: number): Promise<Attorney | undefined>;
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
  getPublicAttorneyFeeSchedules(attorneyIds: number[], caseTypeValue: string): Promise<AttorneyFeeSchedule[]>;
  // Request Attorney Assignments
  createRequestAttorneyAssignment(assignment: InsertRequestAttorneyAssignment): Promise<SelectRequestAttorneyAssignment>;
  getRequestAttorneyAssignments(requestId: number): Promise<RequestAttorneyAssignmentWithAttorney[]>;
  getAttorneyAssignments(attorneyId: number): Promise<SelectRequestAttorneyAssignment[]>;
  updateRequestAttorneyAssignment(id: number, updates: Partial<InsertRequestAttorneyAssignment>): Promise<SelectRequestAttorneyAssignment>;
  deleteRequestAttorneyAssignment(id: number): Promise<void>;
  bulkCreateRequestAttorneyAssignments(assignments: InsertRequestAttorneyAssignment[]): Promise<SelectRequestAttorneyAssignment[]>;
  updateRequestAttorneyAssignments(requestId: number, attorneyIds: number[]): Promise<SelectRequestAttorneyAssignment[]>;
  updateRequestAttorneyAssignmentEmail(assignmentId: number, emailSent: boolean): Promise<SelectRequestAttorneyAssignment>;
  getAttorneysByCaseType(caseTypeValue: string): Promise<Array<Attorney & { fee?: number; feeType?: string }>>;
  // Submission Attorney Assignments (for structured_intakes)
  getSubmissionAttorneyAssignments(submissionId: number): Promise<RequestAttorneyAssignmentWithAttorney[]>;
  updateSubmissionAttorneyAssignments(submissionId: number, attorneyIds: number[]): Promise<SelectRequestAttorneyAssignment[]>;
  markSubmissionAssignmentEmailSent(assignmentId: number): Promise<SelectRequestAttorneyAssignment>;
  // Blog Posts
  createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  getBlogPostsNeedingTranslation(): Promise<BlogPost[]>;
  updateBlogPostTranslation(id: number, translation: {
    spanishTitle: string;
    spanishContent: string;
    spanishExcerpt?: string;
    translationStatus: string;
  }): Promise<BlogPost>;
  // Email Templates
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  getAllEmailTemplates(): Promise<EmailTemplate[]>;
  getActiveEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplatesByType(templateType: string): Promise<EmailTemplate[]>;
  updateEmailTemplate(id: number, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate>;
  deleteEmailTemplate(id: number): Promise<void>;
  // Chatbot Prompts
  getAllChatbotPrompts(): Promise<ChatbotPrompt[]>;
  getActiveChatbotPrompt(): Promise<ChatbotPrompt | undefined>;
  getActiveChatbotPromptByLanguage(language: string): Promise<ChatbotPrompt | undefined>;
  getChatbotPrompt(id: number): Promise<ChatbotPrompt | undefined>;
  createChatbotPrompt(prompt: InsertChatbotPrompt): Promise<ChatbotPrompt>;
  updateChatbotPrompt(id: number, updates: Partial<InsertChatbotPrompt>): Promise<ChatbotPrompt>;
  deleteChatbotPrompt(id: number): Promise<void>;
  deactivateAllChatbotPrompts(): Promise<void>;
  deactivateChatbotPromptsByLanguage(language: string): Promise<void>;
  // Structured Intakes
  createStructuredIntake(intake: InsertStructuredIntake): Promise<StructuredIntake>;
  getStructuredIntake(id: number): Promise<StructuredIntake | undefined>;
  getStructuredIntakeByRequestNumber(requestNumber: string): Promise<StructuredIntake | undefined>;
  getAllStructuredIntakes(): Promise<StructuredIntake[]>;
  updateStructuredIntake(id: number, updates: Partial<InsertStructuredIntake>): Promise<StructuredIntake>;
  getStructuredIntakeRelatedCounts(id: number): Promise<{ referralAssignments: number; quotes: number; cases: number; attorneyNotes: number }>;
  deleteStructuredIntake(id: number): Promise<void>;
  deleteStructuredIntakesBulk(ids: number[]): Promise<void>;
  // Flows
  createFlow(flow: InsertFlow): Promise<Flow>;
  getFlow(id: number): Promise<Flow | undefined>;
  getFlowBySlug(slug: string): Promise<Flow | undefined>;
  getAllFlows(): Promise<Flow[]>;
  getActiveFlows(): Promise<Flow[]>;
  updateFlow(id: number, updates: Partial<InsertFlow>): Promise<Flow>;
  deleteFlow(id: number): Promise<void>;
  getFlowsWithUsageStatus(): Promise<(Flow & { linkedCaseTypes: number })[]>;
  updateFlowTestResults(id: number, testData: { testStatus: string; testDate: Date; testDetails: any }): Promise<Flow>;
  updateCaseTypeTestResultsByFlowId(flowId: number, testData: { testStatus: string; testDate: Date; testDetails: any }): Promise<void>;
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
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

  async getCaseTypeByValue(value: string): Promise<CaseType | undefined> {
    const [caseType] = await db
      .select()
      .from(caseTypes)
      .where(eq(caseTypes.value, value));
    return caseType || undefined;
  }

  async getAllCaseTypes(includeInactive: boolean = false): Promise<CaseType[]> {
    if (includeInactive) {
      return await db
        .select()
        .from(caseTypes)
        .orderBy(asc(caseTypes.displayOrder), asc(caseTypes.label));
    }
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
    // Delete in proper order to handle foreign key constraints
    // 1. Delete cases first (references quotes)
    await db.delete(cases).where(
      sql`quote_id IN (
        SELECT q.id FROM quotes q
        JOIN referral_assignments ra ON q.assignment_id = ra.id
        WHERE ra.request_id = ${id}
      )`
    );
    
    // 2. Delete quotes (references referral_assignments)  
    await db.delete(quotes).where(
      sql`assignment_id IN (
        SELECT id FROM referral_assignments WHERE request_id = ${id}
      )`
    );
    
    // 3. Delete referral assignments (references legal_requests)
    await db.delete(referralAssignments).where(eq(referralAssignments.requestId, id));
    
    // 4. Finally delete the legal request
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

  // Organization Management operations
  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const [org] = await db
      .insert(organizations)
      .values(insertOrg)
      .returning();
    return org;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));
    return org || undefined;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return await db
      .select()
      .from(organizations)
      .orderBy(asc(organizations.name));
  }

  async updateOrganization(id: number, updates: Partial<InsertOrganization>): Promise<Organization> {
    const [org] = await db
      .update(organizations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return org;
  }

  async deleteOrganization(id: number): Promise<void> {
    await db.delete(organizations).where(eq(organizations.id, id));
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

  async getAttorneyByUserId(userId: number): Promise<Attorney | undefined> {
    const [attorney] = await db
      .select()
      .from(attorneys)
      .where(eq(attorneys.userId, userId));
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

  async getPublicAttorneyFeeSchedules(attorneyIds: number[], caseTypeValue: string): Promise<AttorneyFeeSchedule[]> {
    // First get the case type ID
    const [caseType] = await db
      .select({ id: caseTypes.id })
      .from(caseTypes)
      .where(eq(caseTypes.value, caseTypeValue))
      .limit(1);
    
    if (!caseType) {
      return [];
    }

    // Get fee schedules for each attorney individually to avoid SQL array issues
    const results: AttorneyFeeSchedule[] = [];
    for (const attorneyId of attorneyIds) {
      const feeSchedules = await db
        .select()
        .from(attorneyFeeSchedule)
        .where(and(
          eq(attorneyFeeSchedule.attorneyId, attorneyId),
          eq(attorneyFeeSchedule.caseTypeId, caseType.id),
          eq(attorneyFeeSchedule.isActive, true)
        ));
      results.push(...feeSchedules);
    }
    
    return results.sort((a, b) => a.attorneyId - b.attorneyId);
  }

  // Request Attorney Assignments
  async createRequestAttorneyAssignment(assignment: InsertRequestAttorneyAssignment): Promise<SelectRequestAttorneyAssignment> {
    const [result] = await db
      .insert(requestAttorneyAssignments)
      .values(assignment)
      .returning();
    return result;
  }

  async getRequestAttorneyAssignments(requestId: number): Promise<RequestAttorneyAssignmentWithAttorney[]> {
    const result = await db
      .select({
        assignment: requestAttorneyAssignments,
        attorney: attorneys
      })
      .from(requestAttorneyAssignments)
      .innerJoin(attorneys, eq(requestAttorneyAssignments.attorneyId, attorneys.id))
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
    // Get existing assignments to preserve email status
    const existingAssignments = await db
      .select()
      .from(requestAttorneyAssignments)
      .where(eq(requestAttorneyAssignments.requestId, requestId));
    
    // Create a map of existing assignments by attorney ID to preserve email status
    const existingEmailStatus = new Map();
    existingAssignments.forEach(assignment => {
      if (assignment.emailSent) {
        existingEmailStatus.set(assignment.attorneyId, {
          emailSent: assignment.emailSent,
          emailSentAt: assignment.emailSentAt
        });
      }
    });

    // Remove all existing assignments for this request
    await db.delete(requestAttorneyAssignments).where(eq(requestAttorneyAssignments.requestId, requestId));
    
    // If no attorney IDs provided, return empty array
    if (attorneyIds.length === 0) {
      return [];
    }
    
    // Create new assignments, preserving email status for attorneys that were already emailed
    const assignments = attorneyIds.map((attorneyId: number) => {
      const emailStatus = existingEmailStatus.get(attorneyId);
      return {
        requestId,
        attorneyId,
        status: 'assigned' as const,
        notes: null,
        emailSent: emailStatus?.emailSent || false,
        emailSentAt: emailStatus?.emailSentAt || null
      };
    });

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

  async getSubmissionAttorneyAssignments(submissionId: number): Promise<RequestAttorneyAssignmentWithAttorney[]> {
    const result = await db
      .select({
        assignment: requestAttorneyAssignments,
        attorney: attorneys
      })
      .from(requestAttorneyAssignments)
      .innerJoin(attorneys, eq(requestAttorneyAssignments.attorneyId, attorneys.id))
      .where(eq(requestAttorneyAssignments.submissionId, submissionId))
      .orderBy(asc(requestAttorneyAssignments.assignedAt));

    return result.map(({ assignment, attorney }) => ({
      ...assignment,
      attorney
    }));
  }

  async updateSubmissionAttorneyAssignments(submissionId: number, attorneyIds: number[]): Promise<SelectRequestAttorneyAssignment[]> {
    const existingAssignments = await db
      .select()
      .from(requestAttorneyAssignments)
      .where(eq(requestAttorneyAssignments.submissionId, submissionId));
    
    const existingEmailStatus = new Map();
    existingAssignments.forEach(assignment => {
      if (assignment.emailSent) {
        existingEmailStatus.set(assignment.attorneyId, {
          emailSent: assignment.emailSent,
          emailSentAt: assignment.emailSentAt
        });
      }
    });

    await db.delete(requestAttorneyAssignments).where(eq(requestAttorneyAssignments.submissionId, submissionId));
    
    if (attorneyIds.length === 0) {
      return [];
    }
    
    const assignments = attorneyIds.map((attorneyId: number) => {
      const emailStatus = existingEmailStatus.get(attorneyId);
      return {
        submissionId,
        attorneyId,
        status: 'assigned' as const,
        notes: null,
        emailSent: emailStatus?.emailSent || false,
        emailSentAt: emailStatus?.emailSentAt || null
      };
    });

    return await db
      .insert(requestAttorneyAssignments)
      .values(assignments)
      .returning();
  }

  async markSubmissionAssignmentEmailSent(assignmentId: number): Promise<SelectRequestAttorneyAssignment> {
    const [result] = await db
      .update(requestAttorneyAssignments)
      .set({ 
        emailSent: true,
        emailSentAt: new Date(),
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

  // Blog Posts
  async createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost> {
    const [result] = await db.insert(blogPosts).values(blogPost).returning();
    return result;
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [result] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return result || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [result] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return result || undefined;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    const result = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
    return result;
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    const result = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt));
    return result;
  }

  async updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [result] = await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return result;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getBlogPostsNeedingTranslation(): Promise<BlogPost[]> {
    const result = await db
      .select()
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.isPublished, true),
          or(
            eq(blogPosts.translationStatus, "pending"),
            isNull(blogPosts.translationStatus),
            isNull(blogPosts.spanishTitle)
          )
        )
      )
      .orderBy(desc(blogPosts.publishedAt));
    return result;
  }

  async updateBlogPostTranslation(id: number, translation: {
    spanishTitle: string;
    spanishContent: string;
    spanishExcerpt?: string;
    translationStatus: string;
  }): Promise<BlogPost> {
    const [result] = await db
      .update(blogPosts)
      .set({ 
        ...translation,
        updatedAt: new Date() 
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return result;
  }

  // Email Templates
  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [result] = await db.insert(emailTemplates).values(template).returning();
    return result;
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    const [result] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return result || undefined;
  }

  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    const result = await db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
    return result;
  }

  async getActiveEmailTemplates(): Promise<EmailTemplate[]> {
    const result = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.isActive, true))
      .orderBy(desc(emailTemplates.createdAt));
    return result;
  }

  async getEmailTemplatesByType(templateType: string): Promise<EmailTemplate[]> {
    const result = await db
      .select()
      .from(emailTemplates)
      .where(and(eq(emailTemplates.templateType, templateType), eq(emailTemplates.isActive, true)))
      .orderBy(desc(emailTemplates.createdAt));
    return result;
  }

  async updateEmailTemplate(id: number, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
    const [result] = await db
      .update(emailTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return result;
  }

  async deleteEmailTemplate(id: number): Promise<void> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }

  // Chatbot Prompts operations
  async getAllChatbotPrompts(): Promise<ChatbotPrompt[]> {
    return await db
      .select()
      .from(chatbotPrompts)
      .orderBy(desc(chatbotPrompts.createdAt));
  }

  async getActiveChatbotPrompt(): Promise<ChatbotPrompt | undefined> {
    const [activePrompt] = await db
      .select()
      .from(chatbotPrompts)
      .where(eq(chatbotPrompts.isActive, true));
    return activePrompt || undefined;
  }

  async createChatbotPrompt(insertChatbotPrompt: InsertChatbotPrompt): Promise<ChatbotPrompt> {
    const [prompt] = await db
      .insert(chatbotPrompts)
      .values(insertChatbotPrompt)
      .returning();
    return prompt;
  }

  async updateChatbotPrompt(id: number, updates: Partial<InsertChatbotPrompt>): Promise<ChatbotPrompt> {
    const [prompt] = await db
      .update(chatbotPrompts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatbotPrompts.id, id))
      .returning();
    return prompt;
  }

  async deleteChatbotPrompt(id: number): Promise<void> {
    await db.delete(chatbotPrompts).where(eq(chatbotPrompts.id, id));
  }

  async deactivateAllChatbotPrompts(): Promise<void> {
    await db
      .update(chatbotPrompts)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(chatbotPrompts.isActive, true));
  }

  async getActiveChatbotPromptByLanguage(language: string): Promise<ChatbotPrompt | undefined> {
    const [activePrompt] = await db
      .select()
      .from(chatbotPrompts)
      .where(and(
        eq(chatbotPrompts.isActive, true),
        eq(chatbotPrompts.language, language)
      ));
    return activePrompt || undefined;
  }

  async getChatbotPrompt(id: number): Promise<ChatbotPrompt | undefined> {
    const [prompt] = await db
      .select()
      .from(chatbotPrompts)
      .where(eq(chatbotPrompts.id, id));
    return prompt || undefined;
  }

  async deactivateChatbotPromptsByLanguage(language: string): Promise<void> {
    await db
      .update(chatbotPrompts)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(
        eq(chatbotPrompts.isActive, true),
        eq(chatbotPrompts.language, language)
      ));
  }

  // Chat system methods
  async getConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations).orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Structured Intakes methods
  async createStructuredIntake(intake: InsertStructuredIntake): Promise<StructuredIntake> {
    const [result] = await db
      .insert(structuredIntakes)
      .values(intake)
      .returning();
    return result;
  }

  async getStructuredIntake(id: number): Promise<StructuredIntake | undefined> {
    const [result] = await db
      .select()
      .from(structuredIntakes)
      .where(eq(structuredIntakes.id, id));
    return result || undefined;
  }

  async getStructuredIntakeByRequestNumber(requestNumber: string): Promise<StructuredIntake | undefined> {
    const [result] = await db
      .select()
      .from(structuredIntakes)
      .where(eq(structuredIntakes.requestNumber, requestNumber));
    return result || undefined;
  }

  async getAllStructuredIntakes(): Promise<StructuredIntake[]> {
    return await db
      .select()
      .from(structuredIntakes)
      .orderBy(desc(structuredIntakes.createdAt));
  }

  async updateStructuredIntake(id: number, updates: Partial<InsertStructuredIntake>): Promise<StructuredIntake> {
    const [result] = await db
      .update(structuredIntakes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(structuredIntakes.id, id))
      .returning();
    return result;
  }

  async getStructuredIntakeRelatedCounts(id: number): Promise<{ referralAssignments: number; quotes: number; cases: number; attorneyNotes: number }> {
    const assignments = await db.select({ id: referralAssignments.id })
      .from(referralAssignments)
      .where(eq(referralAssignments.submissionId, id));

    let quotesCount = 0;
    let casesCount = 0;
    let notesCount = 0;

    if (assignments.length > 0) {
      const assignmentIds = assignments.map(a => a.id);
      const relatedQuotes = await db.select({ id: quotes.id })
        .from(quotes)
        .where(inArray(quotes.assignmentId, assignmentIds));
      quotesCount = relatedQuotes.length;

      if (relatedQuotes.length > 0) {
        const quoteIds = relatedQuotes.map(q => q.id);
        const relatedCases = await db.select({ id: cases.id })
          .from(cases)
          .where(inArray(cases.quoteId, quoteIds));
        casesCount = relatedCases.length;
      }

      const relatedNotes = await db.select({ id: attorneyNotes.id })
        .from(attorneyNotes)
        .where(inArray(attorneyNotes.assignmentId, assignmentIds));
      notesCount = relatedNotes.length;
    }

    return {
      referralAssignments: assignments.length,
      quotes: quotesCount,
      cases: casesCount,
      attorneyNotes: notesCount,
    };
  }

  async deleteStructuredIntake(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      const assignments = await tx.select({ id: referralAssignments.id })
        .from(referralAssignments)
        .where(eq(referralAssignments.submissionId, id));
      
      if (assignments.length > 0) {
        const assignmentIds = assignments.map(a => a.id);
        const relatedQuotes = await tx.select({ id: quotes.id })
          .from(quotes)
          .where(inArray(quotes.assignmentId, assignmentIds));
        if (relatedQuotes.length > 0) {
          const quoteIds = relatedQuotes.map(q => q.id);
          const relatedCases = await tx.select({ id: cases.id })
            .from(cases)
            .where(inArray(cases.quoteId, quoteIds));
          if (relatedCases.length > 0) {
            const caseIds = relatedCases.map(c => c.id);
            await tx.delete(attorneyNotes).where(inArray(attorneyNotes.caseId, caseIds));
            await tx.delete(cases).where(inArray(cases.id, caseIds));
          }
        }
        await tx.delete(attorneyNotes).where(inArray(attorneyNotes.assignmentId, assignmentIds));
        await tx.delete(quotes).where(inArray(quotes.assignmentId, assignmentIds));
        await tx.delete(referralAssignments).where(inArray(referralAssignments.id, assignmentIds));
      }

      const legacyAssignments = await tx.select({ id: requestAttorneyAssignments.id })
        .from(requestAttorneyAssignments)
        .where(eq(requestAttorneyAssignments.submissionId, id));
      if (legacyAssignments.length > 0) {
        const legacyIds = legacyAssignments.map(a => a.id);
        await tx.delete(requestAttorneyAssignments).where(inArray(requestAttorneyAssignments.id, legacyIds));
      }

      const [intake] = await tx.select({ requestNumber: structuredIntakes.requestNumber })
        .from(structuredIntakes)
        .where(eq(structuredIntakes.id, id));

      if (intake?.requestNumber) {
        const [matchingLR] = await tx.select({ id: legalRequests.id })
          .from(legalRequests)
          .where(eq(legalRequests.requestNumber, intake.requestNumber));

        if (matchingLR) {
          const lrAssignments = await tx.select({ id: referralAssignments.id })
            .from(referralAssignments)
            .where(eq(referralAssignments.requestId, matchingLR.id));

          if (lrAssignments.length > 0) {
            const lrAssignmentIds = lrAssignments.map(a => a.id);
            const lrQuotes = await tx.select({ id: quotes.id })
              .from(quotes)
              .where(inArray(quotes.assignmentId, lrAssignmentIds));
            if (lrQuotes.length > 0) {
              const lrQuoteIds = lrQuotes.map(q => q.id);
              const lrCases = await tx.select({ id: cases.id })
                .from(cases)
                .where(inArray(cases.quoteId, lrQuoteIds));
              if (lrCases.length > 0) {
                const lrCaseIds = lrCases.map(c => c.id);
                await tx.delete(attorneyNotes).where(inArray(attorneyNotes.caseId, lrCaseIds));
                await tx.delete(cases).where(inArray(cases.id, lrCaseIds));
              }
            }
            await tx.delete(attorneyNotes).where(inArray(attorneyNotes.assignmentId, lrAssignmentIds));
            await tx.delete(quotes).where(inArray(quotes.assignmentId, lrAssignmentIds));
            await tx.delete(referralAssignments).where(inArray(referralAssignments.id, lrAssignmentIds));
          }
          await tx.delete(legalRequests).where(eq(legalRequests.id, matchingLR.id));
        }
      }

      await tx.delete(structuredIntakes).where(eq(structuredIntakes.id, id));
    });
  }

  async deleteStructuredIntakesBulk(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    for (const id of ids) {
      await this.deleteStructuredIntake(id);
    }
  }

  // Flows methods
  async createFlow(flow: InsertFlow): Promise<Flow> {
    const [result] = await db
      .insert(flows)
      .values(flow as any)
      .returning();
    return result;
  }

  async getFlow(id: number): Promise<Flow | undefined> {
    const [result] = await db
      .select()
      .from(flows)
      .where(eq(flows.id, id));
    return result || undefined;
  }

  async getFlowBySlug(slug: string): Promise<Flow | undefined> {
    const [result] = await db
      .select()
      .from(flows)
      .where(eq(flows.slug, slug));
    return result || undefined;
  }

  async getAllFlows(): Promise<Flow[]> {
    return await db
      .select()
      .from(flows)
      .orderBy(desc(flows.createdAt));
  }

  async getActiveFlows(): Promise<Flow[]> {
    return await db
      .select()
      .from(flows)
      .where(eq(flows.isActive, true))
      .orderBy(asc(flows.name));
  }

  async updateFlow(id: number, updates: Partial<InsertFlow>): Promise<Flow> {
    const [result] = await db
      .update(flows)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(flows.id, id))
      .returning();
    return result;
  }

  async deleteFlow(id: number): Promise<void> {
    await db.update(caseTypes).set({ flowId: null }).where(eq(caseTypes.flowId, id));
    await db.delete(flows).where(eq(flows.id, id));
  }

  async getFlowsWithUsageStatus(): Promise<(Flow & { linkedCaseTypes: number })[]> {
    const allFlows = await this.getAllFlows();
    const result: (Flow & { linkedCaseTypes: number })[] = [];
    
    for (const flow of allFlows) {
      const linkedCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(caseTypes)
        .where(eq(caseTypes.flowId, flow.id));
      
      result.push({
        ...flow,
        linkedCaseTypes: Number(linkedCount[0]?.count || 0)
      });
    }
    
    return result;
  }

  async updateFlowTestResults(id: number, testData: { testStatus: string; testDate: Date; testDetails: any }): Promise<Flow> {
    const [result] = await db
      .update(flows)
      .set({
        testStatus: testData.testStatus as 'passed' | 'failed' | null,
        testDate: testData.testDate,
        testDetails: testData.testDetails,
        updatedAt: new Date()
      })
      .where(eq(flows.id, id))
      .returning();
    return result;
  }

  async updateCaseTypeTestResultsByFlowId(flowId: number, testData: { testStatus: string; testDate: Date; testDetails: any }): Promise<void> {
    await db
      .update(caseTypes)
      .set({
        testStatus: testData.testStatus as 'passed' | 'failed' | null,
        testDate: testData.testDate,
        testDetails: testData.testDetails,
        updatedAt: new Date()
      })
      .where(eq(caseTypes.flowId, flowId));
  }
}

export const storage = new DatabaseStorage();
