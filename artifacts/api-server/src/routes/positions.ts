import { Router, type IRouter } from "express";
import { db, positionsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/positions", async (req, res): Promise<void> => {
  const status = (req.query.status as string) || "open";
  const exchange = req.query.exchange as string | undefined;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  let conditions = [];
  if (status !== "all") {
    conditions.push(eq(positionsTable.status, status as "open" | "closed"));
  }
  if (exchange) {
    conditions.push(eq(positionsTable.exchange, exchange));
  }

  const data = await db
    .select()
    .from(positionsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(positionsTable.openedAt);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(positionsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json({
    data: data.map(p => ({
      id: String(p.id),
      symbol: p.symbol,
      exchange: p.exchange,
      side: p.side,
      size: Number(p.size),
      entryPrice: Number(p.entryPrice),
      currentPrice: Number(p.currentPrice),
      unrealizedPnl: Number(p.unrealizedPnl),
      unrealizedPnlPercent: Number(p.unrealizedPnlPercent),
      leverage: Number(p.leverage),
      margin: Number(p.margin),
      status: p.status,
      openedAt: p.openedAt.toISOString(),
      closedAt: p.closedAt?.toISOString() ?? null,
    })),
    total: Number(count),
    limit,
    offset,
  });
});

router.get("/positions/summary", async (req, res): Promise<void> => {
  const openPositions = await db.select().from(positionsTable).where(eq(positionsTable.status, "open"));

  const totalExposure = openPositions.reduce((sum, p) => sum + Number(p.size) * Number(p.currentPrice), 0);
  const totalUnrealizedPnl = openPositions.reduce((sum, p) => sum + Number(p.unrealizedPnl), 0);

  const byExchangeMap = new Map<string, { count: number; exposure: number }>();
  const bySymbolMap = new Map<string, { count: number; pnl: number }>();

  for (const p of openPositions) {
    const exchange = p.exchange;
    const prev = byExchangeMap.get(exchange) || { count: 0, exposure: 0 };
    byExchangeMap.set(exchange, {
      count: prev.count + 1,
      exposure: prev.exposure + Number(p.size) * Number(p.currentPrice),
    });

    const symbol = p.symbol;
    const prevSymbol = bySymbolMap.get(symbol) || { count: 0, pnl: 0 };
    bySymbolMap.set(symbol, {
      count: prevSymbol.count + 1,
      pnl: prevSymbol.pnl + Number(p.unrealizedPnl),
    });
  }

  res.json({
    totalOpenPositions: openPositions.length,
    totalExposure,
    totalUnrealizedPnl,
    byExchange: Array.from(byExchangeMap.entries()).map(([exchange, v]) => ({ exchange, ...v })),
    bySymbol: Array.from(bySymbolMap.entries()).map(([symbol, v]) => ({ symbol, ...v })),
  });
});

export default router;
