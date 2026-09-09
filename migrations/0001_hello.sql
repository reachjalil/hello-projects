-- Anonymous, bounded demo data. No personal information or free-form messages.
CREATE TABLE IF NOT EXISTS hellos (
 id TEXT PRIMARY KEY,
 visitor_id TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS hellos_visitor ON hellos(visitor_id,created_at);
CREATE INDEX IF NOT EXISTS hellos_created ON hellos(created_at);
-- Keep the demo bounded and enforce its rate limit at the database boundary.
CREATE TRIGGER IF NOT EXISTS hello_rate_limit BEFORE INSERT ON hellos
WHEN (SELECT COUNT(*) FROM hellos WHERE created_at > strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 minute')) >= 60
OR (SELECT COUNT(*) FROM hellos WHERE visitor_id=NEW.visitor_id AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 minute')) >= 5
BEGIN SELECT RAISE(ABORT,'DEMO_RATE_LIMIT'); END;
CREATE TRIGGER IF NOT EXISTS hello_retention AFTER INSERT ON hellos
BEGIN DELETE FROM hellos WHERE id NOT IN (SELECT id FROM hellos ORDER BY created_at DESC,id DESC LIMIT 1000); END;
