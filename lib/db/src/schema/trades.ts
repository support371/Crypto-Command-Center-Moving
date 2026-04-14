import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tradesTable = pgTable("trades", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  exchange: text("exchange").notNull(),
  side: text("side", { enum: ["buy", "sell"] }).notNull(),
  quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
  entryPrice: numeric("entry_price", { precision: 20, scale: 8 }).notNull(),
  exitPrice: numeric("exit_price", { precision: 20, scale: 8 }),
  realizedPnl: numeric("realized_pnl", { precision: 20, scale: 8 }),
  fee: numeric("fee", { precision: 20, scale: 8 }).notNull().default("0"),
  status: text("status", { enum: ["open", "closed", "cancelled"] }).notNull().default("open"),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

export const insertTradeSchema = createInsertSchema(tradesTable).omit({ id: true, openedAt: true });
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof tradesTable.$inferSelect;
