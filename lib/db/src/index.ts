import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import pg from "pg";
import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

const { Pool } = pg;

const rawDatabaseUrl = process.env.DATABASE_URL?.trim();
const defaultPgliteUrl = "pglite:memory://cryptocore";
const resolvedDatabaseUrl = rawDatabaseUrl || defaultPgliteUrl;
const usingPglite = resolvedDatabaseUrl.startsWith("pglite:");

function hashPassword(password: string): string {
  const salt = "cryptocore_salt_2024";
  return createHash("sha256").update(password + salt).digest("hex");
}

function resolvePglitePath(databaseUrl: string): string {
  const location = databaseUrl.slice("pglite:".length).trim() || "./.local/cryptocore";
  if (
    location === ":memory:" ||
    location === "memory" ||
    location.startsWith("memory://")
  ) {
    return location.startsWith("memory://") ? location : "memory://cryptocore";
  }

  const resolvedPath = path.isAbsolute(location)
    ? location
    : path.resolve(process.cwd(), location);

  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

  return resolvedPath;
}

function createPglite(databaseUrl: string): PGlite {
  const location = databaseUrl.slice("pglite:".length).trim();
  if (
    location === ":memory:" ||
    location === "memory" ||
    location.startsWith("memory://")
  ) {
    return new PGlite(location.startsWith("memory://") ? location : "memory://cryptocore");
  }

  return new PGlite(resolvePglitePath(databaseUrl));
}

const pglite = usingPglite ? createPglite(resolvedDatabaseUrl) : null;
export const pool = usingPglite ? null : new Pool({ connectionString: resolvedDatabaseUrl });
export const db = usingPglite
  ? drizzlePglite(pglite!, { schema })
  : drizzlePg(pool!, { schema });

async function ensurePgliteSchema(): Promise<void> {
  if (!pglite) return;

  const statements = [
    `create table if not exists users (
      id serial primary key,
      email text not null unique,
      password_hash text not null,
      name text not null,
      role text not null default 'trader',
      onboarding_completed boolean not null default false,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )`,
    `create table if not exists sessions (
      id serial primary key,
      user_id integer not null,
      token text not null unique,
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    )`,
    `create table if not exists positions (
      id serial primary key,
      symbol text not null,
      exchange text not null,
      side text not null,
      size numeric(20,8) not null,
      entry_price numeric(20,8) not null,
      current_price numeric(20,8) not null,
      unrealized_pnl numeric(20,8) not null default 0,
      unrealized_pnl_percent numeric(10,4) not null default 0,
      leverage numeric(10,2) not null default 1,
      margin numeric(20,8) not null default 0,
      status text not null default 'open',
      opened_at timestamptz not null default now(),
      closed_at timestamptz
    )`,
    `create table if not exists orders (
      id serial primary key,
      symbol text not null,
      exchange text not null,
      type text not null,
      side text not null,
      quantity numeric(20,8) not null,
      price numeric(20,8),
      filled_quantity numeric(20,8) not null default 0,
      status text not null default 'pending',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )`,
    `create table if not exists signals (
      id serial primary key,
      name text not null,
      symbol text not null,
      exchange text not null,
      direction text not null,
      confidence numeric(5,2) not null,
      strength text not null,
      status text not null default 'active',
      source text not null,
      entry_zone numeric(20,8) not null,
      target_price numeric(20,8) not null,
      stop_loss numeric(20,8) not null,
      created_at timestamptz not null default now(),
      expires_at timestamptz
    )`,
    `create table if not exists trades (
      id serial primary key,
      symbol text not null,
      exchange text not null,
      side text not null,
      quantity numeric(20,8) not null,
      entry_price numeric(20,8) not null,
      exit_price numeric(20,8),
      realized_pnl numeric(20,8),
      fee numeric(20,8) not null default 0,
      status text not null default 'open',
      opened_at timestamptz not null default now(),
      closed_at timestamptz
    )`,
    `create table if not exists audit_log (
      id serial primary key,
      timestamp timestamptz not null default now(),
      category text not null,
      action text not null,
      actor text not null,
      target text,
      severity text not null default 'info',
      details jsonb
    )`,
    `create table if not exists system_logs (
      id serial primary key,
      timestamp timestamptz not null default now(),
      level text not null default 'info',
      source text not null,
      message text not null,
      metadata jsonb
    )`,
    `create table if not exists platform_settings (
      id serial primary key,
      routing_mode text not null default 'auto',
      default_leverage numeric(5,2) not null default 1,
      reconciliation_interval integer not null default 30,
      guardian_heartbeat_interval integer not null default 10,
      notifications_enabled boolean not null default true,
      email_alerts boolean not null default true,
      audit_retention_days integer not null default 90,
      theme text not null default 'dark',
      timezone text not null default 'UTC'
    )`,
    `create table if not exists guardian_state (
      id serial primary key,
      is_active boolean not null default true,
      kill_switch_active boolean not null default false,
      kill_switch_reason text,
      kill_switch_triggered_at timestamptz,
      last_heartbeat timestamptz not null default now(),
      uptime_seconds integer not null default 0,
      alerts_triggered integer not null default 0
    )`,
    `create table if not exists risk_limits (
      id serial primary key,
      max_position_size numeric(20,8) not null default 10000,
      max_daily_loss numeric(20,8) not null default 5000,
      max_drawdown numeric(5,2) not null default 20,
      max_leverage numeric(5,2) not null default 10,
      max_exposure_percent numeric(5,2) not null default 80,
      max_concentration_percent numeric(5,2) not null default 30
    )`,
  ];

  for (const statement of statements) {
    await pglite.exec(statement);
  }
}

