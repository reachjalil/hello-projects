import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { visitorHash, visitorId } from "../src/lib/demo.ts";

const schema = readFileSync(
  new URL("../migrations/0001_hello.sql", import.meta.url),
  "utf8",
);
test("migration is repeatable and data persists across reads", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(schema);
  db.exec(schema);
  db.prepare("INSERT INTO hellos (id,visitor_id) VALUES (?,?)").run(
    "one",
    "visitor",
  );
  assert.equal(
    db.prepare("SELECT COUNT(*) AS count FROM hellos").get().count,
    1,
  );
  assert.equal(db.prepare("SELECT id FROM hellos").get().id, "one");
  db.close();
});
test("database enforces per-visitor and shared write limits", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(schema);
  const insert = db.prepare("INSERT INTO hellos (id,visitor_id) VALUES (?,?)");
  for (let i = 0; i < 5; i++) insert.run(`a${i}`, "a");
  assert.throws(() => insert.run("a6", "a"), /DEMO_RATE_LIMIT/);
  for (let i = 5; i < 60; i++) insert.run(`b${i}`, `visitor${i}`);
  assert.throws(() => insert.run("b61", "new"), /DEMO_RATE_LIMIT/);
  db.close();
});
test("retention caps the database at 1000 rows", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(schema);
  const insert = db.prepare(
    "INSERT INTO hellos (id,visitor_id,created_at) VALUES (?,?, '2020-01-01T00:00:00.000Z')",
  );
  for (let i = 0; i < 1005; i++) insert.run(String(i).padStart(5, "0"), "old");
  assert.equal(
    db.prepare("SELECT COUNT(*) AS count FROM hellos").get().count,
    1000,
  );
  db.close();
});
test("invalid cookies are rejected and visitor identifiers are hashed", async () => {
  assert.equal(
    visitorId(
      new Request("https://example.com", {
        headers: { cookie: "hello_visitor=invalid" },
      }),
    ),
    null,
  );
  const id = crypto.randomUUID();
  assert.equal(
    visitorId(
      new Request("https://example.com", {
        headers: { cookie: `other=1; hello_visitor=${id}` },
      }),
    ),
    id,
  );
  const hash = await visitorHash(id);
  assert.equal(hash.length, 64);
  assert.notEqual(hash, id);
  assert.equal(await visitorHash(id), hash);
});
