// Owner-approval flow.
//
//   1. Staff triggers a sensitive action (login / edit / delete).
//   2. createPendingAction() generates a 6-digit code, stores its sha256 in
//      pending_actions, and emails the plaintext code to the owner.
//   3. Staff types the code into the UI.
//   4. verifyAndConsume() checks the hash, marks the row approved, and
//      returns the original payload so the caller can apply the change.
const config = require("../config");
const { run, get } = require("../db/client");
const { sha256, safeEqual } = require("../utils/hash");
const { newPendingId, newSixDigitCode } = require("../utils/ids");
const { sendApprovalCode } = require("./email.service");
const { logAudit } = require("./audit.service");

const TTL_MS = config.approval.codeTtlMinutes * 60 * 1000;

async function createPendingAction({ actionType, productId = null, payload = null, requestedBy = "staff", context = null }) {
  const id = newPendingId();
  const code = newSixDigitCode();
  const codeHash = sha256(code);
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString();

  await run(
    `INSERT INTO pending_actions
       (id, action_type, product_id, payload, code_hash, expires_at, status, requested_by)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [id, actionType, productId, payload ? JSON.stringify(payload) : null, codeHash, expiresAt, requestedBy]
  );

  const emailResult = await sendApprovalCode({
    purpose: actionType,
    code,
    context: context || (productId ? { product_id: productId } : null),
  });

  await logAudit({
    actor: "staff",
    action: `request_${actionType}`,
    productId,
    details: { pending_id: id, email_sent: emailResult.ok },
  });

  return {
    pendingId: id,
    expiresAt,
    emailOk: emailResult.ok,
    // Surface the code in the response only when email isn't configured —
    // lets the developer test the flow without setting up SMTP.
    devCode: emailResult.fallback ? code : undefined,
  };
}

async function verifyAndConsume({ pendingId, code }) {
  const row = await get(`SELECT * FROM pending_actions WHERE id = ?`, [pendingId]);
  if (!row) return { ok: false, reason: "not_found" };
  if (row.status !== "pending") return { ok: false, reason: row.status };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await run(`UPDATE pending_actions SET status='expired', resolved_at=CURRENT_TIMESTAMP WHERE id=?`, [pendingId]);
    return { ok: false, reason: "expired" };
  }

  const expected = row.code_hash;
  const got = sha256(code);
  if (!safeEqual(expected, got)) {
    const attempts = (row.attempts || 0) + 1;
    if (attempts >= config.approval.maxAttempts) {
      await run(
        `UPDATE pending_actions SET attempts=?, status='rejected', resolved_at=CURRENT_TIMESTAMP WHERE id=?`,
        [attempts, pendingId]
      );
      await logAudit({ actor: "system", action: "reject", productId: row.product_id, details: { pending_id: pendingId, reason: "max_attempts" } });
      return { ok: false, reason: "too_many_attempts" };
    }
    await run(`UPDATE pending_actions SET attempts=? WHERE id=?`, [attempts, pendingId]);
    return { ok: false, reason: "wrong_code", attemptsRemaining: config.approval.maxAttempts - attempts };
  }

  await run(
    `UPDATE pending_actions SET status='approved', resolved_at=CURRENT_TIMESTAMP WHERE id=?`,
    [pendingId]
  );
  await logAudit({
    actor: "owner",
    action: "approve",
    productId: row.product_id,
    details: { pending_id: pendingId, action_type: row.action_type },
  });

  let payload = null;
  try { payload = row.payload ? JSON.parse(row.payload) : null; } catch { /* ignore */ }

  return { ok: true, actionType: row.action_type, productId: row.product_id, payload };
}

async function listPending() {
  return get && (await require("../db/client").all(
    `SELECT
       pa.id, pa.action_type, pa.product_id, pa.status,
       pa.attempts, pa.expires_at, pa.created_at, pa.resolved_at,
       pa.requested_by,
       COALESCE(
         (SELECT COUNT(*) FROM products p
          WHERE p.added_by = pa.requested_by AND p.status != 'deleted'),
         0
       ) AS items_added
     FROM pending_actions pa
     ORDER BY pa.created_at DESC
     LIMIT 100`
  ));
}

// Background sweeper — marks expired pending rows so the queue stays clean.
function startSweeper() {
  setInterval(async () => {
    try {
      await run(
        `UPDATE pending_actions
         SET status='expired', resolved_at=CURRENT_TIMESTAMP
         WHERE status='pending' AND expires_at < datetime('now')`
      );
    } catch {
      // ignore
    }
  }, 60 * 1000).unref();
}

module.exports = { createPendingAction, verifyAndConsume, listPending, startSweeper };
