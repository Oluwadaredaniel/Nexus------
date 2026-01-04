
import Session from '../models/Session.js';
import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

export const getActiveSessions = async (req, res) => {
  try {
    const { department, level, option } = req.user;

    // Student Visibility Query:
    // 1. Must match Level (assuming sessions are level-locked)
    // 2. Must be Active and not expired
    // 3. Department matching:
    //    a. Exact match on Dept AND (Option is match OR Option is 'ALL'/'null')
    //    b. OR Session is Faculty Wide (Dept='ALL')
    
    // NOTE: 'option' in session of 'ALL' means it applies to everyone in that department.
    // 'option' in session of null usually means General course.
    
    const query = {
      isActive: true,
      endTime: { $gt: Date.now() },
      level: level, 
      $or: [
        // 1. Exact Context Match (Same Dept, Same Option)
        { department: department, option: option || null },
        
        // 2. Dept-Wide Sessions (Same Dept, 'ALL' options)
        { department: department, option: 'ALL' },
        
        // 3. Faculty-Wide Sessions (created by Faculty Rep)
        { department: 'ALL' } 
      ]
    };

    // Edge case: If user has NO option (General student), they should see:
    // 1. General sessions (option: null)
    // 2. Dept Wide sessions (option: 'ALL')
    // They should NOT see sessions for "Math Option" etc.
    // The query above handles this: if user.option is null, line 1 matches { option: null }.

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

    // Validation to prevent cross-marking
    const userDept = req.user.department;
    const userOption = req.user.option || null;

    // Check Level
    if (session.level !== req.user.level) {
       return res.status(403).json({ message: 'Level mismatch.' });
    }

    // Check Context
    let isAllowed = false;

    if (session.department === 'ALL') {
       // Faculty wide - allowed (assuming user is in that Faculty, handled by logic implication or could add explicit check if Faculty field exists on Session)
       isAllowed = true; 
    } else if (session.department === userDept) {
       // Dept Match. Check Option.
       if (session.option === 'ALL') isAllowed = true; // Dept wide
       else if (session.option === userOption) isAllowed = true; // Specific match
       else if (!session.option && !userOption) isAllowed = true; // General match
    }

    if (!isAllowed) {
       return res.status(403).json({ message: 'This session is not available for your cohort.' });
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
