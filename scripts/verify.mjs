import assert from "node:assert/strict";

const origin = new URL(process.argv[2] || "http://127.0.0.1:4330").origin;
const get = (path, options = {}) =>
  fetch(`${origin}${path}`, { ...options, signal: AbortSignal.timeout(15000) });
const health = await get("/api/health");
assert.equal(health.status, 200, "Database health must succeed");
assert.equal((await health.json()).database, "connected");
const page = await get("/");
assert.equal(page.status, 200);
const cookie = page.headers
  .getSetCookie()
  .find((value) => value.startsWith("hello_visitor="))
  ?.split(";")[0];
assert.ok(cookie, "Page must initialize the visitor cookie");
const bad = await get("/api/hello", {
  method: "POST",
  headers: { Cookie: cookie, Origin: "https://example.invalid" },
  redirect: "manual",
});
assert.equal(bad.status, 403, "Cross-origin write must be rejected");
const saved = await get("/api/hello", {
  method: "POST",
  headers: { Cookie: cookie, Origin: origin },
  redirect: "manual",
});
assert.equal(saved.status, 303);
const location = saved.headers.get("location");
const id = new URL(location, origin).searchParams.get("saved");
assert.ok(id, `Expected a saved record, got ${location}`);
for (const path of [location, "/", "/"]) {
  const response = await get(path, { headers: { Cookie: cookie } });
  assert.equal(response.status, 200);
  assert.ok(
    (await response.text()).includes(`data-record-id="${id}"`),
    "Record must survive a fresh server request",
  );
}
const other = await get("/");
assert.ok(
  !(await other.text()).includes(`data-record-id="${id}"`),
  "A different visitor must not see this record",
);
console.log(
  `PASS: ${origin} — D1 health, origin protection, insert, two reloads, visitor isolation. Record: ${id}`,
);
