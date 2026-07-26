const express = require("express");

const { addExpense , getGroupExpenses , updateExpense , deleteExpense , calculateBalance} = require("../controllers/expenseController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add Expense
router.post("/add", protect, addExpense);

router.get("/:groupId", protect, getGroupExpenses);

router.put("/update/:expenseId", protect, updateExpense);

router.delete("/delete/:expenseId", protect, deleteExpense);

router.get("/balance/:groupId", protect, calculateBalance);

module.exports = router;