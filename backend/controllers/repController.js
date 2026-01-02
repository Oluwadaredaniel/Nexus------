
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
    const query = {
      department: req.user.department,
      level: req.user.level,
      role: { $ne: 'super_admin' } // Don't list super admins even if they match
    };
    
    // If rep has an option, only show students in that option. 
    // If rep has no option (null), show all or only those with null? 
    // Usually reps with null option represent the whole general dept level, or just the general track.
    // Assuming strict match if option exists.
    if (req.user.option) {
      query.option = req.user.option;
    }

    const students = await User.find(query).select('name regNo role option').sort({ name: 1 });
    res.json(students);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
