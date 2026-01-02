
import express from 'express';
import { 
  addFaculty, getFaculties, addDepartment, 
  getCourses, addCourse, updateCourse, deleteCourse,
  uploadClassList, assignClassRep, createSuperAdmin, getAnalytics,
  getAllStudents, deleteUser, getAllReps, demoteRep,
  getAllActiveSessions, forceEndSession, getLevels, addLevel
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin'));

router.post('/faculties', addFaculty);
router.get('/faculties', getFaculties);
router.post('/departments', addDepartment);
router.get('/levels', getLevels);
router.post('/levels', addLevel);
router.get('/courses', getCourses);
router.post('/courses', addCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// People Management
router.get('/students', getAllStudents);
router.delete('/users/:id', deleteUser);
router.post('/upload-classlist', uploadClassList);
router.post('/assign-classrep', assignClassRep);
router.get('/reps', getAllReps);
router.put('/reps/:id/demote', demoteRep);
router.post('/super-admins', createSuperAdmin);

// Session Management
router.get('/sessions', getAllActiveSessions);
router.put('/sessions/:id/end', forceEndSession);

router.get('/analytics', getAnalytics);

export default router;