async function seedPglite(): Promise<void> {
  if (!usingPglite) return;

  const [{ count: userCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.usersTable);

  if (Number(userCount) > 0) {
    return;
  }

  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  await db.insert(schema.usersTable).values({
    email: "demo@cryptocore.io",
    passwordHash: hashPassword("demo1234"),
    name: "Demo Trader",
    role: "admin",
    onboardingCompleted: true,
    createdAt: new Date(now.getTime() - 14 * day),
    updatedAt: now,
  });

  await db.insert(schema.positionsTable).values([
    {
      symbol: "BTC/USDT",
      exchange: "BTCC",
      side: "long",
      size: "0.85000000",
      entryPrice: "67210.00000000",
      currentPrice: "68450.25000000",
      unrealizedPnl: "1054.71000000",
      unrealizedPnlPercent: "1.84",
      leverage: "2.00",
      margin: "14500.00000000",
      status: "open",
      openedAt: new Date(now.getTime() - 2 * day),
    },
    {
      symbol: "ETH/USDT",
      exchange: "Bitget",
      side: "long",
      size: "12.50000000",
      entryPrice: "3715.00000000",
      currentPrice: "3820.80000000",
      unrealizedPnl: "1322.50000000",
      unrealizedPnlPercent: "2.85",
      leverage: "3.00",
      margin: "15500.00000000",
      status: "open",
      openedAt: new Date(now.getTime() - day),
    },
  ]);

  await db.insert(schema.ordersTable).values([
    {
      symbol: "BTC/USDT",
      exchange: "BTCC",
      type: "limit",
      side: "buy",
      quantity: "0.25000000",
      price: "68000.00000000",
      filledQuantity: "0.00000000",
      status: "pending",
      createdAt: new Date(now.getTime() - 90 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 90 * 60 * 1000),
    },
    {
      symbol: "ETH/USDT",
      exchange: "Bitget",
      type: "market",
      side: "sell",
      quantity: "4.00000000",
      price: null,
      filledQuantity: "4.00000000",
      status: "filled",
      createdAt: new Date(now.getTime() - 3 * day),
      updatedAt: new Date(now.getTime() - 3 * day + 5 * 60 * 1000),
    },
  ]);

  await db.insert(schema.signalsTable).values([
    {
      name: "Breakout Continuation",
      symbol: "BTC/USDT",
      exchange: "BTCC",
      direction: "long",
      confidence: "78.50",
      strength: "strong",
      status: "active",
      source: "Guardian ML",
      entryZone: "67920.00000000",
      targetPrice: "70100.00000000",
      stopLoss: "66840.00000000",
      createdAt: new Date(now.getTime() - 5 * 60 * 1000),
      expiresAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
    },
    {
      name: "Mean Reversion Watch",
      symbol: "SOL/USDT",
      exchange: "Bitget",
      direction: "neutral",
      confidence: "61.20",
      strength: "moderate",
      status: "active",
      source: "Volatility Model",
      entryZone: "176.20000000",
      targetPrice: "182.75000000",
      stopLoss: "171.90000000",
      createdAt: new Date(now.getTime() - 25 * 60 * 1000),
      expiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000),
    },
  ]);

  await db.insert(schema.tradesTable).values([
    {
      symbol: "BTC/USDT",
      exchange: "BTCC",
      side: "buy",
      quantity: "0.50000000",
      entryPrice: "66100.00000000",
      exitPrice: "67380.00000000",
      realizedPnl: "640.00000000",
      fee: "12.40000000",
      status: "closed",
      openedAt: new Date(now.getTime() - 5 * day),
      closedAt: new Date(now.getTime() - 4 * day),
    },
    {
      symbol: "ETH/USDT",
      exchange: "Bitget",
      side: "sell",
      quantity: "8.00000000",
      entryPrice: "3890.00000000",
      exitPrice: "3810.00000000",
      realizedPnl: "640.00000000",
      fee: "18.60000000",
      status: "closed",
      openedAt: new Date(now.getTime() - 8 * day),
      closedAt: new Date(now.getTime() - 7 * day),
    },
    {
      symbol: "SOL/USDT",
      exchange: "BTCC",
      side: "buy",
      quantity: "50.00000000",
      entryPrice: "181.00000000",
      exitPrice: "176.50000000",
      realizedPnl: "-225.00000000",
      fee: "9.20000000",
      status: "closed",
      openedAt: new Date(now.getTime() - 10 * day),
      closedAt: new Date(now.getTime() - 9 * day),
    },
  ]);

  await db.insert(schema.auditLogTable).values([
    {
      category: "system",
      action: "startup_complete",
      actor: "platform",
      target: "command-center",
      severity: "info",
      details: { mode: "pglite", timestamp: now.toISOString() },
      timestamp: new Date(now.getTime() - 20 * 60 * 1000),
    },
    {
      category: "guardian",
      action: "risk_threshold_warning",
      actor: "guardian",
      target: "daily_loss_monitor",
      severity: "warning",
      details: { threshold: 42, limit: 100 },
      timestamp: new Date(now.getTime() - 15 * 60 * 1000),
    },
  ]);

  await db.insert(schema.systemLogsTable).values([
    {
      level: "info",
      source: "api-server",
      message: "Embedded development database initialized",
      metadata: { databaseUrl: resolvedDatabaseUrl },
      timestamp: new Date(now.getTime() - 18 * 60 * 1000),
    },
    {
      level: "warn",
      source: "guardian",
      message: "Daily loss tracker nearing configured threshold",
      metadata: { ratio: 0.42 },
      timestamp: new Date(now.getTime() - 10 * 60 * 1000),
    },
  ]);

  await db.insert(schema.platformSettingsTable).values({
    routingMode: "auto",
    defaultLeverage: "2.00",
    reconciliationInterval: 30,
    guardianHeartbeatInterval: 10,
    notificationsEnabled: true,
    emailAlerts: true,
    auditRetentionDays: 90,
    theme: "dark",
    timezone: "UTC",
  });

  await db.insert(schema.guardianStateTable).values({
    isActive: true,
    killSwitchActive: false,
    killSwitchReason: null,
    killSwitchTriggeredAt: null,
    lastHeartbeat: now,
    uptimeSeconds: 172800,
    alertsTriggered: 3,
  });

  await db.insert(schema.riskLimitsTable).values({
    maxPositionSize: "10000.00000000",
    maxDailyLoss: "5000.00000000",
    maxDrawdown: "20.00",
    maxLeverage: "10.00",
    maxExposurePercent: "80.00",
    maxConcentrationPercent: "30.00",
  });
}

export const dbReady = (async () => {
  if (usingPglite) {
    console.log("[db] Initializing embedded PGlite database...");
    await ensurePgliteSchema();
    console.log("[db] Embedded schema ready.");
    await seedPglite();
    console.log("[db] Embedded seed data ready.");
  }
})();

export * from "./schema";
