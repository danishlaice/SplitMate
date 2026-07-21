const Expense = require("../models/Expense");
const Group = require("../models/Group");

const addExpense = async (req, res) => {
  try {
    const { groupId, description, amount } = req.body;

    // Check all fields
    if (!groupId || !description || !amount) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Find group
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is a member
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Create expense
    const expense = await Expense.create({
      group: groupId,
      paidBy: req.user.id,
      description,
      amount,
    });

    res.status(201).json({
      success: true,
      message: "Expense Added Successfully",
      expense,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalExpenses: expenses.length,
      expenses,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { description, amount } = req.body;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Only the user who created the expense can update it
    if (expense.paidBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this expense",
      });
    }

    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;

    await expense.save();

    res.status(200).json({
      success: true,
      message: "Expense Updated Successfully",
      expense,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    await Expense.findByIdAndDelete(expenseId);

    res.status(200).json({
      success: true,
      message: "Expense Deleted Successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addExpense,
  getGroupExpenses,
  updateExpense,
  deleteExpense,
};