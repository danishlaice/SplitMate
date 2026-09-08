const express = require("express");

const {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  resetPassword
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.put("/reset-password/:token", resetPassword);

// Protected Profile
router.get("/profile", getProfile);


module.exports = router;