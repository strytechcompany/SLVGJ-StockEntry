const reportScheduler = require("../services/reportScheduler.service");

async function runMonthlyNow(_req, res) {
  try {
    const result = await reportScheduler.runMonthlyReport();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to run monthly report", details: String(err?.message ?? err) });
  }
}

module.exports = { runMonthlyNow };
