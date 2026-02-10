
import Session from '../models/Session.js';
import User from '../models/User.js';
import ClassList from '../models/ClassList.js';
import Course from '../models/Course.js';

export const createSession = async (req, res) => {
  const { courseId, title, type, durationMinutes, targetAudience } = req.body;
  const endTime = new Date(Date.now() + durationMinutes * 60000);
  
  let sessionDept = req.user.department;
  let sessionOption = req.user.option || null;

  // Role-Based Privileges overrides
  if (req.user.role === 'faculty_rep') {
    if (targetAudience === 'FACULTY') {
      sessionDept = 'ALL';
      sessionOption = 'ALL';
    } 
  } 
  else if (req.user.role === 'dept_rep') {
    if (targetAudience === 'DEPT') {
      sessionOption = 'ALL';
    }
  }

  try {
    let sessionTitle = title;
    let finalCourseId = null;

    if (type === 'COURSE') {
      if (!courseId) return res.status(400).json({ message: 'Course ID required for course sessions' });
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });
      sessionTitle = course.title;
      finalCourseId = course._id;
    } else {
      // General Roll Call
      if (!sessionTitle) return res.status(400).json({ message: 'Title required for general sessions' });
    }

    const session = await Session.create({
      createdBy: req.user._id,
      course: finalCourseId,
      title: sessionTitle,
      type: type || 'COURSE',
      department: sessionDept,
      level: req.user.level,
      option: sessionOption,
      endTime
    });
    
    // Populate if it's a course session
    if (finalCourseId) await session.populate('course');
    
    res.status(201).json(session);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const getMySessions = async (req, res) => {
  const sessions = await Session.find({ createdBy: req.user._id }).populate('course').sort({ createdAt: -1 });
  res.json(sessions);
};

export const getAvailableCourses = async (req, res) => {
  try {
    const { faculty, department, level, option, role } = req.user;
    const query = { level: level };

    if (role === 'super_admin') {
       delete query.level;
    } else if (role === 'faculty_rep') {
       query.faculty = faculty;
    } else if (role === 'dept_rep') {
       query.department = department;
    } else {
       query.department = department;
       // Class Reps only see courses for their option or general courses
       if (option) {
         query.$or = [{ option: null }, { option: option }];
       } else {
         query.option = null; 
       }
    }

    const courses = await Course.find(query).sort({ code: 1 });
    res.json(courses);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const extendSession = async (req, res) => {
  const { minutes } = req.body;
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    session.endTime = new Date(session.endTime.getTime() + minutes * 60000);
    session.isActive = true; 
    await session.save();
    res.json(session);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    session.isActive = false;
    session.endTime = Date.now();
    await session.save();
    res.json(session);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- Student List Management ---

export const getClassStudents = async (req, res) => {
  try {
    const query = {
      department: req.user.department,
      level: req.user.level,
      faculty: req.user.faculty
    };
    // Detailed list usually for Class Reps, so filter by option
    if (req.user.option) query.option = req.user.option;

    const listEntries = await ClassList.find(query).sort({ name: 1 });
    const registeredUsers = await User.find({ ...query, role: { $ne: 'super_admin' } }).select('regNo _id role');
    const registeredMap = new Map();
    registeredUsers.forEach(u => registeredMap.set(u.regNo, u));

    const combined = listEntries.map(entry => {
      const userAccount = registeredMap.get(entry.regNo);
      return {
        _id: entry._id,
        regNo: entry.regNo,
        name: entry.name,
        hasAccount: !!userAccount,
        userId: userAccount ? userAccount._id : null,
        role: userAccount ? userAccount.role : 'student' 
      };
    });

    res.json(combined);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getRepStats = async (req, res) => {
  try {
    let query = {};
    
    // Smart Scoping for Analytics
    if (req.user.role === 'faculty_rep') {
        query = { faculty: req.user.faculty };
    } else if (req.user.role === 'dept_rep') {
        query = { department: req.user.department };
    } else {
        query = { 
            department: req.user.department, 
            level: req.user.level 
        };
        if (req.user.option) query.option = req.user.option;
    }

    const totalList = await ClassList.countDocuments(query);
    const totalRegistered = await User.countDocuments({ ...query, role: { $ne: 'super_admin' } });

    res.json({ totalList, totalRegistered });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const addStudentToClassList = async (req, res) => {
  const { regNo, name } = req.body;
  if (!regNo || !name) return res.status(400).json({ message: 'Name and RegNo required' });

  try {
    const studentData = {
      regNo: String(regNo).toUpperCase().trim(),
      name: String(name).trim(),
      faculty: req.user.faculty,
      department: req.user.department,
      level: req.user.level,
      option: req.user.option || null
    };

    // --- DUPLICATE CHECK ---
    const exists = await ClassList.findOne({ regNo: studentData.regNo });
    if (exists) {
        return res.status(400).json({ 
            message: `Conflict: Student with RegNo ${studentData.regNo} already exists in the system.` 
        });
    }

    const newEntry = await ClassList.create(studentData);
    res.status(201).json(newEntry);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateClassListEntry = async (req, res) => {
  const { id } = req.params;
  const { name, regNo } = req.body;
  try {
    const entry = await ClassList.findById(id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    if (entry.department !== req.user.department || entry.level !== req.user.level) return res.status(403).json({ message: 'Unauthorized' });
    
    if (name) entry.name = name;
    if (regNo) entry.regNo = String(regNo).toUpperCase().trim();
    await entry.save();
    res.json(entry);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const deleteClassListEntry = async (req, res) => {
  const { id } = req.params;
  try {
    const entry = await ClassList.findById(id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    if (entry.department !== req.user.department || entry.level !== req.user.level) return res.status(403).json({ message: 'Unauthorized' });
    
    await ClassList.findByIdAndDelete(id);
    res.json({ message: 'Student removed from list' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- Faculty Rep Team Management ---

export const getFacultySubReps = async (req, res) => {
  if (req.user.role !== 'faculty_rep') return res.status(403).json({ message: 'Only Faculty Reps can access this' });
  try {
    // Find all reps in the Faculty (excluding self)
    const reps = await User.find({
      faculty: req.user.faculty,
      role: { $in: ['dept_rep', 'class_rep'] },
      _id: { $ne: req.user._id }
    }).select('-password');
    res.json(reps);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const assignSubRepRole = async (req, res) => {
  if (req.user.role !== 'faculty_rep') return res.status(403).json({ message: 'Unauthorized' });
  const { regNo, role } = req.body; // Role can be 'dept_rep' or 'class_rep'

  try {
    const user = await User.findOne({ regNo, faculty: req.user.faculty });
    if (!user) return res.status(404).json({ message: 'User not found or not in your faculty' });
    
    user.role = role;
    await user.save();
    res.json({ message: `${user.name} promoted to ${role}` });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const removeSubRepRole = async (req, res) => {
  if (req.user.role !== 'faculty_rep') return res.status(403).json({ message: 'Unauthorized' });
  const { userId } = req.params;

  try {
    const user = await User.findOne({ _id: userId, faculty: req.user.faculty });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.role = 'student'; // Demote
    await user.save();
    res.json({ message: 'User demoted to student' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};