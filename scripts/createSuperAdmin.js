require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const superAdminExists = await User.findOne({ userType: 'superAdmin' });
    if (superAdminExists) {
      console.log('Super Admin already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, salt);

    await User.create({
      name: 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      userType: 'superAdmin'
    });

    console.log('Super Admin created successfully');
  } catch (error) {
    console.error('Error creating Super Admin:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createSuperAdmin();

//Super admin pass: SuperAdminPassword
//Admin 1 pass: AdminPassword