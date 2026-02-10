
import User from '../models/User.js';
import ClassList from '../models/ClassList.js';
import Faculty from '../models/Faculty.js';
import Level from '../models/Level.js';
import SystemSettings from '../models/SystemSettings.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '30d' });
};

export const verifyStudent = async (req, res) => {
  const { regNo } = req.body;
  try {
    const existingUser = await User.findOne({ regNo });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Account already claimed. Please Login.', 
        code: 'ALREADY_REGISTERED' 
      });
    }
    const record = await ClassList.findOne({ regNo });
    if (!record) {
      return res.status(404).json({ 
        message: 'RegNo not found in Official Class List. Contact your Rep or Admin.',
        code: 'NOT_FOUND'
      });
    }
    res.json({
      success: true,
      name: record.name,
      faculty: record.faculty,
      department: record.department,
      level: record.level,
      option: record.option
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const signup = async (req, res) => {
  const { regNo, password } = req.body;
  try {
    const userExists = await User.findOne({ regNo });
    if (userExists) return res.status(400).json({ message: 'Account already claimed' });

    const validStudent = await ClassList.findOne({ regNo });
    if (!validStudent) return res.status(403).json({ message: 'RegNo not found in Official Class List.' });

    const user = await User.create({
      regNo: validStudent.regNo,
      password,
      name: validStudent.name,
      faculty: validStudent.faculty,
      department: validStudent.department,
      level: validStudent.level,
      option: validStudent.option || null,
      role: 'student'
    });

    res.status(201).json({
      _id: user._id,
      regNo: user.regNo,
      name: user.name,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const login = async (req, res) => {
  // identifier can be RegNo OR MatricNo
  const { regNo: identifier, password } = req.body; 
  
  try {
    // 1. Fetch System Settings
    let settings = await SystemSettings.findOne({ singletonId: 'CONFIG' });
    if (!settings) settings = { loginMode: 'BOTH' };

    let user;
    const cleanId = identifier.trim().toUpperCase();

    // 2. Logic based on Mode
    if (settings.loginMode === 'REG_ONLY') {
       user = await User.findOne({ regNo: cleanId });
    } 
    else if (settings.loginMode === 'MATRIC_ONLY') {
       // Primary check: Matric No
       user = await User.findOne({ matricNo: cleanId });
       
       // Fallback: If not found by Matric, try RegNo ONLY IF that user has no MatricNo set yet (First time user)
       if (!user) {
         const fallbackUser = await User.findOne({ regNo: cleanId });
         if (fallbackUser && !fallbackUser.matricNo) {
           user = fallbackUser; // Allow first-time login via RegNo
         }
       }
    } 
    else {
       // 'BOTH': Check either
       user = await User.findOne({ 
         $or: [{ regNo: cleanId }, { matricNo: cleanId }] 
       });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        regNo: user.regNo,
        matricNo: user.matricNo,
        name: user.name,
        role: user.role,
        faculty: user.faculty,
        department: user.department,
        option: user.option,
        level: user.level,
        isPasswordChanged: user.isPasswordChanged,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials or login method restricted' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      user.isPasswordChanged = true;
      await user.save();
      res.json({ message: 'Password updated' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      if (req.body.password) user.password = req.body.password;
      if (req.body.matricNo) user.matricNo = req.body.matricNo;

      if (req.user.role === 'super_admin') {
         if (req.body.name) user.name = req.body.name;
         if (req.body.faculty) user.faculty = req.body.faculty;
         if (req.body.department) user.department = req.body.department;
         if (req.body.level) user.level = req.body.level;
         if (req.body.option) user.option = req.body.option;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        regNo: updatedUser.regNo,
        matricNo: updatedUser.matricNo,
        name: updatedUser.name,
        role: updatedUser.role,
        department: updatedUser.department,
        option: updatedUser.option,
        level: updatedUser.level,
        faculty: updatedUser.faculty,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getAcademicData = async (req, res) => {
  try {
    const faculties = await Faculty.find({});
    const levels = await Level.find({}).sort({ name: 1 });
    res.json({ faculties, levels });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getPublicStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const settings = await SystemSettings.findOne({ singletonId: 'CONFIG' });
    res.json({ students: totalStudents, loginMode: settings?.loginMode || 'BOTH' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};