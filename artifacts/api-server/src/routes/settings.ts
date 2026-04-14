import { Router, type IRouter } from "express";
import { db, platformSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/settings", async (req, res): Promise<void> => {
  const [settings] = await db.select().from(platformSettingsTable);

  if (!settings) {
    res.json({
      routingMode: "auto",
      defaultLeverage: 1,
      reconciliationInterval: 30,
      guardianHeartbeatInterval: 10,
      notificationsEnabled: true,
      emailAlerts: true,
      auditRetentionDays: 90,
      theme: "dark",
      timezone: "UTC",
    });
    return;
  }

  res.json({
    routingMode: settings.routingMode,
    defaultLeverage: Number(settings.defaultLeverage),
    reconciliationInterval: settings.reconciliationInterval,
    guardianHeartbeatInterval: settings.guardianHeartbeatInterval,
    notificationsEnabled: settings.notificationsEnabled,
    emailAlerts: settings.emailAlerts,
    auditRetentionDays: settings.auditRetentionDays,
    theme: settings.theme,
    timezone: settings.timezone,
  });
});

router.put("/settings", async (req, res): Promise<void> => {
  const body = req.body;
  const [existing] = await db.select().from(platformSettingsTable);

  let updated;
  if (!existing) {
    const [inserted] = await db.insert(platformSettingsTable).values({
      routingMode: body.routingMode ?? "auto",
      defaultLeverage: String(body.defaultLeverage ?? "1"),
      reconciliationInterval: body.reconciliationInterval ?? 30,
      guardianHeartbeatInterval: body.guardianHeartbeatInterval ?? 10,
      notificationsEnabled: body.notificationsEnabled ?? true,
      emailAlerts: body.emailAlerts ?? true,
      auditRetentionDays: body.auditRetentionDays ?? 90,
      theme: body.theme ?? "dark",
      timezone: body.timezone ?? "UTC",
    }).returning();
    updated = inserted;
  } else {
    const updateData: Record<string, unknown> = {};
    if (body.routingMode !== undefined) updateData.routingMode = body.routingMode;
    if (body.defaultLeverage !== undefined) updateData.defaultLeverage = String(body.defaultLeverage);
    if (body.reconciliationInterval !== undefined) updateData.reconciliationInterval = body.reconciliationInterval;
    if (body.guardianHeartbeatInterval !== undefined) updateData.guardianHeartbeatInterval = body.guardianHeartbeatInterval;
    if (body.notificationsEnabled !== undefined) updateData.notificationsEnabled = body.notificationsEnabled;
    if (body.emailAlerts !== undefined) updateData.emailAlerts = body.emailAlerts;
    if (body.auditRetentionDays !== undefined) updateData.auditRetentionDays = body.auditRetentionDays;
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.timezone !== undefined) updateData.timezone = body.timezone;

    const [result] = await db.update(platformSettingsTable).set(updateData).where(eq(platformSettingsTable.id, existing.id)).returning();
    updated = result;
  }

  res.json({
    routingMode: updated.routingMode,
    defaultLeverage: Number(updated.defaultLeverage),
    reconciliationInterval: updated.reconciliationInterval,
    guardianHeartbeatInterval: updated.guardianHeartbeatInterval,
    notificationsEnabled: updated.notificationsEnabled,
    emailAlerts: updated.emailAlerts,
    auditRetentionDays: updated.auditRetentionDays,
    theme: updated.theme,
    timezone: updated.timezone,
  });
});

export default router;
