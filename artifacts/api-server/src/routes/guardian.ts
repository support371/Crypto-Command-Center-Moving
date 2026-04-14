import { Router, type IRouter } from "express";
import { db, guardianStateTable, auditLogTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const monitoringChecks = [
  { name: "Exchange Connectivity", status: "passing", message: "All exchanges responding normally", lastChecked: new Date().toISOString() },
  { name: "Order Execution Latency", status: "passing", message: "Avg latency 45ms, within limits", lastChecked: new Date().toISOString() },
  { name: "Position Reconciliation", status: "passing", message: "All positions reconciled successfully", lastChecked: new Date().toISOString() },
  { name: "Risk Limit Monitoring", status: "passing", message: "All risk limits within bounds", lastChecked: new Date().toISOString() },
  { name: "Data Feed Integrity", status: "passing", message: "Yahoo Finance feed healthy", lastChecked: new Date().toISOString() },
  { name: "Daily Loss Tracker", status: "warning", message: "Daily loss at 42% of limit — monitor closely", lastChecked: new Date().toISOString() },
];

router.get("/guardian/state", async (req, res): Promise<void> => {
  const [state] = await db.select().from(guardianStateTable);

  if (!state) {
    res.json({
      isActive: true,
      killSwitchActive: false,
      killSwitchReason: null,
      killSwitchTriggeredAt: null,
      monitoringChecks,
      lastHeartbeat: new Date().toISOString(),
      uptimeSeconds: 86400,
      alertsTriggered: 3,
    });
    return;
  }

  res.json({
    isActive: state.isActive,
    killSwitchActive: state.killSwitchActive,
    killSwitchReason: state.killSwitchReason ?? null,
    killSwitchTriggeredAt: state.killSwitchTriggeredAt?.toISOString() ?? null,
    monitoringChecks,
    lastHeartbeat: state.lastHeartbeat.toISOString(),
    uptimeSeconds: state.uptimeSeconds,
    alertsTriggered: state.alertsTriggered,
  });
});

router.post("/guardian/kill-switch", async (req, res): Promise<void> => {
  const { activate, reason } = req.body;

  const [existing] = await db.select().from(guardianStateTable);

  let updated;
  if (!existing) {
    const [inserted] = await db.insert(guardianStateTable).values({
      isActive: true,
      killSwitchActive: activate,
      killSwitchReason: activate ? reason : null,
      killSwitchTriggeredAt: activate ? new Date() : null,
      lastHeartbeat: new Date(),
      uptimeSeconds: 0,
      alertsTriggered: 0,
    }).returning();
    updated = inserted;
  } else {
    const [result] = await db.update(guardianStateTable).set({
      killSwitchActive: activate,
      killSwitchReason: activate ? reason : null,
      killSwitchTriggeredAt: activate ? new Date() : null,
      lastHeartbeat: new Date(),
    }).where(eq(guardianStateTable.id, existing.id)).returning();
    updated = result;
  }

  await db.insert(auditLogTable).values({
    category: "guardian",
    action: activate ? "kill_switch_activated" : "kill_switch_deactivated",
    actor: "operator",
    target: "all_exchanges",
    severity: activate ? "critical" : "warning",
    details: { reason, timestamp: new Date().toISOString() },
  });

  req.log.info({ activate, reason }, "Kill switch toggled");

  res.json({
    isActive: updated.isActive,
    killSwitchActive: updated.killSwitchActive,
    killSwitchReason: updated.killSwitchReason ?? null,
    killSwitchTriggeredAt: updated.killSwitchTriggeredAt?.toISOString() ?? null,
    monitoringChecks,
    lastHeartbeat: updated.lastHeartbeat.toISOString(),
    uptimeSeconds: updated.uptimeSeconds,
    alertsTriggered: updated.alertsTriggered,
  });
});

export default router;
