import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const auditLogTable = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  category: text("category").notNull(),
  action: text("action").notNull(),
  actor: text("actor").notNull(),
  target: text("target"),
  severity: text("severity", { enum: ["info", "warning", "error", "critical"] }).notNull().default("info"),
  details: jsonb("details"),
});

export const insertAuditLogSchema = createInsertSchema(auditLogTable).omit({ id: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogTable.$inferSelect;
