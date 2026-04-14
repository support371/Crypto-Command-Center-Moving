import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
  const status = (req.query.status as string) || "all";
  const exchange = req.query.exchange as string | undefined;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  let conditions = [];
  if (status !== "all") {
    conditions.push(eq(ordersTable.status, status as "pending" | "filled" | "cancelled"));
  }
  if (exchange) {
    conditions.push(eq(ordersTable.exchange, exchange));
  }

  const data = await db
    .select()
    .from(ordersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(ordersTable.createdAt);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json({
    data: data.map(o => ({
      id: String(o.id),
      symbol: o.symbol,
      exchange: o.exchange,
      type: o.type,
      side: o.side,
      quantity: Number(o.quantity),
      price: o.price ? Number(o.price) : null,
      filledQuantity: Number(o.filledQuantity),
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })),
    total: Number(count),
    limit,
    offset,
  });
});

export default router;
