import assert from "node:assert/strict";
import test from "node:test";
import { resolveSettings } from "../scripts/settings.mjs";

test("reads resource-prefixed settings and chooses a database-specific Worker name", () => {
  const output = resolveSettings({
    SITE_CLOUDFLARE_ACCOUNT_ID: "account",
    SITE_WORKERS_API_TOKEN: "worker-fixture",
    DATABASE_D1_API_TOKEN: "db-fixture",
    DATABASE_D1_DATABASE_ID: "12345678-1234-1234-1234-123456789abc",
  });
  assert.equal(output.CLOUDFLARE_ACCOUNT_ID, "account");
  assert.equal(output.CLOUDFLARE_WORKERS_API_TOKEN, "worker-fixture");
  assert.equal(output.CLOUDFLARE_D1_API_TOKEN, "db-fixture");
  assert.equal(output.WORKER_NAME, "hello-projects-12345678");
});
test("rejects conflicting account credentials without exposing values", () => {
  assert.throws(
    () =>
      resolveSettings({
        A_CLOUDFLARE_API_TOKEN: "secret-one",
        B_CLOUDFLARE_API_TOKEN: "secret-two",
      }),
    (error) =>
      !error.message.includes("secret-") &&
      error.message.includes("Multiple values"),
  );
});
test("accepts repeated account IDs and explicit overrides", () => {
  assert.equal(
    resolveSettings({
      A_CLOUDFLARE_ACCOUNT_ID: "same",
      B_CLOUDFLARE_ACCOUNT_ID: "same",
    }).CLOUDFLARE_ACCOUNT_ID,
    "same",
  );
  assert.equal(
    resolveSettings({
      CLOUDFLARE_API_TOKEN: "explicit",
      A_CLOUDFLARE_API_TOKEN: "other",
    }).CLOUDFLARE_API_TOKEN,
    "explicit",
  );
});
