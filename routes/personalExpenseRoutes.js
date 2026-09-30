const express = require("express");
const {
  createPersonalExpense,
  getPersonalExpenses,
  getPersonalExpenseById,
  updatePersonalExpense,
  deletePersonalExpense,
} = require("../controllers/personalExpenseController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All routes are protected and scoped to the logged-in user
router.use(protect);

router
  .route("/")
  .post(createPersonalExpense)
  .get(getPersonalExpenses);

router
  .route("/:id")
  .get(getPersonalExpenseById)
  .put(updatePersonalExpense)
  .delete(deletePersonalExpense);

module.exports = router;
