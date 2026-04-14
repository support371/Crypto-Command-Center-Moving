import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  exchange: text("exchange").notNull(),
  type: text("type", { enum: ["market", "limit", "stop", "stop-limit"] }).notNull(),
  side: text("side", { enum: ["buy", "sell"] }).notNull(),
  quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
  price: numeric("price", { precision: 20, scale: 8 }),
  filledQuantity: numeric("filled_quantity", { precision: 20, scale: 8 }).notNull().default("0"),
  status: text("status", { enum: ["pending", "filled", "partially_filled", "cancelled", "rejected"] }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
