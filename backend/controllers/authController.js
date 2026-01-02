
import User from '../models/User.js';
import ClassList from '../models/ClassList.js';
import Faculty from '../models/Faculty.js';
import Level from '../models/Level.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '30d' });

export const signup = async (req, res) => {
  const { regNo, password, faculty, department, level, option } = req.body;
  try {
    const userExists = await User.findOne({ regNo });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Validate against Class List
    const validStudent = await ClassList.findOne({ regNo });
    if (!validStudent) return res.status(403).json({ message: 'RegNo not found in class list.' });

    if (validStudent.faculty !== faculty || validStudent.department !== department || validStudent.level !== level) {
       return res.status(403).json({ message: 'Academic details do not match official records.' });
    }

    const recordOption = validStudent.option || null;
    const userOption = option || null;
    if (recordOption !== userOption) return res.status(403).json({ message: 'Option/Track mismatch.' });

    const user = await User.create({
      regNo, password, name: validStudent.name,
      faculty, department, level, option: recordOption, role: 'student'
    });

    res.status(201).json({
      _id: user._id, regNo: user.regNo, name: user.name, role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const login = async (req, res) => {
  const { regNo, password } = req.body;
  try {
    const user = await User.findOne({ regNo });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id, regNo: user.regNo, name: user.name, role: user.role,
        department: user.department, level: user.level, option: user.option,
        isPasswordChanged: user.isPasswordChanged, token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
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

export const getAcademicData = async (req, res) => {
  try {
    const faculties = await Faculty.find({});
    const levels = await Level.find({}).sort({ name: 1 });
    res.json({ faculties, levels });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};
