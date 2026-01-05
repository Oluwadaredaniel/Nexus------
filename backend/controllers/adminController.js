
import Faculty from '../models/Faculty.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import ClassList from '../models/ClassList.js';
import Attendance from '../models/Attendance.js';
import Level from '../models/Level.js';
import Session from '../models/Session.js';

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

export const deleteFaculty = async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: 'Faculty deleted' });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const addDepartment = async (req, res) => {
  const { facultyId, name, options } = req.body;
  try {
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    const formattedOptions = Array.isArray(options) 
      ? options.map(opt => ({ name: opt })) 
      : [];

    faculty.departments.push({ name, options: formattedOptions });
    await faculty.save();
    res.status(201).json(faculty);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deleteDepartment = async (req, res) => {
  const { facultyId, deptId } = req.params;
  try {
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    
    faculty.departments = faculty.departments.filter(d => d._id.toString() !== deptId);
    await faculty.save();
    res.json(faculty);
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

// --- Student & Rep Management ---
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: { $ne: 'super_admin' } }).select('-password').sort({ createdAt: -1 }).limit(100); 
    res.json(students);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({ message: 'User not found'});
    user.password = 'password123'; 
    user.isPasswordChanged = false;
    await user.save();
    res.json({ message: 'Password reset to: password123' });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export const getAllReps = async (req, res) => {
  try {
    // Get all types of reps
    const reps = await User.find({ role: { $in: ['class_rep', 'dept_rep', 'faculty_rep'] } }).select('-password');
    res.json(reps);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const demoteRep = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = 'student';
    await user.save();
    res.json({ message: 'User demoted to student' });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const uploadClassList = async (req, res) => {
  const { students, context } = req.body; 
  if (!students || !Array.isArray(students)) return res.status(400).json({ message: 'Invalid students data' });
  if (!context || !context.faculty || !context.department || !context.level) return res.status(400).json({ message: 'Missing academic context' });

  try {
    const enrichedStudents = students
      .filter(s => s.regNo && s.name)
      .map(s => ({
        regNo: String(s.regNo).toUpperCase().trim(),
        name: String(s.name).trim(),
        faculty: context.faculty,
        department: context.department,
        level: context.level,
        option: context.option || null,
      }));

    if (enrichedStudents.length === 0) {
      return res.status(400).json({ message: 'No valid rows found. Please check your Excel headers contain "RegNo" and "Name".' });
    }

    const classListOps = enrichedStudents.map(s => ({
      updateOne: { filter: { regNo: s.regNo }, update: { $set: s }, upsert: true }
    }));
    await ClassList.bulkWrite(classListOps);
    
    // Also update existing users context if they exist
    const userOps = enrichedStudents.map(s => ({
      updateOne: {
        filter: { regNo: s.regNo },
        update: { $set: { faculty: s.faculty, department: s.department, level: s.level, option: s.option } }
      }
    }));
    if (userOps.length > 0) await User.bulkWrite(userOps);
    
    res.json({ message: `Successfully processed ${enrichedStudents.length} students.` });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getClassListSummaries = async (req, res) => {
  try {
    const summary = await ClassList.aggregate([
      {
        $group: {
          _id: {
            faculty: "$faculty",
            department: "$department",
            level: "$level",
            option: "$option"
          },
          studentCount: { $sum: 1 },
          lastUpdated: { $max: "$updatedAt" }
        }
      },
      { $sort: { "_id.faculty": 1, "_id.department": 1, "_id.level": 1 } }
    ]);
    res.json(summary);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// NEW: Delete entire class list cohort
export const deleteClassList = async (req, res) => {
  try {
    const { faculty, department, level, option } = req.query;
    
    if (!faculty || !department || !level) {
      return res.status(400).json({ message: 'Missing parameters. Faculty, Department and Level are required.' });
    }

    // Build filter. Handle option being 'null' string carefully if passed from query
    const filter = { 
      faculty, 
      department, 
      level 
    };

    if (option && option !== 'null' && option !== '') {
      filter.option = option;
    } else {
      filter.option = null;
    }

    const result = await ClassList.deleteMany(filter);
    res.json({ message: `Deleted ${result.deletedCount} student entries from class list.` });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const assignClassRep = async (req, res) => {
  const { regNo, role, faculty, department, level, option } = req.body;
  
  if (!regNo || !role) {
    return res.status(400).json({ message: 'RegNo and Role are required.' });
  }

  try {
    // 1. Check User Account
    const user = await User.findOne({ regNo: String(regNo).toUpperCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Student account not found. The student must sign up first.' });
    }

    // 2. Validate Context based on Role
    // Reps must still be students with a valid academic context
    user.faculty = faculty;
    user.department = department;
    user.level = level;
    user.option = option || null; 

    // 3. Promote
    user.role = role; 
    
    await user.save();
    res.json({ message: `Success! ${user.name} assigned as ${role.replace('_', ' ').toUpperCase()}` });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- Admins ---
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'super_admin' }).select('-password');
    res.json(admins);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const createSuperAdmin = async (req, res) => {
  const { regNo, password, name } = req.body;
  try {
    const admin = await User.create({ regNo, password, name, role: 'super_admin' });
    res.status(201).json(admin);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- Session Management ---
export const getAllActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ isActive: true }).populate('course').populate('createdBy', 'name regNo');
    res.json(sessions);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const forceEndSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    session.isActive = false;
    session.endTime = Date.now();
    await session.save();
    res.json({ message: 'Session ended by admin' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- Analytics ---
export const getAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalReps = await User.countDocuments({ role: { $in: ['class_rep', 'dept_rep', 'faculty_rep'] } });
    
    const totalFaculties = await Faculty.countDocuments();
    const faculties = await Faculty.find({});
    const totalDepartments = faculties.reduce((acc, f) => acc + f.departments.length, 0);

    const totalCourses = await Course.countDocuments();
    const totalAttendance = await Attendance.countDocuments({ status: 'present' });
    
    const recentActivity = await Attendance.find().sort({ createdAt: -1 }).limit(5).populate('student', 'name regNo');
    
    res.json({ 
      totalStudents, 
      totalReps,
      totalFaculties,
      totalDepartments,
      totalCourses, 
      totalAttendance, 
      recentActivity 
    });
  } catch (error) { res.status(400).json({ message: error.message }); }
};_rep', 'dept_rep', 'faculty_rep'] } });
    
    const totalFaculties = await Faculty.countDocuments();
    const faculties = await Faculty.find({});
    const totalDepartments = faculties.reduce((acc, f) => acc + f.departments.length, 0);

    const totalCourses = await Course.countDocuments();
    const totalAttendance = await Attendance.countDocuments({ status: 'present' });
    
    const recentActivity = await Attendance.find().sort({ createdAt: -1 }).limit(5).populate('student', 'name regNo');
    
    res.json({ 
      totalStudents, 
      totalReps,
      totalFaculties,
      totalDepartments,
      totalCourses, 
      totalAttendance, 
      recentActivity 
    });
  } catch (error) { res.status(400).json({ message: error.message }); }
};
