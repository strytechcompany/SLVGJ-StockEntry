// Loads .env once and exposes typed config to the rest of the server.
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const config = {
  apiPort: num(process.env.API_PORT, 3001),

  dbPath: process.env.DB_PATH || "C:/ProgramData/JewelrySuite/gold_system.db",

  email: {
    user: process.env.GMAIL_USER || "",
    password: process.env.GMAIL_APP_PASSWORD || "",
    fromName: process.env.EMAIL_FROM_NAME || "Jewelry Stock Entry",
    ownerEmail: process.env.OWNER_EMAIL || "",
  },

  approval: {
    codeTtlMinutes: num(process.env.CODE_TTL_MINUTES, 10),
    maxAttempts: 5,
  },

  session: {
    ttlHours: num(process.env.SESSION_TTL_HOURS, 8),
  },

  salePollMs: num(process.env.SALE_POLL_MS, 3000),

  printer: {
    name: process.env.LABEL_PRINTER_NAME || "",
  },

  isEmailConfigured() {
    return Boolean(this.email.user && this.email.password && this.email.ownerEmail);
  },
};

module.exports = config;
