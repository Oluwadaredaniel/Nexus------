
import Faculty from '../models/Faculty.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import ClassList from '../models/ClassList.js';
import Attendance from '../models/Attendance.js';

// --- Structure ---
export const addFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.create(req.body);
    res.status(201).json(faculty);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const getFaculties = async (req, res) => {
  const faculties = await Faculty.find({});
  res.json(faculties);
};

export const addDepartment = async (req, res) => {
  const { facultyId, name, options } = req.body;
  try {
    const faculty = await Faculty.findById(facultyId);
    faculty.departments.push({ name, options });
    await faculty.save();
    res.status(201).json(faculty);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- Courses ---
export const getCourses = async (req, res) => {
  const courses = await Course.find({}).sort({ createdAt: -1 });
  res.json(courses);
};

export const addCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- People ---
export const uploadClassList = async (req, res) => {
  // Expects array of students in body.students
  const { students } = req.body;
  try {
    // Bulk upsert to update existing or insert new
    const ops = students.map(s => ({
      updateOne: {
        filter: { regNo: s.regNo },
        update: { $set: s },
        upsert: true
      }
    }));
    await ClassList.bulkWrite(ops);
    res.json({ message: 'Class list uploaded successfully' });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const assignClassRep = async (req, res) => {
  const { regNo } = req.body;
  try {
    const user = await User.findOne({ regNo });
    if (!user) return res.status(404).json({ message: 'User not found. Student must sign up first.' });
    
    user.role = 'class_rep';
    await user.save();
    res.json({ message: `User ${regNo} is now a Class Rep` });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const createSuperAdmin = async (req, res) => {
  const { regNo, password, name } = req.body;
  try {
    const admin = await User.create({ regNo, password, name, role: 'super_admin' });
    res.status(201).json(admin);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- Analytics ---
export const getAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const totalAttendance = await Attendance.countDocuments({ status: 'present' });
    const recentActivity = await Attendance.find().sort({ createdAt: -1 }).limit(5).populate('student', 'name regNo');
    
    res.json({ totalStudents, totalCourses, totalAttendance, recentActivity });
  } catch (error) { res.status(400).json({ message: error.message }); }
};
