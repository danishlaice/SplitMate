const express = require("express");
const { createGroup , joinGroup } = require("../controllers/groupController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create Group (Protected Route)
router.post("/create", protect, createGroup);

// Join Group
router.post("/join", protect, joinGroup);

module.exports = router;