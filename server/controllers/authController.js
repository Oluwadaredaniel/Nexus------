
import User from '../models/User.js';
import ClassList from '../models/ClassList.js';
import Faculty from '../models/Faculty.js';
import Level from '../models/Level.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '30d' });
};

// @desc    Signup Student
// @route   POST /api/auth/signup
export const signup = async (req, res) => {
  const { regNo, password, faculty, department, level, option } = req.body;

  try {
    const userExists = await User.findOne({ regNo });
    if (userExists) return res.status(400).json({ message: 'User account already exists. Please login.' });

    // 1. Strict Validation against Class List (Source of Truth)
    const validStudent = await ClassList.findOne({ regNo });
    
    if (!validStudent) {
      return res.status(403).json({ message: 'Registration Number not found in the official class list. Contact Admin.' });
    }

    // 2. Validate Context Match
    if (
      validStudent.faculty !== faculty ||
      validStudent.department !== department ||
      validStudent.level !== level
    ) {
       return res.status(403).json({ 
         message: 'Academic details do not match the official record. Please ensure you selected the correct Faculty, Department, and Level.' 
       });
    }

    // 3. Validate Option Match (if applicable)
    // If the record has an option, the user must provide it correctly.
    const recordOption = validStudent.option || null;
    const userOption = option || null;

    if (recordOption !== userOption) {
      return res.status(403).json({ 
        message: recordOption 
          ? `You must select the '${recordOption}' option as per the class list.`
          : `Invalid Option selected. Your record does not have a sub-option.` 
      });
    }

    // 4. Create User
    const user = await User.create({
      regNo,
      password,
      name: validStudent.name, // Use name from Class List, not input
      faculty,
      department,
      level,
      option: recordOption,
      role: 'student'
    });

    res.status(201).json({
      _id: user._id,
      regNo: user.regNo,
      name: user.name,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login User
// @route   POST /api/auth/login
export const login = async (req, res) => {
  const { regNo, password } = req.body;

  try {
    const user = await User.findOne({ regNo });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        regNo: user.regNo,
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
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change Password
// @route   POST /api/auth/change-password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      user.isPasswordChanged = true;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Public Academic Data (Faculties, Depts, Levels)
// @route   GET /api/auth/academic-data
export const getAcademicData = async (req, res) => {
  try {
    const faculties = await Faculty.find({});
    const levels = await Level.find({}).sort({ name: 1 });
    res.json({ faculties, levels });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
