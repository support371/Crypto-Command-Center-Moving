import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const positionsTable = pgTable("positions", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  exchange: text("exchange").notNull(),
  side: text("side", { enum: ["long", "short"] }).notNull(),
  size: numeric("size", { precision: 20, scale: 8 }).notNull(),
  entryPrice: numeric("entry_price", { precision: 20, scale: 8 }).notNull(),
  currentPrice: numeric("current_price", { precision: 20, scale: 8 }).notNull(),
  unrealizedPnl: numeric("unrealized_pnl", { precision: 20, scale: 8 }).notNull().default("0"),
  unrealizedPnlPercent: numeric("unrealized_pnl_percent", { precision: 10, scale: 4 }).notNull().default("0"),
  leverage: numeric("leverage", { precision: 10, scale: 2 }).notNull().default("1"),
  margin: numeric("margin", { precision: 20, scale: 8 }).notNull().default("0"),
  status: text("status", { enum: ["open", "closed"] }).notNull().default("open"),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

export const insertPositionSchema = createInsertSchema(positionsTable).omit({ id: true });
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positionsTable.$inferSelect;
