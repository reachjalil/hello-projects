import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";

// Provider output remains untouched. Explicit aliases live in .env.deploy.
const settings = { ...process.env };
for (const file of [".env", ".env.deploy"]) {
  if (existsSync(file))
    Object.assign(settings, parseEnv(readFileSync(file, "utf8")));
}
function required(key, pattern) {
  const value = settings[key];
  if (!value || (pattern && !pattern.test(value)))
    throw new Error(`Set a valid ${key} in .env.deploy (see README).`);
  return value;
}
function run(args, token) {
  const result = spawnSync("pnpm", args, {
    stdio: "inherit",
    env: { ...settings, ...(token ? { CLOUDFLARE_API_TOKEN: token } : {}) },
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${args[0]} failed (exit ${result.status}).`);
}
function configure() {
  const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
  config.account_id = required("CLOUDFLARE_ACCOUNT_ID", /^[a-f0-9]{32}$/i);
  const id = required(
    "CLOUDFLARE_D1_DATABASE_ID",
    /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i,
  );
  if (id === "00000000-0000-0000-0000-000000000000")
    throw new Error("Use the provisioned D1 ID, not the local placeholder.");
  config.d1_databases[0].database_id = id;
  config.d1_databases[0].database_name =
    settings.CLOUDFLARE_D1_DATABASE_NAME || "hello-projects";
  config.name = required("WORKER_NAME", /^[a-z0-9][a-z0-9-]{0,62}$/);
  if (settings.PUBLIC_SITE_URL) {
    const url = new URL(settings.PUBLIC_SITE_URL);
    if (url.protocol !== "https:" || url.origin !== settings.PUBLIC_SITE_URL)
      throw new Error(
        "PUBLIC_SITE_URL must be an HTTPS origin with no trailing slash.",
      );
    config.vars.PUBLIC_SITE_URL = url.origin;
  }
  writeFileSync("wrangler.local.json", `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o600,
  });
  console.log(
    "Configured the existing Worker and D1 binding in ignored wrangler.local.json.",
  );
}
try {
  switch (process.argv[2]) {
    case "configure":
      configure();
      break;
    case "migrate": {
      configure();
      const token =
        settings.CLOUDFLARE_D1_API_TOKEN || required("CLOUDFLARE_API_TOKEN");
      run(
        [
          "exec",
          "wrangler",
          "d1",
          "migrations",
          "apply",
          "DB",
          "--remote",
          "--config",
          "wrangler.local.json",
        ],
        token,
      );
      break;
    }
    case "deploy": {
      configure();
      const token =
        settings.CLOUDFLARE_WORKERS_API_TOKEN ||
        required("CLOUDFLARE_API_TOKEN");
      run(["build"]);
      run(
        ["exec", "wrangler", "deploy", "--config", "dist/server/wrangler.json"],
        token,
      );
      break;
    }
    case "dry-run":
      run(["build"]);
      run([
        "exec",
        "wrangler",
        "deploy",
        "--config",
        "dist/server/wrangler.json",
        "--dry-run",
      ]);
      break;
    default:
      throw new Error("Use configure, migrate, deploy, or dry-run.");
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
