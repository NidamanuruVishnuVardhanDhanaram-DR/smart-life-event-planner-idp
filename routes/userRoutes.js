import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
} from '../controllers/userController.js';

import { authMiddleware, adminMiddleware } from '../config/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getUsers);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;
