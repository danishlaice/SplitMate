const mongoose = require("mongoose");

const personalExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
    },
    // Optional merchant and transaction identifier from payment notifications for duplicate protection
    merchant: {
      type: String,
      trim: true,
      default: null,
    },
    transactionId: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast personal expense queries
personalExpenseSchema.index({ user: 1, date: -1 });
personalExpenseSchema.index({ user: 1, transactionId: 1 });

module.exports = mongoose.model("PersonalExpense", personalExpenseSchema);
