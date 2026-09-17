const Expense = require("../models/Expense");
const Group = require("../models/Group");
const Settlement = require("../models/Settlement");

const calculateBalance = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Find the group
    const group = await Group.findById(groupId).populate(
      "members",
      "name email"
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (!group.members || group.members.length === 0) {
      return res.status(200).json({
        success: true,
        balances: {},
        settlements: [],
        history: [],
      });
    }

    // Find all UNSETTLED expenses for this group
    const pendingExpenses = await Expense.find({
      group: groupId,
      isSettled: { $ne: true },
    });

    const balances = {};

    // Initialize balance for each member
    group.members.forEach((member) => {
      const idStr = member._id.toString();
      balances[idStr] = {
        id: member._id,
        name: member.name,
        email: member.email,
        paid: 0,
        owes: 0,
        balance: 0,
      };
    });

    const memberCount = group.members.length;

    // Calculate pending expense totals and equal shares
    pendingExpenses.forEach((expense) => {
      const payerId = expense.paidBy?.toString();
      const amount = Number(expense.amount) || 0;

      if (balances[payerId]) {
        balances[payerId].paid += amount;
      }

      const splitAmount = amount / memberCount;

      group.members.forEach((member) => {
        const memberId = member._id.toString();
        if (balances[memberId]) {
          balances[memberId].owes += splitAmount;
        }
      });
    });

    // Compute net balance from current pending expenses
    Object.keys(balances).forEach((id) => {
      const user = balances[id];
      const net = user.paid - user.owes;
      user.balance = Math.round((net + Number.EPSILON) * 100) / 100;
      if (Math.abs(user.balance) < 0.01) {
        user.balance = 0;
      }
    });

    // Generate suggested settlements for pending balances
    const payers = [];
    const receivers = [];

    Object.values(balances).forEach((user) => {
      if (user.balance < -0.01) {
        payers.push({
          id: user.id,
          name: user.name,
          amount: Math.abs(user.balance),
        });
      } else if (user.balance > 0.01) {
        receivers.push({
          id: user.id,
          name: user.name,
          amount: user.balance,
        });
      }
    });

    const pendingSettlements = [];
    let i = 0;
    let j = 0;

    while (i < payers.length && j < receivers.length) {
      const amount = Math.min(payers[i].amount, receivers[j].amount);
      const roundedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;

      if (roundedAmount >= 0.01) {
        pendingSettlements.push({
          from: payers[i].id,
          to: receivers[j].id,
          amount: roundedAmount,
          expenseIds: pendingExpenses.map((e) => e._id),
        });
      }

      payers[i].amount -= amount;
      receivers[j].amount -= amount;

      if (payers[i].amount < 0.01) i++;
      if (receivers[j].amount < 0.01) j++;
    }

    // Synchronize UNSETTLED settlements in the database:
    const validUnsettledIds = [];

    for (const item of pendingSettlements) {
      const existingMatches = await Settlement.find({
        group: groupId,
        from: item.from,
        to: item.to,
        status: "unsettled",
      }).sort({ createdAt: 1 });

      if (existingMatches.length > 0) {
        const primary = existingMatches[0];
        primary.amount = item.amount;
        primary.expenseIds = item.expenseIds;
        await primary.save();
        validUnsettledIds.push(primary._id);

        // Delete any duplicate unsettled records for the exact same pair
        if (existingMatches.length > 1) {
          const duplicateIds = existingMatches.slice(1).map((s) => s._id);
          await Settlement.deleteMany({ _id: { $in: duplicateIds } });
        }
      } else {
        const created = await Settlement.create({
          group: groupId,
          from: item.from,
          to: item.to,
          amount: item.amount,
          status: "unsettled",
          expenseIds: item.expenseIds,
        });
        validUnsettledIds.push(created._id);
      }
    }

    // Delete any stale unsettled settlements that are no longer valid
    await Settlement.deleteMany({
      group: groupId,
      status: "unsettled",
      _id: { $nin: validUnsettledIds },
    });

    // Fetch active unsettled settlements (current pending debts only)
    const activeSettlements = await Settlement.find({
      group: groupId,
      status: "unsettled",
    })
      .populate("from", "name")
      .populate("to", "name")
      .sort({ createdAt: 1 });

    // Fetch historical settled settlements
    const historicalSettled = await Settlement.find({
      group: groupId,
      status: "settled",
    })
      .populate("from", "name")
      .populate("to", "name")
      .sort({ updatedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      balances,
      settlements: activeSettlements.map((settlement) => ({
        id: settlement._id,
        from: settlement.from?.name || "Unknown",
        to: settlement.to?.name || "Unknown",
        amount: settlement.amount,
        status: settlement.status,
        fromId: settlement.from?._id || settlement.from,
        toId: settlement.to?._id || settlement.to,
        createdAt: settlement.createdAt,
        updatedAt: settlement.updatedAt,
      })),
      history: historicalSettled.map((settlement) => ({
        id: settlement._id,
        from: settlement.from?.name || "Unknown",
        to: settlement.to?.name || "Unknown",
        amount: settlement.amount,
        status: settlement.status,
        fromId: settlement.from?._id || settlement.from,
        toId: settlement.to?._id || settlement.to,
        createdAt: settlement.createdAt,
        updatedAt: settlement.updatedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markSettlementSettled = async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await Settlement.findById(settlementId);

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: "Settlement not found",
      });
    }

    // Only the receiver can mark this settlement as settled
    if (settlement.to.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the receiver can mark this settlement as settled",
      });
    }

    settlement.status = "settled";
    await settlement.save();

    // Mark the settled expenses as settled!
    if (settlement.expenseIds && settlement.expenseIds.length > 0) {
      await Expense.updateMany(
        { _id: { $in: settlement.expenseIds } },
        { isSettled: true }
      );
    } else {
      // Fallback: mark all expenses in this group created up to this settlement as settled
      await Expense.updateMany(
        {
          group: settlement.group,
          createdAt: { $lte: settlement.updatedAt || new Date() },
        },
        { isSettled: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Settlement marked as settled",
      settlement,
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
  markSettlementSettled,
};