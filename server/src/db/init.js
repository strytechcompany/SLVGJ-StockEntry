// Reads db/schema.sql once on boot and applies it.
// All CREATE TABLE statements use IF NOT EXISTS so this is idempotent.
const fs = require("fs");
const path = require("path");

const { exec } = require("./client");

const SCHEMA_PATH = path.resolve(__dirname, "..", "..", "..", "db", "schema.sql");

async function initDatabase() {
  const sql = fs.readFileSync(SCHEMA_PATH, "utf8");
  await exec(sql);
}

module.exports = { initDatabase };
