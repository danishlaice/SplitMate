const express = require("express");
const { createGroup , joinGroup , getGroups , getGroupById , addMemberByEmail , joinGroupByCode , joinByCode , leaveGroup , deleteGroup} = require("../controllers/groupController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create Group (Protected Route)
router.post("/create", protect, createGroup);

// Join Group
router.post("/join", protect, joinGroup);

router.get("/", protect, getGroups);

router.get("/:id", protect, getGroupById);

router.post("/add-member", protect, addMemberByEmail);

router.post("/join-by-code", protect, joinGroupByCode);

router.post("/join-by-code", protect, joinByCode);

router.post("/leave", protect, leaveGroup);

router.delete("/delete", protect, deleteGroup);


module.exports = router;