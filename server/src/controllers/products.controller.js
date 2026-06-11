const ExcelJS = require("exceljs");

const { all, get, run } = require("../db/client");
const { generateCode128PngDataUrl } = require("../utils/barcode");
const { newProductId } = require("../utils/ids");
const { logAudit } = require("../services/audit.service");
const { createPendingAction, verifyAndConsume } = require("../services/approval.service");

// ── Helpers ────────────────────────────────────────────────────────

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toNullableNumber(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toNullableString(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

// In jewelry, gross weight is the total physical weight (gold + stones).
// Stones are inert; net weight (the actual gold) = gross - stone.
function computeNetWeight(gross, stone) {
  const g = toNumber(gross);
  const s = toNumber(stone);
  return Math.max(0, g - s);
}

function buildProductPayload(body, existing = {}) {
  const name = body?.name != null ? String(body.name).trim() : existing.name;
  const gross_weight = body?.gross_weight != null ? toNumber(body.gross_weight) : (existing.gross_weight ?? 0);
  const stone_weight = body?.stone_weight != null ? toNumber(body.stone_weight) : (existing.stone_weight ?? 0);
  const net_weight = computeNetWeight(gross_weight, stone_weight);

  return {
    name,
    gross_weight,
    stone_weight,
    net_weight,
    purity: body?.purity != null ? toNullableString(body.purity) : (existing.purity ?? null),
    buying_cost: body?.buying_cost !== undefined ? toNullableNumber(body.buying_cost) : (existing.buying_cost ?? null),
    bore_rate: body?.bore_rate !== undefined ? toNullableNumber(body.bore_rate) : (existing.bore_rate ?? null),
    supplier_name: body?.supplier_name !== undefined ? toNullableString(body.supplier_name) : (existing.supplier_name ?? null),
    price_per_gram: body?.price_per_gram !== undefined ? toNullableNumber(body.price_per_gram) : (existing.price_per_gram ?? null),
    making_charge: body?.making_charge !== undefined ? toNullableNumber(body.making_charge) : (existing.making_charge ?? null),
  };
}

// ── CREATE ─────────────────────────────────────────────────────────

async function createProduct(req, res) {
  try {
    const product_id = newProductId();
    const barcode = product_id;

    const data = buildProductPayload(req.body);
    if (!data.name) return res.status(400).json({ error: "name is required" });

    const addedBy = req.body?.staffName || null;

    await run(
      `INSERT INTO products (
        product_id, name, barcode,
        gross_weight, stone_weight, net_weight,
        purity, buying_cost, bore_rate, supplier_name,
        price_per_gram, making_charge, stock, status, added_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'in_stock', ?)`,
      [
        product_id, data.name, barcode,
        data.gross_weight, data.stone_weight, data.net_weight,
        data.purity, data.buying_cost, data.bore_rate, data.supplier_name,
        data.price_per_gram, data.making_charge, addedBy,
      ]
    );

    await logAudit({ actor: addedBy || "staff", action: "create", productId: product_id, details: { name: data.name } });

    const created = await get("SELECT * FROM products WHERE product_id = ?", [product_id]);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create product", details: String(err?.message ?? err) });
  }
}

// ── READ ALL ───────────────────────────────────────────────────────

async function getAllProducts(req, res) {
  try {
    const status = String(req.query?.status || "in_stock");
    let rows;
    if (status === "all") {
      rows = await all(`SELECT * FROM products ORDER BY datetime(created_at) DESC`);
    } else {
      rows = await all(`SELECT * FROM products WHERE status = ? ORDER BY datetime(created_at) DESC`, [status]);
    }
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch products", details: String(err?.message ?? err) });
  }
}

// ── READ ONE (by id, fast lookup) ──────────────────────────────────

async function getProductById(req, res) {
  try {
    const id = String(req.params?.id ?? "");
    const row = await get("SELECT * FROM products WHERE product_id = ?", [id]);
    if (!row) return res.status(404).json({ error: "Product not found" });
    const barcodeImage = await generateCode128PngDataUrl(row.barcode);
    return res.json({ ...row, barcodeImage });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch product", details: String(err?.message ?? err) });
  }
}

// ── READ ONE (by barcode) ──────────────────────────────────────────

async function getProductByBarcode(req, res) {
  try {
    const barcode = String(req.params?.barcode ?? "");
    const row =
      (await get("SELECT * FROM products WHERE barcode = ?", [barcode])) ||
      (await get("SELECT * FROM products WHERE product_id = ?", [barcode]));
    if (!row) return res.status(404).json({ error: "Product not found" });
    const barcodeImage = await generateCode128PngDataUrl(row.barcode);
    return res.json({ ...row, barcodeImage });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch product", details: String(err?.message ?? err) });
  }
}

// ── EDIT — request approval ────────────────────────────────────────

async function requestEdit(req, res) {
  try {
    const id = String(req.params?.id ?? "");
    const existing = await get("SELECT * FROM products WHERE product_id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    const proposed = buildProductPayload(req.body, existing);
    if (!proposed.name) return res.status(400).json({ error: "name is required" });

    const staffName = req.body?.staffName || "Staff";
    const result = await createPendingAction({
      actionType: "edit",
      productId: id,
      payload: proposed,
      requestedBy: staffName,
      context: { product_name: existing.name, changes: proposed },
    });
    return res.status(202).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to request edit", details: String(err?.message ?? err) });
  }
}

async function confirmEdit(req, res) {
  try {
    const id = String(req.params?.id ?? "");
    const { pending_id, code } = req.body || {};
    if (!pending_id || !code) return res.status(400).json({ error: "pending_id and code are required" });

    const result = await verifyAndConsume({ pendingId: pending_id, code });
    if (!result.ok) return res.status(400).json(result);
    if (result.actionType !== "edit" || result.productId !== id) {
      return res.status(400).json({ ok: false, reason: "mismatch" });
    }

    const data = result.payload;
    await run(
      `UPDATE products
       SET name=?, gross_weight=?, stone_weight=?, net_weight=?, purity=?,
           buying_cost=?, bore_rate=?, supplier_name=?, price_per_gram=?, making_charge=?,
           updated_at=CURRENT_TIMESTAMP
       WHERE product_id=?`,
      [
        data.name, data.gross_weight, data.stone_weight, data.net_weight, data.purity,
        data.buying_cost, data.bore_rate, data.supplier_name, data.price_per_gram, data.making_charge,
        id,
      ]
    );
    await logAudit({ actor: "owner", action: "edit", productId: id, details: { changes: data } });

    const updated = await get("SELECT * FROM products WHERE product_id = ?", [id]);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to confirm edit", details: String(err?.message ?? err) });
  }
}

// ── DELETE — request approval (soft delete) ────────────────────────

async function requestDelete(req, res) {
  try {
    const id = String(req.params?.id ?? "");
    const existing = await get("SELECT * FROM products WHERE product_id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    const staffName = req.body?.staffName || "Staff";
    const result = await createPendingAction({
      actionType: "delete",
      productId: id,
      payload: null,
      requestedBy: staffName,
      context: { product_name: existing.name, product_id: id },
    });
    return res.status(202).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to request delete", details: String(err?.message ?? err) });
  }
}

async function confirmDelete(req, res) {
  try {
    const id = String(req.params?.id ?? "");
    const { pending_id, code } = req.body || {};
    if (!pending_id || !code) return res.status(400).json({ error: "pending_id and code are required" });

    const result = await verifyAndConsume({ pendingId: pending_id, code });
    if (!result.ok) return res.status(400).json(result);
    if (result.actionType !== "delete" || result.productId !== id) {
      return res.status(400).json({ ok: false, reason: "mismatch" });
    }

    await run(
      `UPDATE products SET status='deleted', deleted_at=CURRENT_TIMESTAMP WHERE product_id=?`,
      [id]
    );
    await logAudit({ actor: "owner", action: "delete", productId: id });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to confirm delete", details: String(err?.message ?? err) });
  }
}

// ── SOLD (called by sale poller — internal) ────────────────────────

async function markSoldFromBilling(productId, billId) {
  await run(
    `UPDATE products SET status='sold', sold_at=CURRENT_TIMESTAMP WHERE product_id=? AND status='in_stock'`,
    [productId]
  );
  await logAudit({
    actor: "billing_app",
    action: "sold",
    productId,
    details: { bill_id: billId || null },
  });
}

// ── DASHBOARD STATS ────────────────────────────────────────────────

async function dashboardStats(_req, res) {
  try {
    const inStock = await get(`SELECT COUNT(*) AS c, COALESCE(SUM(net_weight),0) AS w FROM products WHERE status='in_stock'`);
    const addedToday = await get(`SELECT COUNT(*) AS c FROM products WHERE date(created_at)=date('now','localtime')`);
    const soldToday = await get(`SELECT COUNT(*) AS c FROM products WHERE status='sold' AND date(sold_at)=date('now','localtime')`);
    const pending = await get(`SELECT COUNT(*) AS c FROM pending_actions WHERE status='pending'`);
    return res.json({
      total_in_stock: inStock?.c ?? 0,
      total_weight: Number(inStock?.w ?? 0),
      added_today: addedToday?.c ?? 0,
      sold_today: soldToday?.c ?? 0,
      pending_approvals: pending?.c ?? 0,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load stats", details: String(err?.message ?? err) });
  }
}

// ── XLSX EXPORT ────────────────────────────────────────────────────

async function buildInventoryWorkbook() {
  const inStock = await all(`SELECT * FROM products WHERE status='in_stock' ORDER BY datetime(created_at) DESC`);
  const sold = await all(`SELECT * FROM products WHERE status='sold' ORDER BY datetime(sold_at) DESC`);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Stock Entry";
  wb.created = new Date();

  const HEADER_STYLE = {
    font: { bold: true, color: { argb: "FFFFFFFF" }, size: 11 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFEC4899" } },
    alignment: { vertical: "middle", horizontal: "left" },
  };

  function addProductSheet(name, rows) {
    const sheet = wb.addWorksheet(name);
    sheet.columns = [
      { header: "Item Number",    key: "product_id",    width: 18 },
      { header: "Name",           key: "name",          width: 28 },
      { header: "Gross (g)",      key: "gross_weight",  width: 12 },
      { header: "Stone (g)",      key: "stone_weight",  width: 12 },
      { header: "Net (g)",        key: "net_weight",    width: 12 },
      { header: "Purity",         key: "purity",        width: 10 },
      { header: "Supplier",       key: "supplier_name", width: 22 },
      { header: "Buying Cost",    key: "buying_cost",   width: 14 },
      { header: "Bore Rate",      key: "bore_rate",     width: 12 },
      { header: "Price / g",      key: "price_per_gram",width: 12 },
      { header: "Making Charge",  key: "making_charge", width: 14 },
      { header: "Status",         key: "status",        width: 12 },
      { header: "Created",        key: "created_at",    width: 22 },
      { header: "Sold",           key: "sold_at",       width: 22 },
    ];
    sheet.getRow(1).eachCell((cell) => Object.assign(cell, HEADER_STYLE));
    rows.forEach((r) => sheet.addRow(r));
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    return sheet;
  }

  addProductSheet("In Stock", inStock);
  addProductSheet("Sold", sold);

  const summary = wb.addWorksheet("Summary");
  summary.columns = [{ width: 28 }, { width: 18 }];
  summary.addRow(["Total in stock", inStock.length]);
  summary.addRow(["Total net weight (g)", inStock.reduce((s, r) => s + Number(r.net_weight || 0), 0)]);
  summary.addRow(["Sold (all-time)", sold.length]);
  summary.addRow(["Generated at", new Date().toISOString()]);
  summary.getColumn(1).font = { bold: true };

  return wb;
}

async function exportXLSX(_req, res) {
  try {
    const wb = await buildInventoryWorkbook();
    const buffer = await wb.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="inventory_${Date.now()}.xlsx"`);
    return res.send(Buffer.from(buffer));
  } catch (err) {
    return res.status(500).json({ error: "Failed to export XLSX", details: String(err?.message ?? err) });
  }
}

// Legacy CSV — kept for backward compatibility, not used by the new UI.
async function exportCSV(_req, res) {
  try {
    const rows = await all("SELECT * FROM products WHERE status='in_stock' ORDER BY datetime(created_at) DESC");
    const headers = [
      "Item Number","Product Name","Gross Weight","Stone Weight","Net Weight",
      "Purity","Buying Cost","Bore Rate","Supplier Name","Price/g","Making Charge","Barcode","Date",
    ];
    const csv = [
      headers.join(","),
      ...rows.map((r) => [
        r.product_id,
        `"${(r.name || "").replace(/"/g, '""')}"`,
        r.gross_weight, r.stone_weight, r.net_weight,
        `"${(r.purity || "").replace(/"/g, '""')}"`,
        r.buying_cost ?? "", r.bore_rate ?? "",
        `"${(r.supplier_name || "").replace(/"/g, '""')}"`,
        r.price_per_gram ?? "", r.making_charge ?? "",
        r.barcode, r.created_at,
      ].join(",")),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="inventory_${Date.now()}.csv"`);
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ error: "Failed to export CSV", details: String(err?.message ?? err) });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductByBarcode,
  requestEdit,
  confirmEdit,
  requestDelete,
  confirmDelete,
  markSoldFromBilling,
  dashboardStats,
  exportXLSX,
  exportCSV,
  buildInventoryWorkbook,
};
