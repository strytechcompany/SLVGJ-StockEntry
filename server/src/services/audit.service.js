// Thin wrapper that writes a row to audit_log without throwing.
// Audit failures should never break the main flow.
const { run } = require("../db/client");

async function logAudit({ actor, action, productId = null, details = null }) {
  try {
    await run(
      `INSERT INTO audit_log (actor, action, product_id, details)
       VALUES (?, ?, ?, ?)`,
      [actor, action, productId, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[audit] failed to write log:", err.message);
  }
}

module.exports = { logAudit };
