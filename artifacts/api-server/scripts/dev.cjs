const { spawnSync } = require("node:child_process");

const env = { ...process.env, NODE_ENV: process.env.NODE_ENV || "development" };

for (const args of [["run", "build"], ["run", "start"]]) {
  const result = spawnSync("pnpm", args, {
    cwd: process.cwd(),
    env,
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
