const { createPendingAction, verifyAndConsume } = require("../services/approval.service");
const { createSession, destroy } = require("../services/session.service");
const { logAudit } = require("../services/audit.service");

async function requestLogin(req, res) {
  try {
    const { staffName } = req.body || {};
    const result = await createPendingAction({
      actionType: "login",
      productId: null,
      payload: null,
      requestedBy: staffName || "Staff",
      context: { reason: "Staff login attempt", staffName: staffName || "Staff" },
    });
    return res.status(202).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to start login", details: String(err?.message ?? err) });
  }
}

async function verifyLogin(req, res) {
  try {
    const { pending_id, code } = req.body || {};
    if (!pending_id || !code) return res.status(400).json({ error: "pending_id and code are required" });

    const result = await verifyAndConsume({ pendingId: pending_id, code });
    if (!result.ok) return res.status(400).json(result);
    if (result.actionType !== "login") return res.status(400).json({ ok: false, reason: "mismatch" });

    const session = createSession();
    await logAudit({ actor: "staff", action: "login", details: { pending_id } });
    return res.json({ ok: true, ...session });
  } catch (err) {
    return res.status(500).json({ error: "Failed to verify login", details: String(err?.message ?? err) });
  }
}

async function logout(req, res) {
  const token = req.headers?.authorization?.replace(/^Bearer\s+/i, "");
  if (token) destroy(token);
  return res.json({ ok: true });
}

module.exports = { requestLogin, verifyLogin, logout };
