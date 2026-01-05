
import express from 'express';
import { 
  addFaculty, getFaculties, deleteFaculty, addDepartment, deleteDepartment,
  getCourses, addCourse, updateCourse, deleteCourse,
  uploadClassList, getClassListSummaries, deleteClassList, assignClassRep, 
  getAllStudents, deleteUser, resetUserPassword, getAllReps, demoteRep,
  getAllActiveSessions, forceEndSession, 
  getLevels, addLevel, deleteLevel,
  getAdmins, createSuperAdmin, getAnalytics
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin'));

// Structure
router.post('/faculties', addFaculty);
router.get('/faculties', getFaculties);
router.delete('/faculties/:id', deleteFaculty);
router.post('/departments', addDepartment);
router.delete('/faculties/:facultyId/departments/:deptId', deleteDepartment);

// Levels
router.get('/levels', getLevels);
router.post('/levels', addLevel);
router.delete('/levels/:id', deleteLevel);

// Courses
router.get('/courses', getCourses);
router.post('/courses', addCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// People
router.get('/students', getAllStudents);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/reset-password', resetUserPassword);
router.post('/upload-classlist', uploadClassList);
router.get('/classlist-summaries', getClassListSummaries);
router.delete('/class-lists', deleteClassList); // New route for bulk delete
router.post('/assign-classrep', assignClassRep);
router.get('/reps', getAllReps);
router.put('/reps/:id/demote', demoteRep);

// Admins
router.get('/admins', getAdmins);
router.post('/admins', createSuperAdmin);

// Sessions
router.get('/sessions', getAllActiveSessions);
router.put('/sessions/:id/end', forceEndSession);

router.get('/analytics', getAnalytics);

export default router;
