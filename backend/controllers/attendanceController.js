
import Session from '../models/Session.js';
import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

export const getActiveSessions = async (req, res) => {
  try {
    // Hierarchy of Matching:
    // 1. Faculty Wide: Dept='ALL', Option='ALL'
    // 2. Dept Wide: Dept=User.Dept, Option='ALL'
    // 3. Option Specific: Dept=User.Dept, Option=User.Option
    
    // AND Must match Level (Assuming level is strict for now, or we could wildcard level too if needed)
    // AND Must be Active and not Expired

    const sessions = await Session.find({
      isActive: true,
      endTime: { $gt: Date.now() },
      level: req.user.level,
      $or: [
        { department: 'ALL', option: 'ALL' }, // Faculty Rep Session
        { department: req.user.department, option: 'ALL' }, // Dept Rep Session
        { department: req.user.department, option: req.user.option || null } // Class Rep Session
      ]
    }).populate('course', 'title code');

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

    // Validation
    const isFacultyWide = session.department === 'ALL';
    const isDeptWide = session.department === req.user.department && session.option === 'ALL';
    const isSpecific = session.department === req.user.department && session.option === (req.user.option || null);

    if (!isFacultyWide && !isDeptWide && !isSpecific) {
       return res.status(403).json({ message: 'This session is not for your cohort.' });
    }
    
    if (session.level !== req.user.level) {
       return res.status(403).json({ message: 'Level mismatch.' });
    }

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
  // Populate student with dept and option info for export
  const attendees = await Attendance.find({ session: req.params.id })
    .populate('student', 'name regNo department option');
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
