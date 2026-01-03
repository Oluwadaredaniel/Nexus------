
import express from 'express';
import { 
  createSession, getMySessions, extendSession, endSession, 
  getClassStudents, getRepStats, addStudentToClassList, updateClassListEntry 
} from '../controllers/repController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('class_rep', 'super_admin'));

router.post('/sessions', createSession);
router.get('/sessions', getMySessions);
router.put('/sessions/:id/extend', extendSession);
router.put('/sessions/:id/end', endSession);

// Management
router.get('/students', getClassStudents);
router.get('/stats', getRepStats);
router.post('/class-list', addStudentToClassList);
router.put('/class-list/:id', updateClassListEntry);

export default router;