
import Session from '../models/Session.js';
import Attendance from '../models/Attendance.js';

export const getActiveSessions = async (req, res) => {
  try {
    const query = {
      isActive: true, department: req.user.department,
      level: req.user.level, endTime: { $gt: Date.now() },
      option: req.user.option || null
    };
    const sessions = await Session.find(query).populate('course', 'title code');
    res.json(sessions);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const markAttendance = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const session = await Session.findById(sessionId);
    if (!session || !session.isActive || new Date() > session.endTime) return res.status(400).json({ message: 'Session Closed' });

    if (session.department !== req.user.department || session.level !== req.user.level) return res.status(403).json({ message: 'Wrong Dept/Level' });
    if (session.option && session.option !== req.user.option) return res.status(403).json({ message: 'Wrong Option' });

    const existing = await Attendance.findOne({ session: sessionId, student: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already Marked' });

    await Attendance.create({ session: sessionId, student: req.user._id, regNo: req.user.regNo });
    res.json({ message: 'Marked' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getSessionAttendees = async (req, res) => {
  const attendees = await Attendance.find({ session: req.params.id }).populate('student', 'name regNo');
  res.json(attendees);
};

export const getStudentHistory = async (req, res) => {
  const history = await Attendance.find({ student: req.user._id })
    .populate({ path: 'session', populate: { path: 'course', select: 'code title' } })
    .sort({ createdAt: -1 });
  res.json(history);
};
