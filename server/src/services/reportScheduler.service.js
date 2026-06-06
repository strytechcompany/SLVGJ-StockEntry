// Sends a monthly inventory report on the 1st of each month at 09:00 local time.
// The same builder is exposed via POST /reports/monthly/run-now for manual testing.
const cron = require("node-cron");

const { get } = require("../db/client");
const { buildInventoryWorkbook } = require("../controllers/products.controller");
const { sendMonthlyInventoryReport } = require("./email.service");
const { logAudit } = require("./audit.service");

async function buildSummary() {
  const inStock = await get(`SELECT COUNT(*) AS c, COALESCE(SUM(net_weight),0) AS w FROM products WHERE status='in_stock'`);
  const sold = await get(`SELECT COUNT(*) AS c FROM products WHERE status='sold' AND sold_at >= datetime('now','start of month','-1 month') AND sold_at < datetime('now','start of month')`);
  const added = await get(`SELECT COUNT(*) AS c FROM products WHERE created_at >= datetime('now','start of month','-1 month') AND created_at < datetime('now','start of month')`);
  return {
    totalInStock: inStock?.c ?? 0,
    totalWeight: Number(inStock?.w ?? 0),
    soldThisMonth: sold?.c ?? 0,
    addedThisMonth: added?.c ?? 0,
  };
}

function monthLabel(date = new Date()) {
  // Label the report with the *previous* month, since we're sending it on the 1st.
  const d = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

async function runMonthlyReport() {
  const wb = await buildInventoryWorkbook();
  const buffer = await wb.xlsx.writeBuffer();
  const summary = await buildSummary();
  const label = monthLabel();
  const result = await sendMonthlyInventoryReport({ xlsxBuffer: Buffer.from(buffer), summary, monthLabel: label });
  await logAudit({
    actor: "system",
    action: "monthly_report",
    details: { ok: result.ok, label, summary },
  });
  return { ok: result.ok, summary, monthLabel: label };
}

function start() {
  // 09:00 on the 1st of every month, server local time.
  cron.schedule("0 9 1 * *", () => {
    runMonthlyReport().catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[monthly-report] failed:", err.message);
    });
  });
}

module.exports = { start, runMonthlyReport };
