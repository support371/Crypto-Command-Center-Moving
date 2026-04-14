import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const guardianStateTable = pgTable("guardian_state", {
  id: serial("id").primaryKey(),
  isActive: boolean("is_active").notNull().default(true),
  killSwitchActive: boolean("kill_switch_active").notNull().default(false),
  killSwitchReason: text("kill_switch_reason"),
  killSwitchTriggeredAt: timestamp("kill_switch_triggered_at", { withTimezone: true }),
  lastHeartbeat: timestamp("last_heartbeat", { withTimezone: true }).notNull().defaultNow(),
  uptimeSeconds: integer("uptime_seconds").notNull().default(0),
  alertsTriggered: integer("alerts_triggered").notNull().default(0),
});

export const insertGuardianStateSchema = createInsertSchema(guardianStateTable).omit({ id: true });
export type InsertGuardianState = z.infer<typeof insertGuardianStateSchema>;
export type GuardianState = typeof guardianStateTable.$inferSelect;
