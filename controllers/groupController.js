const Group = require("../models/Group");
const User = require("../models/User");
const Expense = require("../models/Expense");

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

    // Generate unique invite code
    const inviteCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

      console.log("Generated Invite Code:", inviteCode);

    // Create group
    const group = await Group.create({
      name,
      createdBy: req.user.id,
      members: [req.user.id],
      inviteCode,
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
const joinByCode = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const group = await Group.findOne({ inviteCode });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Invalid Invite Code",
      });
    }

    if (!group.members.includes(req.user.id)) {
      group.members.push(req.user.id);
      await group.save();
    }

    res.status(200).json({
      success: true,
      message: "Joined Successfully",
      groupId: group._id,
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
  .populate("createdBy", "_id name");

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
const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Owner cannot leave
    if (group.createdBy.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Group owner cannot leave the group.",
      });
    }

    // Remove member
    group.members = group.members.filter(
      (member) => member.toString() !== req.user.id
    );

    await group.save();

    res.status(200).json({
      success: true,
      message: "Left group successfully.",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Only owner can delete
    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only group owner can delete this group.",
      });
    }

    // Delete all expenses in this group
    await Expense.deleteMany({ group: groupId });

    // Delete group
    await Group.findByIdAndDelete(groupId);

    res.status(200).json({
      success: true,
      message: "Group deleted successfully.",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const joinGroupByCode = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const group = await Group.findOne({ inviteCode });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Invalid Invite Code",
      });
    }

    const alreadyMember = group.members.includes(req.user.id);

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member",
      });
    }

    group.members.push(req.user.id);

    await group.save();

    res.json({
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

module.exports = {
  createGroup,
  joinGroup,
  getGroups,
  getGroupById,
  addMemberByEmail,
  joinGroupByCode,
  joinByCode,
  leaveGroup,
  deleteGroup,
};