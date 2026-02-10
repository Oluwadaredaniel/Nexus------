
import express from 'express';
import { signup, login, changePassword, getMe, getAcademicData, updateProfile, getPublicStats, verifyStudent } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/verify', verifyStudent); // New route for "Claim Identity" flow
router.post('/signup', signup);
router.post('/login', login);
router.post('/change-password', protect, changePassword);
router.put('/profile', protect, updateProfile); 
router.get('/me', protect, getMe);
router.get('/academic-data', getAcademicData);
router.get('/stats', getPublicStats);

export default router;