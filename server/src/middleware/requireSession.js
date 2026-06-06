const { isValid } = require("../services/session.service");

function requireSession(req, res, next) {
  const auth = req.headers?.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!isValid(token)) {
    return res.status(401).json({ error: "unauthorized" });
  }
  return next();
}

module.exports = requireSession;
