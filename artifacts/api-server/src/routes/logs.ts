import { Router, type IRouter } from "express";
import { db, systemLogsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/logs", async (req, res): Promise<void> => {
  const level = req.query.level as string | undefined;
  const source = req.query.source as string | undefined;
  const limit = parseInt(req.query.limit as string) || 100;
  const offset = parseInt(req.query.offset as string) || 0;

  let conditions = [];
  if (level) conditions.push(eq(systemLogsTable.level, level as "debug" | "info" | "warn" | "error"));
  if (source) conditions.push(eq(systemLogsTable.source, source));

  const data = await db
    .select()
    .from(systemLogsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(systemLogsTable.timestamp);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(systemLogsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json({
    data: data.map(log => ({
      id: String(log.id),
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      source: log.source,
      message: log.message,
      metadata: log.metadata ?? {},
    })),
    total: Number(count),
    limit,
    offset,
  });
});

export default router;
