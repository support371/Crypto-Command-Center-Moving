import { pgTable, text, serial, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const platformSettingsTable = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  routingMode: text("routing_mode", { enum: ["auto", "manual", "disabled"] }).notNull().default("auto"),
  defaultLeverage: numeric("default_leverage", { precision: 5, scale: 2 }).notNull().default("1"),
  reconciliationInterval: integer("reconciliation_interval").notNull().default(30),
  guardianHeartbeatInterval: integer("guardian_heartbeat_interval").notNull().default(10),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  emailAlerts: boolean("email_alerts").notNull().default(true),
  auditRetentionDays: integer("audit_retention_days").notNull().default(90),
  theme: text("theme", { enum: ["light", "dark", "system"] }).notNull().default("dark"),
  timezone: text("timezone").notNull().default("UTC"),
});

export const insertPlatformSettingsSchema = createInsertSchema(platformSettingsTable).omit({ id: true });
export type InsertPlatformSettings = z.infer<typeof insertPlatformSettingsSchema>;
export type PlatformSettings = typeof platformSettingsTable.$inferSelect;
