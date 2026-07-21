const express = require("express");

const { calculateBalance } = require("../controllers/balanceController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get Group Balance
router.get("/:groupId", protect, calculateBalance);

module.exports = router;