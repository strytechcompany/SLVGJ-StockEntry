const express = require("express");
const { requestLogin, verifyLogin, logout } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login/request", requestLogin);
router.post("/login/verify", verifyLogin);
router.post("/logout", logout);

module.exports = router;
