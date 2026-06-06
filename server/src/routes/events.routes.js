const express = require("express");
const { recentSales } = require("../controllers/events.controller");

const router = express.Router();

router.get("/recent-sales", recentSales);

module.exports = router;
