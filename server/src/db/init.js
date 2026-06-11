// Reads db/schema.sql once on boot and applies it.
// All CREATE TABLE statements use IF NOT EXISTS so this is idempotent.
const fs = require("fs");
const path = require("path");

const { exec } = require("./client");

const SCHEMA_PATH = path.resolve(__dirname, "..", "..", "..", "db", "schema.sql");

async function initDatabase() {
  const sql = fs.readFileSync(SCHEMA_PATH, "utf8");
  await exec(sql);

  // Migrations — add columns that didn't exist in earlier schema versions.
  // SQLite doesn't support IF NOT EXISTS on ALTER TABLE, so we catch the error.
  const migrations = [
    `ALTER TABLE products ADD COLUMN added_by TEXT`,
  ];
  for (const m of migrations) {
    try { await exec(m); } catch { /* column already exists — safe to ignore */ }
  }
}

module.exports = { initDatabase };
