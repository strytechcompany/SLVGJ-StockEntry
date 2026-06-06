const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

function newProductId() {
  return `INV-${uuidv4().slice(0, 8).toUpperCase()}`;
}

function newPendingId() {
  return `PND-${uuidv4().slice(0, 12).toUpperCase()}`;
}

function newSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Random 6-digit numeric code (zero-padded). Avoids leading-zero loss.
function newSixDigitCode() {
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

module.exports = { newProductId, newPendingId, newSessionToken, newSixDigitCode };
