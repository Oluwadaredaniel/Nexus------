
import Session from '../models/Session.js';
import User from '../models/User.js';
import ClassList from '../models/ClassList.js';

export const createSession = async (req, res) => {
  const { courseId, durationMinutes, targetAudience } = req.body;
  const endTime = new Date(Date.now() + durationMinutes * 60000);
  
  // targetAudience can be: 'FACULTY', 'DEPT', 'OPTION' (default)
  // Or match specifically provided dept/option IDs if functionality expands.
  // For now, we infer based on role and request.

  let sessionDept = req.user.department;
  let sessionOption = req.user.option || null;

  // Role-Based Privileges
  if (req.user.role === 'faculty_rep') {
    // Faculty Reps can start session for WHOLE faculty (Dept = "ALL", Option = "ALL")
    // Or they can start for a specific dept if passed in body (not implemented yet, assuming Global for now or personal context)
    
    // Simplification: If they choose 'FACULTY' audience, we set Department to "ALL".
    if (targetAudience === 'FACULTY') {
      sessionDept = 'ALL';
      sessionOption = 'ALL';
    } 
    // If they want to target their own dept, use their user.department
  } 
  else if (req.user.role === 'dept_rep') {
    // Dept Reps can start session for WHOLE dept (Option = "ALL")
    if (targetAudience === 'DEPT') {
      sessionOption = 'ALL';
    }
    // Else they target their specific option (default)
  }
  // Class Reps always target their specific department + option (handled by default vars)

  try {
    const session = await Session.create({
      createdBy: req.user._id,
      course: courseId,
      department: sessionDept,
      level: req.user.level,
      option: sessionOption,
      endTime
    });
    
    res.status(201).json(session);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const getMySessions = async (req, res) => {
  const sessions = await Session.find({ createdBy: req.user._id }).populate('course').sort({ createdAt: -1 });
  res.json(sessions);
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
    // Context from Rep
    const query = {
      department: req.user.department,
      level: req.user.level,
      faculty: req.user.faculty
    };
    if (req.user.option) query.option = req.user.option;

    // 1. Get Official List (Source of Truth)
    const listEntries = await ClassList.find(query).sort({ name: 1 });

    // 2. Get Registered Users (Actual Accounts)
    const registeredUsers = await User.find({ 
      ...query, 
      role: { $ne: 'super_admin' } 
    }).select('regNo _id role');

    const registeredMap = new Map();
    registeredUsers.forEach(u => registeredMap.set(u.regNo, u));

    const combined = listEntries.map(entry => {
      const userAccount = registeredMap.get(entry.regNo);
      return {
        _id: entry._id, // ClassList ID
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
