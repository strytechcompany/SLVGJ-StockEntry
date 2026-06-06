const express = require("express");
const c = require("../controllers/products.controller");
const { listPending } = require("../services/approval.service");

const router = express.Router();

// Specific routes BEFORE param-catching ones.
router.get("/stats", c.dashboardStats);
router.get("/export/xlsx", c.exportXLSX);
router.get("/export/csv", c.exportCSV);

router.get("/pending", async (_req, res) => {
  try {
    const rows = await listPending();
    return res.json(rows || []);
  } catch (err) {
    return res.status(500).json({ error: "Failed to list pending", details: String(err?.message ?? err) });
  }
});

router.get("/", c.getAllProducts);
router.post("/", c.createProduct);

router.get("/by-barcode/:barcode", c.getProductByBarcode);

router.get("/:id", c.getProductById);

router.post("/:id/edit/request",   c.requestEdit);
router.post("/:id/edit/confirm",   c.confirmEdit);
router.post("/:id/delete/request", c.requestDelete);
router.post("/:id/delete/confirm", c.confirmDelete);

module.exports = router;
