import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql, relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("client"), // client, attorney, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const caseTypes = pgTable("case_types", {
  id: serial("id").primaryKey(),
  value: varchar("value", { length: 255 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  labelEs: varchar("label_es", { length: 255 }),
  description: text("description").notNull(),
  descriptionEs: text("description_es"),
  category: varchar("category", { length: 255 }),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const legalRequests = pgTable("legal_requests", {
  id: serial("id").primaryKey(),
  requestNumber: varchar("request_number", { length: 10 }).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }),
  caseType: varchar("case_type", { length: 255 }).notNull(),
  caseDescription: text("case_description").notNull(),
  location: varchar("location", { length: 255 }),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  captcha: varchar("captcha", { length: 10 }),
  agreeToTerms: boolean("agree_to_terms").default(false),
  status: varchar("status", { length: 50 }).notNull().default("under_review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const smtpSettings = pgTable("smtp_settings", {
  id: serial("id").primaryKey(),
  configurationName: text("configuration_name").notNull().default("SMTP2GO"),
  smtpHost: text("smtp_host").notNull().default("mail.smtp2go.com"),
  smtpPort: integer("smtp_port").notNull().default(2525),
  username: text("username").notNull(),
  password: text("password").notNull(),
  fromEmail: text("from_email").notNull(),
  fromName: text("from_name").notNull().default("LinkToLawyers"),
  useSsl: boolean("use_ssl").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emailHistory = pgTable("email_history", {
  id: serial("id").primaryKey(),
  toAddress: text("to_address").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Referral assignment tracking
export const referralAssignments = pgTable("referral_assignments", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().references(() => legalRequests.id),
  attorneyId: integer("attorney_id").notNull().references(() => attorneys.id),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).notNull().default("assigned"), // assigned, under_review, info_requested, ready_to_quote, quoted, accepted, rejected, case_created
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Information requests from attorneys to clients
export const informationRequests = pgTable("information_requests", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => referralAssignments.id),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  clientResponse: text("client_response"),
  respondedAt: timestamp("responded_at"),
});

// Attorney quotes for referrals
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => referralAssignments.id),
  serviceFee: integer("service_fee").notNull(), // in cents
  description: text("description").notNull(),
  terms: text("terms"),
  validUntil: timestamp("valid_until"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, accepted, rejected, expired
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cases created from accepted quotes
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => referralAssignments.id),
  quoteId: integer("quote_id").notNull().references(() => quotes.id),
  caseNumber: varchar("case_number", { length: 20 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, completed, on_hold, cancelled
  startDate: timestamp("start_date").defaultNow().notNull(),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Attorney notes for referrals and cases
export const attorneyNotes = pgTable("attorney_notes", {
  id: serial("id").primaryKey(),
  attorneyId: integer("attorney_id").notNull().references(() => attorneys.id),
  assignmentId: integer("assignment_id").references(() => referralAssignments.id),
  caseId: integer("case_id").references(() => cases.id),
  note: text("note").notNull(),
  isPrivate: boolean("is_private").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  subject: text("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  templateType: text("template_type").notNull(), // 'legal_request_confirmation', 'attorney_assignment', 'general', etc.
  variables: text("variables"), // JSON string of available variables
  isActive: boolean("is_active").notNull().default(true),
  useInProduction: boolean("use_in_production").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attorneys = pgTable("attorneys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 50 }),
  barNumber: varchar("bar_number", { length: 100 }),
  licenseState: varchar("license_state", { length: 50 }),
  practiceAreas: text("practice_areas").array(),
  yearsOfExperience: integer("years_of_experience"),
  hourlyRate: integer("hourly_rate"),
  firmName: varchar("firm_name", { length: 255 }),
  firmAddress: text("firm_address"),
  bio: text("bio"),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attorneyFeeSchedule = pgTable("attorney_fee_schedule", {
  id: serial("id").primaryKey(),
  attorneyId: integer("attorney_id").notNull().references(() => attorneys.id, { onDelete: "cascade" }),
  caseTypeId: integer("case_type_id").notNull().references(() => caseTypes.id, { onDelete: "cascade" }),
  fee: integer("fee").notNull(), // Fee amount in cents to avoid floating point issues
  feeType: varchar("fee_type", { length: 50 }).notNull().default("flat"), // flat, hourly, consultation
  notes: text("notes"), // Optional notes about the fee
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const requestAttorneyAssignments = pgTable("request_attorney_assignments", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().references(() => legalRequests.id, { onDelete: "cascade" }),
  attorneyId: integer("attorney_id").notNull().references(() => attorneys.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).notNull().default("assigned"), // assigned, accepted, declined, completed
  notes: text("notes"), // Optional notes about the assignment
  emailSent: boolean("email_sent").default(false).notNull(),
  emailSentAt: timestamp("email_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  imageUrl: text("image_url"), // Featured image URL
  imageAlt: varchar("image_alt", { length: 255 }), // Alt text for the image
  isFeatured: boolean("is_featured").default(false), // Featured post flag
  spanishTitle: varchar("spanish_title", { length: 255 }),
  spanishContent: text("spanish_content"),
  spanishExcerpt: text("spanish_excerpt"),
  translationStatus: varchar("translation_status", { length: 50 }).default("pending"), // pending, completed, failed
  authorId: integer("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
});

export const insertCaseTypeSchema = createInsertSchema(caseTypes).pick({
  value: true,
  label: true,
  labelEs: true,
  description: true,
  descriptionEs: true,
  category: true,
  displayOrder: true,
  isActive: true,
});

export const insertRequestAttorneyAssignmentSchema = createInsertSchema(requestAttorneyAssignments).pick({
  requestId: true,
  attorneyId: true,
  status: true,
  notes: true,
});

export const insertLegalRequestSchema = createInsertSchema(legalRequests).pick({
  requestNumber: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  caseType: true,
  caseDescription: true,
  location: true,
  city: true,
  state: true,
  captcha: true,
  agreeToTerms: true,
  status: true,
});

export const insertSmtpSettingsSchema = createInsertSchema(smtpSettings).pick({
  configurationName: true,
  smtpHost: true,
  smtpPort: true,
  username: true,
  password: true,
  fromEmail: true,
  fromName: true,
  useSsl: true,
  isActive: true,
});

export const insertEmailHistorySchema = createInsertSchema(emailHistory).pick({
  toAddress: true,
  subject: true,
  message: true,
  status: true,
  errorMessage: true,
});

export const insertAttorneySchema = createInsertSchema(attorneys).pick({
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  barNumber: true,
  licenseState: true,
  practiceAreas: true,
  yearsOfExperience: true,
  hourlyRate: true,
  firmName: true,
  firmAddress: true,
  bio: true,
  isActive: true,
  isVerified: true,
});

export const insertAttorneyFeeScheduleSchema = createInsertSchema(attorneyFeeSchedule).pick({
  attorneyId: true,
  caseTypeId: true,
  fee: true,
  feeType: true,
  notes: true,
  isActive: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  imageUrl: true,
  imageAlt: true,
  isFeatured: true,
  spanishTitle: true,
  spanishContent: true,
  spanishExcerpt: true,
  translationStatus: true,
  authorId: true,
  isPublished: true,
  publishedAt: true,
});

const baseEmailTemplateSchema = createInsertSchema(emailTemplates).pick({
  name: true,
  subject: true,
  htmlContent: true,
  textContent: true,
  templateType: true,
  variables: true,
  isActive: true,
  useInProduction: true,
});

export const insertEmailTemplateSchema = baseEmailTemplateSchema.refine(
  (data) => data.htmlContent || data.textContent,
  {
    message: 'Either HTML content or text content is required',
    path: ['htmlContent'],
  }
);

export const updateEmailTemplateSchema = baseEmailTemplateSchema.partial().refine(
  (data) => {
    // Only require content validation if either content field is provided
    if (data.htmlContent !== undefined || data.textContent !== undefined) {
      return data.htmlContent || data.textContent;
    }
    return true; // If no content fields are being updated, skip validation
  },
  {
    message: 'Either HTML content or text content is required',
    path: ['htmlContent'],
  }
);

export const sendEmailSchema = z.object({
  to: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Schema validations for new referral management tables
export const insertReferralAssignmentSchema = createInsertSchema(referralAssignments).pick({
  requestId: true,
  attorneyId: true,
  status: true,
  notes: true,
});

export const insertInformationRequestSchema = createInsertSchema(informationRequests).pick({
  assignmentId: true,
  subject: true,
  message: true,
  clientResponse: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).pick({
  assignmentId: true,
  serviceFee: true,
  description: true,
  terms: true,
  status: true,
}).extend({
  validUntil: z.string().optional().transform((val) => {
    if (!val || val === '') return null;
    return new Date(val);
  }).nullable(),
});

export const insertCaseSchema = createInsertSchema(cases).pick({
  assignmentId: true,
  quoteId: true,
  caseNumber: true,
  status: true,
  notes: true,
});

export const insertAttorneyNoteSchema = createInsertSchema(attorneyNotes).pick({
  attorneyId: true,
  assignmentId: true,
  caseId: true,
  note: true,
  isPrivate: true,
});

// New structured form intake system
export const structuredIntakes = pgTable("structured_intakes", {
  id: serial("id").primaryKey(),
  requestNumber: varchar("request_number", { length: 10 }).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  caseType: varchar("case_type", { length: 50 }).notNull(), // 'family', 'asylum', 'naturalization'
  formResponses: text("form_responses").notNull(), // JSON string of form responses
  attorneyIntakeSummary: text("attorney_intake_summary"), // Generated summary from prompt format
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, completed, assigned
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertRequestAttorneyAssignment = z.infer<typeof insertRequestAttorneyAssignmentSchema>;
export type SelectRequestAttorneyAssignment = typeof requestAttorneyAssignments.$inferSelect;
export type RequestAttorneyAssignmentWithAttorney = SelectRequestAttorneyAssignment & { attorney: Attorney | null };
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type InsertCaseType = z.infer<typeof insertCaseTypeSchema>;
export type CaseType = typeof caseTypes.$inferSelect;
export type InsertLegalRequest = z.infer<typeof insertLegalRequestSchema>;
export type LegalRequest = typeof legalRequests.$inferSelect;
export type InsertSmtpSettings = z.infer<typeof insertSmtpSettingsSchema>;
export type SmtpSettings = typeof smtpSettings.$inferSelect;
export type InsertEmailHistory = z.infer<typeof insertEmailHistorySchema>;
export type EmailHistory = typeof emailHistory.$inferSelect;
export type InsertAttorney = z.infer<typeof insertAttorneySchema>;
export type Attorney = typeof attorneys.$inferSelect;
export type InsertAttorneyFeeSchedule = z.infer<typeof insertAttorneyFeeScheduleSchema>;
export type AttorneyFeeSchedule = typeof attorneyFeeSchedule.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertReferralAssignment = z.infer<typeof insertReferralAssignmentSchema>;
export type ReferralAssignment = typeof referralAssignments.$inferSelect;
export type InsertInformationRequest = z.infer<typeof insertInformationRequestSchema>;
export type InformationRequest = typeof informationRequests.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof cases.$inferSelect;
export type InsertAttorneyNote = z.infer<typeof insertAttorneyNoteSchema>;
export type AttorneyNote = typeof attorneyNotes.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type SendEmail = z.infer<typeof sendEmailSchema>;

// Chatbot Prompts
export const chatbotPrompts = pgTable("chatbot_prompts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  initialGreeting: text("initial_greeting"),
  description: text("description"),
  language: text("language").notNull().default("en"), // 'en' or 'es'
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertChatbotPromptSchema = createInsertSchema(chatbotPrompts).pick({
  name: true,
  prompt: true,
  initialGreeting: true,
  description: true,
  language: true,
  isActive: true,
});

export type ChatbotPrompt = typeof chatbotPrompts.$inferSelect;
export type InsertChatbotPrompt = z.infer<typeof insertChatbotPromptSchema>;

// Chat system tables
export const conversations = pgTable('conversations', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar('conversation_id').notNull(),
  content: text('content').notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations for chat system
export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

// Insert schemas for chat system
export const insertConversationSchema = createInsertSchema(conversations);
export const insertMessageSchema = createInsertSchema(messages);

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Insert schema for structured intakes
export const insertStructuredIntakeSchema = createInsertSchema(structuredIntakes).pick({
  requestNumber: true,
  firstName: true,
  lastName: true,  
  email: true,
  caseType: true,
  formResponses: true,
  attorneyIntakeSummary: true,
  status: true,
});

export type InsertStructuredIntake = z.infer<typeof insertStructuredIntakeSchema>;
export type StructuredIntake = typeof structuredIntakes.$inferSelect;
