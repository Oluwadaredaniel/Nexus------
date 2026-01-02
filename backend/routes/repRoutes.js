
import express from 'express';
import { createSession, getMySessions, extendSession, endSession, getClassStudents } from '../controllers/repController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('class_rep', 'super_admin'));

router.post('/sessions', createSession);
router.get('/sessions', getMySessions);
router.get('/students', getClassStudents);
router.put('/sessions/:id/extend', extendSession);
router.put('/sessions/:id/end', endSession);

export default router;
