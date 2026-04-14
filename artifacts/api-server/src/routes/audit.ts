import { Router, type IRouter } from "express";
import { db, auditLogTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/audit", async (req, res): Promise<void> => {
  const category = req.query.category as string | undefined;
  const severity = req.query.severity as string | undefined;
  const limit = parseInt(req.query.limit as string) || 100;
  const offset = parseInt(req.query.offset as string) || 0;

  let conditions = [];
  if (category) conditions.push(eq(auditLogTable.category, category));
  if (severity) conditions.push(eq(auditLogTable.severity, severity as "info" | "warning" | "error" | "critical"));

  const data = await db
    .select()
    .from(auditLogTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(auditLogTable.timestamp);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json({
    data: data.map(entry => ({
      id: String(entry.id),
      timestamp: entry.timestamp.toISOString(),
      category: entry.category,
      action: entry.action,
      actor: entry.actor,
      target: entry.target ?? null,
      severity: entry.severity,
      details: entry.details ?? {},
    })),
    total: Number(count),
    limit,
    offset,
  });
});

export default router;
