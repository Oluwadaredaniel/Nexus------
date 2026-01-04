
import Session from '../models/Session.js';
import User from '../models/User.js';
import ClassList from '../models/ClassList.js';
import Course from '../models/Course.js';

export const createSession = async (req, res) => {
  const { courseId, durationMinutes, targetOption } = req.body;
  const endTime = new Date(Date.now() + durationMinutes * 60000);
  
  // Default: Inherit Rep's Context
  let sessionDept = req.user.department;
  let sessionOption = req.user.option || null;

  // Privileged Override Logic
  // Only Dept Reps or higher can override the option target
  if (req.user.role === 'dept_rep' || req.user.role === 'faculty_rep') {
    if (targetOption) {
      if (targetOption === 'ALL') {
        // Broad session for whole dept
        sessionOption = 'ALL'; 
      } else {
        // Targeted session for a specific option (Stepping in)
        sessionOption = targetOption;
      }
    }
  }

  // Faculty Rep Override (If they select a different Dept - simplified for now to just Faculty Wide)
  if (req.user.role === 'faculty_rep' && targetOption === 'FACULTY_WIDE') {
     sessionDept = 'ALL';
     sessionOption = 'ALL';
  }

  try {
    const session = await Session.create({
      createdBy: req.user._id,
      course: courseId,
      department: sessionDept,
      level: req.user.level,
      option: sessionOption,
      endTime
    });
    
    // Populate course details for immediate frontend display
    await session.populate('course');
    
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

    const query = {
      level: level // Always filter by Rep's level
    };

    if (role === 'super_admin') {
       delete query.level;
    } else if (role === 'faculty_rep') {
       query.faculty = faculty;
    } else if (role === 'dept_rep') {
       query.department = department;
    } else {
       // Class Reps: See courses for their Department.
       // They should see General Dept courses (option=null) AND their specific Option courses
       query.department = department;
       if (option) {
         query.$or = [
           { option: null },
           { option: { $exists: false } },
           { option: option }
         ];
       } else {
         query.option = null; 
       }
    }

    const courses = await Course.find(query).sort({ code: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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

export const getClassStudents = async (req, res) => {
  try {
    const query = {
      department: req.user.department,
      level: req.user.level,
      faculty: req.user.faculty
    };
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
    const query = {
      department: req.user.department,
      level: req.user.level,
      faculty: req.user.faculty
    };
    if (req.user.option) query.option = req.user.option;

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

    const exists = await ClassList.findOne({ regNo: studentData.regNo });
    if (exists) return res.status(400).json({ message: 'Student with this RegNo already exists.' });

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

    if (entry.department !== req.user.department || entry.level !== req.user.level) {
      return res.status(403).json({ message: 'Unauthorized to edit this student' });
    }

    if (name) entry.name = name;
    if (regNo) entry.regNo = String(regNo).toUpperCase().trim();

    await entry.save();
    res.json(entry);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
