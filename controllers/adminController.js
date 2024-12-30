const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  try {
    let query = {};

    switch (req.user.userType) {
      case "superAdmin":
        // Super Admin sees everyone
        query = {};
        break;
      case "admin":
        // Admin sees admins and employees, but not super admins
        query = {
          userType: { $in: ["admin", "employee"] },
        };
        break;
      case "employee":
        // Employees can't access user management
        return res.status(403).json({ error: "Unauthorized access" });
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ userType: 1, name: 1 }); // Sort by userType then name

    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  const { name, email, password, userType } = req.body;

  // Only super admin can create super admin
  if (userType === "superAdmin") {
    return res.status(403).json({ error: "Super Admin cannot be created" });
  }

  try {
    // Verify if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userType,
      active: true
    });

    console.log('User created:', user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
    });
  } catch (error) {
    console.error('Create user error:', error); 
    res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }

    // Super Admin cannot be deleted
    if (userToDelete.userType === "superAdmin") {
      return res.status(403).json({ error: "Super Admin cannot be deleted" });
    }

    // Admin can only deactivate employees
    if (req.user.userType === "admin" && userToDelete.userType !== "employee") {
      return res
        .status(403)
        .json({ error: "Unauthorized to deactivate this user" });
    }

    // Soft delete - set active to false
    await User.findByIdAndUpdate(req.params.id, { active: false });
    res.status(200).json({ message: "User deactivated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAllUsers, createUser, deleteUser };
