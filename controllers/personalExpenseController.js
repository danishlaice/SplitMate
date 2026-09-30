const PersonalExpense = require("../models/PersonalExpense");

// Create Personal Expense
const createPersonalExpense = async (req, res) => {
  try {
    const { amount, description, date, time, merchant, transactionId } = req.body;

    // Validate required fields
    if (!amount || !description || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Please provide amount, description, date, and time",
      });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number greater than 0",
      });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date",
      });
    }

    // Duplicate transaction protection for notifications
    if (transactionId) {
      const existing = await PersonalExpense.findOne({
        user: req.user.id,
        transactionId: transactionId.trim(),
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "An expense for this transaction has already been added",
          expense: existing,
        });
      }
    }

    const expense = await PersonalExpense.create({
      user: req.user.id,
      amount: numAmount,
      description: description.trim(),
      date: parsedDate,
      time: time.trim(),
      merchant: merchant ? merchant.trim() : null,
      transactionId: transactionId ? transactionId.trim() : null,
    });

    res.status(201).json({
      success: true,
      message: "Personal Expense Added Successfully",
      expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create personal expense",
    });
  }
};

// Get All Personal Expenses for current user
const getPersonalExpenses = async (req, res) => {
  try {
    const expenses = await PersonalExpense.find({ user: req.user.id }).sort({
      date: -1,
      createdAt: -1,
    });

    // Calculate monthly total for current calendar month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const monthlyExpenses = expenses.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startOfMonth && itemDate <= endOfMonth;
    });

    const monthlyTotal = monthlyExpenses.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    res.status(200).json({
      success: true,
      count: expenses.length,
      monthlyTotal: Math.round((monthlyTotal + Number.EPSILON) * 100) / 100,
      expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch personal expenses",
    });
  }
};

// Get Single Personal Expense
const getPersonalExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await PersonalExpense.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Personal expense not found",
      });
    }

    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch personal expense",
    });
  }
};

// Update Personal Expense
const updatePersonalExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, date, time, merchant } = req.body;

    const expense = await PersonalExpense.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Personal expense not found",
      });
    }

    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a positive number greater than 0",
        });
      }
      expense.amount = numAmount;
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Description cannot be empty",
        });
      }
      expense.description = description.trim();
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid date",
        });
      }
      expense.date = parsedDate;
    }

    if (time !== undefined) {
      if (!time.trim()) {
        return res.status(400).json({
          success: false,
          message: "Time cannot be empty",
        });
      }
      expense.time = time.trim();
    }

    if (merchant !== undefined) {
      expense.merchant = merchant ? merchant.trim() : null;
    }

    await expense.save();

    res.status(200).json({
      success: true,
      message: "Personal Expense Updated Successfully",
      expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update personal expense",
    });
  }
};

// Delete Personal Expense
const deletePersonalExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await PersonalExpense.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Personal expense not found",
      });
    }

    await PersonalExpense.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Personal Expense Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete personal expense",
    });
  }
};

module.exports = {
  createPersonalExpense,
  getPersonalExpenses,
  getPersonalExpenseById,
  updatePersonalExpense,
  deletePersonalExpense,
};
