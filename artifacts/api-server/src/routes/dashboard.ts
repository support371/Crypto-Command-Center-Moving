import { Router, type IRouter } from "express";
import { db, positionsTable, ordersTable, tradesTable, guardianStateTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const [guardian] = await db.select().from(guardianStateTable);

  const openPositions = await db.select().from(positionsTable).where(eq(positionsTable.status, "open"));
  const openOrders = await db.select().from(ordersTable).where(eq(ordersTable.status, "pending"));

  const totalUnrealizedPnl = openPositions.reduce((sum, p) => sum + Number(p.unrealizedPnl), 0);
  const totalExposure = openPositions.reduce((sum, p) => sum + Number(p.size) * Number(p.currentPrice), 0);

  const closedTrades = await db.select().from(tradesTable).where(eq(tradesTable.status, "closed"));
  const totalRealizedPnl = closedTrades.reduce((sum, t) => sum + (t.realizedPnl ? Number(t.realizedPnl) : 0), 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTrades = closedTrades.filter(t => t.closedAt && t.closedAt >= today);
  const dailyPnl = todayTrades.reduce((sum, t) => sum + (t.realizedPnl ? Number(t.realizedPnl) : 0), 0);

  const btccPositions = openPositions.filter(p => p.exchange === "BTCC");
  const bitgetPositions = openPositions.filter(p => p.exchange === "Bitget");

  const totalBalance = 125000;
  const availableBalance = totalBalance - totalExposure * 0.1;
  const exposurePercent = totalBalance > 0 ? (totalExposure / totalBalance) * 100 : 0;
  const dailyPnlPercent = totalBalance > 0 ? (dailyPnl / totalBalance) * 100 : 0;

  res.json({
    totalBalance,
    availableBalance,
    totalExposure,
    exposurePercent: Math.round(exposurePercent * 100) / 100,
    realizedPnl: totalRealizedPnl,
    unrealizedPnl: totalUnrealizedPnl,
    dailyPnl,
    dailyPnlPercent: Math.round(dailyPnlPercent * 100) / 100,
    totalPositions: openPositions.length,
    openOrders: openOrders.length,
    systemStatus: guardian?.killSwitchActive ? "halted" : "operational",
    guardianActive: guardian?.isActive ?? true,
    killSwitchActive: guardian?.killSwitchActive ?? false,
    routingMode: "auto",
    exchangesSummary: [
      {
        id: "btcc",
        name: "BTCC",
        status: "connected",
        balance: 75000 + btccPositions.reduce((s, p) => s + Number(p.unrealizedPnl), 0),
        isPrimary: true,
      },
      {
        id: "bitget",
        name: "Bitget",
        status: "connected",
        balance: 50000 + bitgetPositions.reduce((s, p) => s + Number(p.unrealizedPnl), 0),
        isPrimary: false,
      },
      {
        id: "forex",
        name: "Forex.com",
        status: "connected",
        balance: 0,
        isPrimary: false,
      },
    ],
    lastUpdated: new Date().toISOString(),
  });
});

router.get("/dashboard/pnl-chart", async (req, res): Promise<void> => {
  const period = (req.query.period as string) || "7d";
  const days = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90;

  const points = [];
  let cumulative = 0;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayRealized = (Math.random() - 0.4) * 800;
    const dayUnrealized = (Math.random() - 0.45) * 400;
    cumulative += dayRealized;

    points.push({
      date: dateStr,
      realizedPnl: Math.round(dayRealized * 100) / 100,
      unrealizedPnl: Math.round(dayUnrealized * 100) / 100,
      cumulativePnl: Math.round(cumulative * 100) / 100,
    });
  }

  res.json(points);
});

export default router;
