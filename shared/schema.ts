import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
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

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type InsertCaseType = z.infer<typeof insertCaseTypeSchema>;
export type CaseType = typeof caseTypes.$inferSelect;
