import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { createHash, randomBytes } from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  const salt = "cryptocore_salt_2024";
  return createHash("sha256").update(password + salt).digest("hex");
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Bad request", message: "Email and password required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(sessionsTable).values({
    userId: user.id,
    token,
    expiresAt,
  });

  req.log.info({ userId: user.id }, "User logged in");

  res.json({
    user: {
      id: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: "Bad request", message: "All fields required" });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (existing) {
    res.status(409).json({ error: "Conflict", message: "User already exists" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash: hashPassword(password),
    name,
    role: "trader",
    onboardingCompleted: false,
  }).returning();

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(sessionsTable).values({
    userId: user.id,
    token,
    expiresAt,
  });

  req.log.info({ userId: user.id }, "User registered");

  res.status(201).json({
    user: {
      id: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized", message: "Not authenticated" });
    return;
  }

  const token = authHeader.slice(7);
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.token, token));

  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ error: "Unauthorized", message: "Session expired" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));

  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "User not found" });
    return;
  }

  res.json({
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
