import { pgTable, text, serial, integer, boolean, date, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const streamingAccounts = pgTable("streaming_accounts", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  platform: text("platform").notNull(),
  accountType: text("account_type").notNull(),
  deliveryDate: date("delivery_date").notNull(),
  expirationDate: date("expiration_date").notNull(),
  credentials: jsonb("credentials"),
  notes: text("notes"),
  price: decimal("price", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertStreamingAccountSchema = createInsertSchema(streamingAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateStreamingAccountSchema = insertStreamingAccountSchema.partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type StreamingAccount = typeof streamingAccounts.$inferSelect;
export type InsertStreamingAccount = z.infer<typeof insertStreamingAccountSchema>;
export type UpdateStreamingAccount = z.infer<typeof updateStreamingAccountSchema>;
