
import express from 'express';
import { addFaculty, getFaculties, addDepartment, getCourses, addCourse, deleteCourse, getLevels, addLevel, uploadClassList, assignClassRep, getAnalytics } from '../controllers/adminController.js';
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
router.delete('/courses/:id', deleteCourse);
router.post('/upload-classlist', uploadClassList);
router.post('/assign-classrep', assignClassRep);
router.get('/analytics', getAnalytics);
export default router;
