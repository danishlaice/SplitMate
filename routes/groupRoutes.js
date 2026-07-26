const express = require("express");
const { createGroup , joinGroup , getGroups , getGroupById , addMemberByEmail} = require("../controllers/groupController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create Group (Protected Route)
router.post("/create", protect, createGroup);

// Join Group
router.post("/join", protect, joinGroup);

router.get("/", protect, getGroups);

router.get("/:id", protect, getGroupById);

router.post("/add-member", protect, addMemberByEmail);

module.exports = router;