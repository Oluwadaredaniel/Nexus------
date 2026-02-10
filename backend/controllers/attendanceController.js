
import Session from '../models/Session.js';
import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

export const getActiveSessions = async (req, res) => {
  // Students only see sessions for their Dept, Level, AND Option (if applicable)
  try {
    const query = {
      isActive: true,
      department: req.user.department,
      level: req.user.level,
      endTime: { $gt: Date.now() }
    };

    // If student belongs to a specific option, they should only see sessions for that option
    // or sessions with no option
    if (req.user.option) {
      query.option = req.user.option;
    } else {
      query.option = null;
    }

    const sessions = await Session.find(query).populate('course', 'title code');
    res.json(sessions);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const markAttendance = async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const session = await Session.findById(sessionId);
    if (!session || !session.isActive || new Date() > session.endTime) {
      return res.status(400).json({ message: 'Session is closed or invalid' });
    }

    // Validation: Ensure student belongs to the session context
    if (session.department !== req.user.department || session.level !== req.user.level) {
       return res.status(403).json({ message: 'This session is not for your department/level.' });
    }
    // Strict Option Match: Reps option vs Student option
    if (session.option && session.option !== req.user.option) {
       return res.status(403).json({ message: 'This session is not for your option group.' });
    }

    // Check if user has already marked
    const existing = await Attendance.findOne({ session: sessionId, student: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked' });
    }

    await Attendance.create({
      session: sessionId,
      student: req.user._id,
      regNo: req.user.regNo,
      status: 'present'
    });

    res.json({ message: 'Marked successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getSessionAttendees = async (req, res) => {
  const attendees = await Attendance.find({ session: req.params.id }).populate('student', 'name regNo');
  res.json(attendees);
};

export const getStudentHistory = async (req, res) => {
  const history = await Attendance.find({ student: req.user._id })
    .populate({
      path: 'session',
      populate: { path: 'course', select: 'code title' }
    })
    .sort({ createdAt: -1 });
  res.json(history);
};