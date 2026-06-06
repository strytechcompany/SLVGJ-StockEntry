// Polls the shared `stock_events` table for unconsumed rows written by the
// Billing app. For each new row we mark the matching product as sold and push
// the event into an in-memory ring buffer that the renderer can pull from
// /events/recent-sales for toast notifications.
const config = require("../config");
const { all, get, run } = require("../db/client");
const productsController = require("../controllers/products.controller");

const RING_SIZE = 100;
const ring = []; // [{ id, product_id, product_name, bill_id, created_at }]
let timer = null;

function pushRing(item) {
  ring.push(item);
  if (ring.length > RING_SIZE) ring.shift();
}

async function pollOnce() {
  const rows = await all(
    `SELECT * FROM stock_events WHERE consumed = 0 ORDER BY id ASC LIMIT 50`
  );
  for (const ev of rows) {
    try {
      const product = await get(`SELECT name FROM products WHERE product_id = ?`, [ev.product_id]);
      if (ev.event_type === "sold") {
        await productsController.markSoldFromBilling(ev.product_id, ev.bill_id);
      }
      await run(`UPDATE stock_events SET consumed = 1 WHERE id = ?`, [ev.id]);
      pushRing({
        id: ev.id,
        event_type: ev.event_type,
        product_id: ev.product_id,
        product_name: product?.name || ev.product_id,
        bill_id: ev.bill_id,
        created_at: ev.created_at,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[salePoller] failed to process event", ev.id, err.message);
    }
  }
}

function start() {
  if (timer) return;
  timer = setInterval(() => {
    pollOnce().catch(() => {});
  }, config.salePollMs);
  timer.unref();
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

function getRecentSince(sinceId = 0) {
  const since = Number(sinceId) || 0;
  return ring.filter((e) => e.id > since);
}

function lastId() {
  return ring.length ? ring[ring.length - 1].id : 0;
}

module.exports = { start, stop, getRecentSince, lastId };
