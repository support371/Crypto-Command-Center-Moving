import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const signalsTable = pgTable("signals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  exchange: text("exchange").notNull(),
  direction: text("direction", { enum: ["long", "short", "neutral"] }).notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 2 }).notNull(),
  strength: text("strength", { enum: ["weak", "moderate", "strong"] }).notNull(),
  status: text("status", { enum: ["active", "inactive", "expired"] }).notNull().default("active"),
  source: text("source").notNull(),
  entryZone: numeric("entry_zone", { precision: 20, scale: 8 }).notNull(),
  targetPrice: numeric("target_price", { precision: 20, scale: 8 }).notNull(),
  stopLoss: numeric("stop_loss", { precision: 20, scale: 8 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

export const insertSignalSchema = createInsertSchema(signalsTable).omit({ id: true, createdAt: true });
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signalsTable.$inferSelect;
