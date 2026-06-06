// SQLite client wrapped with promise helpers.
// Database file lives at config.dbPath (default C:/ProgramData/JewelrySuite/gold_system.db)
// so all 3 desktop apps in the suite can share it.
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const config = require("../config");

// Make sure the parent directory exists before sqlite tries to open the file.
fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

const db = new sqlite3.Database(config.dbPath);

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA synchronous = NORMAL;");
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Run multiple statements in a row inside one serialize block.
function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => (err ? reject(err) : resolve()));
  });
}

module.exports = { db, run, get, all, exec, DB_PATH: config.dbPath };
