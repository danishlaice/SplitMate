const dotenv = require("dotenv");

// Load .env variables FIRST
dotenv.config();

const connectDB = require("./config/db");
const app = require("./app");

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});