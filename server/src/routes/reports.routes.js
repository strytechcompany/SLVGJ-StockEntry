const express = require("express");
const { runMonthlyNow } = require("../controllers/reports.controller");

const router = express.Router();

router.post("/monthly/run-now", runMonthlyNow);

module.exports = router;
