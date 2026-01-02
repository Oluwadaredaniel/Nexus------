
import Faculty from '../models/Faculty.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import ClassList from '../models/ClassList.js';
import Attendance from '../models/Attendance.js';
import Level from '../models/Level.js';

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
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    // Format options from array of strings to array of objects
    const formattedOptions = Array.isArray(options) 
      ? options.map(opt => ({ name: opt })) 
      : [];

    faculty.departments.push({ name, options: formattedOptions });
    await faculty.save();
    res.status(201).json(faculty);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- Levels ---
export const addLevel = async (req, res) => {
  try {
    const level = await Level.create(req.body);
    res.status(201).json(level);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const getLevels = async (req, res) => {
  try {
    const levels = await Level.find({}).sort({ name: 1 });
    res.json(levels);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deleteLevel = async (req, res) => {
  try {
    await Level.findByIdAndDelete(req.params.id);
    res.json({ message: 'Level deleted' });
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
  const { students, context } = req.body; 
  // Context MUST contain: { faculty, department, level, option (optional) }
  
  if (!students || !Array.isArray(students)) {
    return res.status(400).json({ message: 'Invalid students data' });
  }

  if (!context || !context.faculty || !context.department || !context.level) {
    return res.status(400).json({ message: 'Missing academic context (Faculty, Dept, Level)' });
  }

  try {
    // 1. Enforce Context Binding
    // We ignore Excel columns for Faculty/Dept/Level/Option. We use the Context.
    const enrichedStudents = students
      .filter(s => s.regNo && s.name) // Simple validation
      .map(s => ({
        regNo: s.regNo,
        name: s.name,
        faculty: context.faculty,
        department: context.department,
        level: context.level,
        option: context.option || null, // Option is null if not provided
      }));

    if (enrichedStudents.length === 0) {
      return res.status(400).json({ message: 'No valid student records (RegNo, Name) found in file.' });
    }

    // 2. Bulk Write (Upsert)
    const classListOps = enrichedStudents.map(s => ({
      updateOne: {
        filter: { regNo: s.regNo },
        update: { $set: s },
        upsert: true
      }
    }));
    await ClassList.bulkWrite(classListOps);
    
    // 3. Sync Existing Users (Level Promotion / Dept Change)
    const userOps = enrichedStudents.map(s => ({
      updateOne: {
        filter: { regNo: s.regNo },
        update: { 
          $set: { 
            faculty: s.faculty, 
            department: s.department, 
            level: s.level, 
            option: s.option 
          } 
        }
      }
    }));
    if (userOps.length > 0) {
      await User.bulkWrite(userOps);
    }
    
    res.json({ 
      message: `Successfully processed ${enrichedStudents.length} students into ${context.department} (${context.level}).` 
    });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ message: error.message }); 
  }
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
