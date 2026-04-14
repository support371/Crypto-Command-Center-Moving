import { pgTable, serial, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const riskLimitsTable = pgTable("risk_limits", {
  id: serial("id").primaryKey(),
  maxPositionSize: numeric("max_position_size", { precision: 20, scale: 8 }).notNull().default("10000"),
  maxDailyLoss: numeric("max_daily_loss", { precision: 20, scale: 8 }).notNull().default("5000"),
  maxDrawdown: numeric("max_drawdown", { precision: 5, scale: 2 }).notNull().default("20"),
  maxLeverage: numeric("max_leverage", { precision: 5, scale: 2 }).notNull().default("10"),
  maxExposurePercent: numeric("max_exposure_percent", { precision: 5, scale: 2 }).notNull().default("80"),
  maxConcentrationPercent: numeric("max_concentration_percent", { precision: 5, scale: 2 }).notNull().default("30"),
});

export const insertRiskLimitsSchema = createInsertSchema(riskLimitsTable).omit({ id: true });
export type InsertRiskLimits = z.infer<typeof insertRiskLimitsSchema>;
export type RiskLimits = typeof riskLimitsTable.$inferSelect;
