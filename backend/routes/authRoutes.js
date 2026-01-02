
import express from 'express';
import { signup, login, changePassword, getMe, getAcademicData } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/change-password', protect, changePassword);
router.get('/me', protect, getMe);
router.get('/academic-data', getAcademicData);

export default router;
