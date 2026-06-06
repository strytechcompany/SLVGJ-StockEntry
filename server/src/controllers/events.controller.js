const salePoller = require("../services/salePoller.service");

function recentSales(req, res) {
  const since = Number(req.query?.since) || 0;
  const items = salePoller.getRecentSince(since);
  return res.json({ since, last: salePoller.lastId(), items });
}

module.exports = { recentSales };
