
import express from 'express';
import { 
  addFaculty, getFaculties, addDepartment, 
  getCourses, addCourse, updateCourse, deleteCourse,
  uploadClassList, assignClassRep, createSuperAdmin, getAnalytics
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin'));

router.post('/faculties', addFaculty);
router.get('/faculties', getFaculties);
router.post('/departments', addDepartment);
router.get('/courses', getCourses);
router.post('/courses', addCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
router.post('/upload-classlist', uploadClassList);
router.post('/assign-classrep', assignClassRep);
router.post('/super-admins', createSuperAdmin);
router.get('/analytics', getAnalytics);

export default router;
