const express = require("express");

const {
  calculateBalance,
  markSettlementSettled,
} = require("../controllers/balanceController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();



// Mark a specific settlement as settled
router.put(
  "/settlement/:settlementId",
  protect,
  markSettlementSettled
);

// Get Group Balance
router.get("/:groupId", protect, calculateBalance);

module.exports = router;