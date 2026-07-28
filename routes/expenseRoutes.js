const express = require("express");

const {
  addExpense,
  getGroupExpenses,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const {
  calculateBalance,
} = require("../controllers/balanceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/:groupId", protect, getGroupExpenses);
router.put("/update/:expenseId", protect, updateExpense);
router.delete("/delete/:expenseId", protect, deleteExpense);

router.get("/balance/:groupId", protect, calculateBalance);

module.exports = router;