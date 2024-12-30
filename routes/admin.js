const express = require('express');
const { authMiddleware, adminMiddleware, superAdminMiddleware } = require('../middleware/auth');
const { 
  getAllUsers, 
  createUser, 
  deleteUser 
} = require('../controllers/adminController');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Only allow admin and superAdmin access
router.use(adminMiddleware);

// Routes for both admin and superAdmin
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);

module.exports = router;