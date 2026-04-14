import { Router, type IRouter } from "express";
import { db, tradesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/trades", async (req, res): Promise<void> => {
  const exchange = req.query.exchange as string | undefined;
  const symbol = req.query.symbol as string | undefined;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  let conditions = [];
  if (exchange) conditions.push(eq(tradesTable.exchange, exchange));
  if (symbol) conditions.push(eq(tradesTable.symbol, symbol));

  const data = await db
    .select()
    .from(tradesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(tradesTable.openedAt);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tradesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json({
    data: data.map(t => ({
      id: String(t.id),
      symbol: t.symbol,
      exchange: t.exchange,
      side: t.side,
      quantity: Number(t.quantity),
      entryPrice: Number(t.entryPrice),
      exitPrice: t.exitPrice ? Number(t.exitPrice) : null,
      realizedPnl: t.realizedPnl ? Number(t.realizedPnl) : null,
      fee: Number(t.fee),
      status: t.status,
      openedAt: t.openedAt.toISOString(),
      closedAt: t.closedAt?.toISOString() ?? null,
    })),
    total: Number(count),
    limit,
    offset,
  });
});

router.get("/trades/stats", async (req, res): Promise<void> => {
  const all = await db.select().from(tradesTable);
  const closed = all.filter(t => t.status === "closed");
  const winning = closed.filter(t => t.realizedPnl && Number(t.realizedPnl) > 0);
  const losing = closed.filter(t => t.realizedPnl && Number(t.realizedPnl) < 0);
  const totalPnl = closed.reduce((sum, t) => sum + (t.realizedPnl ? Number(t.realizedPnl) : 0), 0);
  const totalFees = all.reduce((sum, t) => sum + Number(t.fee), 0);
  const pnlValues = closed.map(t => t.realizedPnl ? Number(t.realizedPnl) : 0);

  res.json({
    totalTrades: all.length,
    winningTrades: winning.length,
    losingTrades: losing.length,
    winRate: closed.length > 0 ? Math.round((winning.length / closed.length) * 10000) / 100 : 0,
    totalRealizedPnl: totalPnl,
    avgTradeReturn: closed.length > 0 ? totalPnl / closed.length : 0,
    bestTrade: pnlValues.length > 0 ? Math.max(...pnlValues) : 0,
    worstTrade: pnlValues.length > 0 ? Math.min(...pnlValues) : 0,
    totalFees,
  });
});

export default router;
