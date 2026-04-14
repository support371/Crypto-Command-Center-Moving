import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const systemLogsTable = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  level: text("level", { enum: ["debug", "info", "warn", "error"] }).notNull().default("info"),
  source: text("source").notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
});

export const insertSystemLogSchema = createInsertSchema(systemLogsTable).omit({ id: true });
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type SystemLog = typeof systemLogsTable.$inferSelect;
