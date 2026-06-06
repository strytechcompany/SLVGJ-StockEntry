// Single-user, in-memory session store. Tokens expire after config.session.ttlHours.
// Restarting the Electron app wipes sessions, which is the intended behavior
// for a desktop kiosk used by a single staff member.
const config = require("../config");
const { newSessionToken } = require("../utils/ids");

const sessions = new Map(); // token -> { createdAt, expiresAt }

function ttlMs() {
  return config.session.ttlHours * 60 * 60 * 1000;
}

function createSession() {
  const token = newSessionToken();
  const now = Date.now();
  sessions.set(token, { createdAt: now, expiresAt: now + ttlMs() });
  return { token, expiresAt: new Date(now + ttlMs()).toISOString() };
}

function isValid(token) {
  if (!token) return false;
  const entry = sessions.get(token);
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function destroy(token) {
  sessions.delete(token);
}

module.exports = { createSession, isValid, destroy };
