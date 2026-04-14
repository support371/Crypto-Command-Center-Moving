import { Router, type IRouter } from "express";
import { db, riskLimitsTable, positionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/risk/metrics", async (req, res): Promise<void> => {
  const openPositions = await db.select().from(positionsTable).where(eq(positionsTable.status, "open"));

  const totalExposure = openPositions.reduce((sum, p) => sum + Number(p.size) * Number(p.currentPrice), 0);
  const totalPnl = openPositions.reduce((sum, p) => sum + Number(p.unrealizedPnl), 0);

  const concentrationRisk = openPositions.length > 0
    ? Math.max(...Array.from(
        openPositions.reduce((map, p) => {
          const sym = p.symbol;
          const val = Number(p.size) * Number(p.currentPrice);
          map.set(sym, (map.get(sym) || 0) + val);
          return map;
        }, new Map<string, number>()).values()
      )) / Math.max(totalExposure, 1) * 100
    : 0;

  const currentDrawdown = totalPnl < 0 ? Math.abs(totalPnl) / 125000 * 100 : 0;

  let overallRiskLevel = "low";
  if (concentrationRisk > 60 || currentDrawdown > 15) overallRiskLevel = "critical";
  else if (concentrationRisk > 40 || currentDrawdown > 10) overallRiskLevel = "high";
  else if (concentrationRisk > 25 || currentDrawdown > 5) overallRiskLevel = "elevated";
  else if (concentrationRisk > 15 || currentDrawdown > 2) overallRiskLevel = "moderate";

  const alerts = [];
  if (concentrationRisk > 30) {
    alerts.push({
      id: "concentration-1",
      type: "concentration",
      message: `High concentration risk: ${Math.round(concentrationRisk)}% in single asset`,
      severity: "warning",
      triggeredAt: new Date().toISOString(),
    });
  }

  res.json({
    portfolioVaR: Math.round(totalExposure * 0.025 * 100) / 100,
    maxDrawdown: 12.4,
    currentDrawdown: Math.round(currentDrawdown * 100) / 100,
    sharpeRatio: 1.87,
    beta: 0.94,
    correlationBTC: 0.78,
    concentrationRisk: Math.round(concentrationRisk * 100) / 100,
    liquidityScore: 8.2,
    overallRiskLevel,
    alerts,
  });
});

router.get("/risk/limits", async (req, res): Promise<void> => {
  const [limits] = await db.select().from(riskLimitsTable);

  if (!limits) {
    res.status(404).json({ error: "Not found", message: "Risk limits not configured" });
    return;
  }

  res.json({
    maxPositionSize: Number(limits.maxPositionSize),
    maxDailyLoss: Number(limits.maxDailyLoss),
    maxDrawdown: Number(limits.maxDrawdown),
    maxLeverage: Number(limits.maxLeverage),
    maxExposurePercent: Number(limits.maxExposurePercent),
    maxConcentrationPercent: Number(limits.maxConcentrationPercent),
  });
});

router.put("/risk/limits", async (req, res): Promise<void> => {
  const body = req.body;

  const [limits] = await db.select().from(riskLimitsTable);

  let updated;
  if (!limits) {
    const [inserted] = await db.insert(riskLimitsTable).values({
      maxPositionSize: String(body.maxPositionSize ?? 10000),
      maxDailyLoss: String(body.maxDailyLoss ?? 5000),
      maxDrawdown: String(body.maxDrawdown ?? 20),
      maxLeverage: String(body.maxLeverage ?? 10),
      maxExposurePercent: String(body.maxExposurePercent ?? 80),
      maxConcentrationPercent: String(body.maxConcentrationPercent ?? 30),
    }).returning();
    updated = inserted;
  } else {
    const updateData: Record<string, string> = {};
    if (body.maxPositionSize !== undefined) updateData.maxPositionSize = String(body.maxPositionSize);
    if (body.maxDailyLoss !== undefined) updateData.maxDailyLoss = String(body.maxDailyLoss);
    if (body.maxDrawdown !== undefined) updateData.maxDrawdown = String(body.maxDrawdown);
    if (body.maxLeverage !== undefined) updateData.maxLeverage = String(body.maxLeverage);
    if (body.maxExposurePercent !== undefined) updateData.maxExposurePercent = String(body.maxExposurePercent);
    if (body.maxConcentrationPercent !== undefined) updateData.maxConcentrationPercent = String(body.maxConcentrationPercent);

    const [result] = await db.update(riskLimitsTable).set(updateData).where(eq(riskLimitsTable.id, limits.id)).returning();
    updated = result;
  }

  res.json({
    maxPositionSize: Number(updated.maxPositionSize),
    maxDailyLoss: Number(updated.maxDailyLoss),
    maxDrawdown: Number(updated.maxDrawdown),
    maxLeverage: Number(updated.maxLeverage),
    maxExposurePercent: Number(updated.maxExposurePercent),
    maxConcentrationPercent: Number(updated.maxConcentrationPercent),
  });
});

export default router;
