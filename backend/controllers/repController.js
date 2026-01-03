
import Session from '../models/Session.js';
import User from '../models/User.js';
import ClassList from '../models/ClassList.js';

export const createSession = async (req, res) => {
  const { courseId, durationMinutes } = req.body;
  const endTime = new Date(Date.now() + durationMinutes * 60000);
  
  try {
    const session = await Session.create({
      createdBy: req.user._id,
      course: courseId,
      department: req.user.department,
      level: req.user.level,
      option: req.user.option || null, // Inherit option from Class Rep
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
    // We match registered users by regNo to list entries
    const registeredUsers = await User.find({ 
      ...query, 
      role: { $ne: 'super_admin' } 
    }).select('regNo _id role');

    // Create a map of registered users for quick lookup
    const registeredMap = new Map();
    registeredUsers.forEach(u => registeredMap.set(u.regNo, u));

    // Combine Data
    const combined = listEntries.map(entry => {
      const userAccount = registeredMap.get(entry.regNo);
      return {
        _id: entry._id, // ClassList ID
        regNo: entry.regNo,
        name: entry.name,
        hasAccount: !!userAccount,
        userId: userAccount ? userAccount._id : null,
        role: userAccount ? userAccount.role : 'student' // Default to student if no account
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
    // Force context to match Rep's context
    const studentData = {
      regNo: String(regNo).toUpperCase().trim(),
      name: String(name).trim(),
      faculty: req.user.faculty,
      department: req.user.department,
      level: req.user.level,
      option: req.user.option || null
    };

    // Check duplicate
    const exists = await ClassList.findOne({ regNo: studentData.regNo });
    if (exists) return res.status(400).json({ message: 'Student with this RegNo already exists in a class list.' });

    const newEntry = await ClassList.create(studentData);
    res.status(201).json(newEntry);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateClassListEntry = async (req, res) => {
  const { id } = req.params; // ClassList ID
  const { name, regNo } = req.body;

  try {
    const entry = await ClassList.findById(id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    // Ensure Rep owns this entry
    if (entry.department !== req.user.department || entry.level !== req.user.level) {
      return res.status(403).json({ message: 'Unauthorized to edit this student' });
    }

    if (name) entry.name = name;
    if (regNo) entry.regNo = String(regNo).toUpperCase().trim();

    await entry.save();
    res.json(entry);
  } catch (error) { res.status(500).json({ message: error.message }); }
};