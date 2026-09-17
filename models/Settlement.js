const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    expenseIds: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense",
  },
],

    status: {
      type: String,
      enum: ["unsettled", "settled"],
      default: "unsettled",
    },
  },
  {
    timestamps: true,
  }
);

settlementSchema.index({ group: 1, status: 1 });
settlementSchema.index({ group: 1, from: 1, to: 1, status: 1 });

module.exports = mongoose.model("Settlement", settlementSchema);