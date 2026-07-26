const express = require("express");
const cors = require("cors"); 

const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const balanceRoutes = require("./routes/balanceRoutes");

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.send("Welcome to SplitMate API");
});

// User Routes
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/balance", balanceRoutes);

module.exports = app;