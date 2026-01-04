
import express from 'express';
import { 
  createSession, getMySessions, extendSession, endSession, 
  getClassStudents, getRepStats, addStudentToClassList, updateClassListEntry,
  getAvailableCourses 
} from '../controllers/repController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
// Allow all rep types + super admin
router.use(authorize('class_rep', 'dept_rep', 'faculty_rep', 'super_admin'));

router.post('/sessions', createSession);
router.get('/sessions', getMySessions);
router.get('/courses', getAvailableCourses); // New route for context-aware courses
router.put('/sessions/:id/extend', extendSession);
router.put('/sessions/:id/end', endSession);

// Management
router.get('/students', getClassStudents);
router.get('/stats', getRepStats);
router.post('/class-list', addStudentToClassList);
router.put('/class-list/:id', updateClassListEntry);

export default router;
