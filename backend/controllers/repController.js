
import Session from '../models/Session.js';

export const createSession = async (req, res) => {
  const { courseId, durationMinutes } = req.body;
  const endTime = new Date(Date.now() + durationMinutes * 60000);
  try {
    const session = await Session.create({
      createdBy: req.user._id, course: courseId,
      department: req.user.department, level: req.user.level,
      option: req.user.option || null, endTime
    });
    res.status(201).json(session);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const getMySessions = async (req, res) => {
  const sessions = await Session.find({ createdBy: req.user._id }).populate('course').sort({ createdAt: -1 });
  res.json(sessions);
};

export const endSession = async (req, res) => {
  try {
    await Session.findByIdAndUpdate(req.params.id, { isActive: false, endTime: Date.now() });
    res.json({ message: 'Ended' });
  } catch (error) { res.status(400).json({ message: error.message }); }
};
