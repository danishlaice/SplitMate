const Group = require("../models/Group");
const User = require("../models/User");

// Create Group
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    // Check group name
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    // Create group
    const group = await Group.create({
      name,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json({
      success: true,
      message: "Group Created Successfully",
      group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Join Group
const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if already a member
    if (group.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You are already a member",
      });
    }

    group.members.push(req.user.id);
    await group.save();

    res.status(200).json({
      success: true,
      message: "Joined Group Successfully",
      group,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const addMemberByEmail = async (req, res) => {
  try {
    const { groupId, email } = req.body;

    if (!groupId || !email) {
      return res.status(400).json({
        success: false,
        message: "Group ID and Email are required",
      });
    }

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the group
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if already a member
    if (group.members.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: "User is already a member",
      });
    }

    group.members.push(user._id);
    await group.save();

    res.status(200).json({
      success: true,
      message: "Member added successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get My Groups
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user.id,
    });

    res.status(200).json({
      success: true,
      groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get Group By ID
const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id)
  .populate("members", "name email")
  .populate("createdBy", "name");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getGroups,
  getGroupById,
  addMemberByEmail,
};