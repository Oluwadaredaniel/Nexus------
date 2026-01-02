
import Faculty from '../models/Faculty.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import ClassList from '../models/ClassList.js';
import Attendance from '../models/Attendance.js';
import Level from '../models/Level.js';

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
    faculty.departments.push({ name, options: options.map(o => ({ name: o })) });
    await faculty.save();
    res.status(201).json(faculty);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const uploadClassList = async (req, res) => {
  const { students, context } = req.body;
  try {
    const enriched = students.map(s => ({
      regNo: s.regNo, name: s.name,
      faculty: context.faculty, department: context.department,
      level: context.level, option: context.option || null
    }));

    // Bulk upsert ClassList
    await ClassList.bulkWrite(enriched.map(s => ({
      updateOne: { filter: { regNo: s.regNo }, update: { $set: s }, upsert: true }
    })));

    // Update existing users to match new level/dept
    await User.bulkWrite(enriched.map(s => ({
      updateOne: { 
        filter: { regNo: s.regNo }, 
        update: { $set: { faculty: s.faculty, department: s.department, level: s.level, option: s.option } }
      }
    })));

    res.json({ message: 'Uploaded successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const totalAttendance = await Attendance.countDocuments({ status: 'present' });
    const recentActivity = await Attendance.find().sort({ createdAt: -1 }).limit(5).populate('student', 'name regNo');
    res.json({ totalStudents, totalCourses, totalAttendance, recentActivity });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const assignClassRep = async (req, res) => {
  const { regNo } = req.body;
  try {
    const user = await User.findOne({ regNo });
    if (!user) return res.status(404).json({ message: 'Student not found' });
    user.role = 'class_rep';
    await user.save();
    res.json({ message: 'Promoted to Class Rep' });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// Courses
export const getCourses = async (req, res) => { res.json(await Course.find({}).sort({ createdAt: -1 })); };
export const addCourse = async (req, res) => { res.status(201).json(await Course.create(req.body)); };
export const deleteCourse = async (req, res) => { await Course.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); };

// Levels
export const getLevels = async (req, res) => { res.json(await Level.find({}).sort({ name: 1 })); };
export const addLevel = async (req, res) => { res.status(201).json(await Level.create(req.body)); };
