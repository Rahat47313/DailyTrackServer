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

// Super admin routes
router.get('/users', superAdminMiddleware, getAllUsers);
router.post('/users', superAdminMiddleware, createUser);
router.delete('/users/:id', superAdminMiddleware, deleteUser);

// Admin routes (for managing employees only)
router.get('/employees', adminMiddleware, getAllUsers);
router.post('/employees', adminMiddleware, createUser);
router.delete('/employees/:id', adminMiddleware, deleteUser);

module.exports = router;