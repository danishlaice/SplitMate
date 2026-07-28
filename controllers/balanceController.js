const Expense = require("../models/Expense");
const Group = require("../models/Group");

const calculateBalance = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Find the group
    const group = await Group.findById(groupId).populate("members", "name email");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Find all expenses
    const expenses = await Expense.find({ group: groupId });

    const balances = {};

    // Initialize balance for each member
    group.members.forEach((member) => {
      balances[member._id] = {
        name: member.name,
        email: member.email,
        paid: 0,
        owes: 0,
        balance: 0,
      };
    });

    // Calculate paid amount
    expenses.forEach((expense) => {
      balances[expense.paidBy].paid += expense.amount;

      const splitAmount = expense.amount / group.members.length;

      group.members.forEach((member) => {
        balances[member._id].owes += splitAmount;
      });
    });

    // Calculate final balance
    Object.keys(balances).forEach((id) => {
      balances[id].balance =
        balances[id].paid - balances[id].owes;
    });
    // Settlement Suggestions
const payers = [];
const receivers = [];

Object.values(balances).forEach((user) => {
  if (user.balance < 0) {
    payers.push({
      name: user.name,
      amount: Math.abs(user.balance),
    });
  } else if (user.balance > 0) {
    receivers.push({
      name: user.name,
      amount: user.balance,
    });
  }
});

const settlements = [];

let i = 0;
let j = 0;

while (i < payers.length && j < receivers.length) {
  const amount = Math.min(payers[i].amount, receivers[j].amount);

  settlements.push({
    from: payers[i].name,
    to: receivers[j].name,
    amount: Number(amount.toFixed(2)),
  });

  payers[i].amount -= amount;
  receivers[j].amount -= amount;

  if (payers[i].amount < 0.01) i++;
  if (receivers[j].amount < 0.01) j++;
}

    res.status(200).json({
      success: true,
      balances,
      settlements,
      
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  calculateBalance,
};