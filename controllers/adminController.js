const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const getAllUsers = async (req, res) => {
  try {
    // Super Admin can see all users, Admin can only see employees
    const query = req.user.userType === 'superAdmin' 
      ? { userType: { $ne: 'superAdmin' } }
      : { userType: 'employee' };
    
    const users = await User.find(query, '-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  const { name, email, password, userType } = req.body;

  if (userType === 'admin' && req.user.userType !== 'superAdmin') {
    return res.status(403).json({ error: 'Only Super Admin can create admin users' });
  }

  if (userType === 'superAdmin') {
    return res.status(403).json({ error: 'Super Admin cannot be created' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userType
    });
    
    res.status(201).json({ 
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Super Admin cannot be deleted
    if (userToDelete.userType === 'superAdmin') {
      return res.status(403).json({ error: 'Super Admin cannot be deleted' });
    }

    // Regular admin can only delete employees
    if (req.user.userType === 'admin' && userToDelete.userType !== 'employee') {
      return res.status(403).json({ error: 'Unauthorized to delete this user' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAllUsers, createUser, deleteUser };