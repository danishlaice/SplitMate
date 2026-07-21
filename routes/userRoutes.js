const express = require("express");

const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Protected Profile
router.get("/profile", getProfile);
module.exports = router;