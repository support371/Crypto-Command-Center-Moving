const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

const repoRoot = path.resolve(__dirname, "..", "..", "..");
for (const candidate of [
  path.join(repoRoot, ".env.local"),
  path.join(repoRoot, ".env"),
  path.join(process.cwd(), ".env.local"),
  path.join(process.cwd(), ".env"),
]) {
  loadEnvFile(candidate);
}

if (!process.env.PORT) {
  process.env.PORT = "3001";
}

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is missing. Copy .env.example to .env and provide a Postgres connection string before starting the API.",
  );
  process.exit(1);
}

const child = spawn("node", ["--enable-source-maps", "./dist/index.mjs"], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
