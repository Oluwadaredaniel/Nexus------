
import express from 'express';
import { getActiveSessions, markAttendance, getSessionAttendees, getStudentHistory } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/active', getActiveSessions);
router.post('/:sessionId/mark', markAttendance);
router.get('/session/:id/attendees', getSessionAttendees); // Reps/Admins can see this usually
router.get('/history', getStudentHistory);

export default router;
