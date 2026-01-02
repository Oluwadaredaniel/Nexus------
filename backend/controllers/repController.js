
import Session from '../models/Session.js';
import User from '../models/User.js';

export const createSession = async (req, res) => {
  const { courseId, durationMinutes } = req.body;
  const endTime = new Date(Date.now() + durationMinutes * 60000);
  
  try {
    const session = await Session.create({
      createdBy: req.user._id,
      course: courseId,
      department: req.user.department,
      level: req.user.level,
      option: req.user.option || null,
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
