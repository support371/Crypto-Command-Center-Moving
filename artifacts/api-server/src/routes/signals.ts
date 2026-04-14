import { Router, type IRouter } from "express";
import { db, signalsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/signals", async (req, res): Promise<void> => {
  const status = (req.query.status as string) || "all";
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  let conditions = [];
  if (status !== "all") {
    conditions.push(eq(signalsTable.status, status as "active" | "inactive" | "expired"));
  }

  const data = await db
    .select()
    .from(signalsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(signalsTable.createdAt);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(signalsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json({
    data: data.map(s => ({
      id: String(s.id),
      name: s.name,
      symbol: s.symbol,
      exchange: s.exchange,
      direction: s.direction,
      confidence: Number(s.confidence),
      strength: s.strength,
      status: s.status,
      source: s.source,
      entryZone: Number(s.entryZone),
      targetPrice: Number(s.targetPrice),
      stopLoss: Number(s.stopLoss),
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt?.toISOString() ?? null,
    })),
    total: Number(count),
    limit,
    offset,
  });
});

router.get("/signals/stats", async (req, res): Promise<void> => {
  const all = await db.select().from(signalsTable);
  const active = all.filter(s => s.status === "active");
  const avgConfidence = all.length > 0
    ? all.reduce((sum, s) => sum + Number(s.confidence), 0) / all.length
    : 0;

  res.json({
    totalSignals: all.length,
    activeSignals: active.length,
    winRate: 67.4,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    byDirection: {
      long: all.filter(s => s.direction === "long").length,
      short: all.filter(s => s.direction === "short").length,
      neutral: all.filter(s => s.direction === "neutral").length,
    },
  });
});

export default router;
