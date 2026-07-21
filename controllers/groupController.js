const Group = require("../models/Group");

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

module.exports = {
  createGroup,
  joinGroup,
};