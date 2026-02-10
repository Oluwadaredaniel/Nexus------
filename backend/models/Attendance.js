
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  regNo: { type: String, required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
  markedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate marking
attendanceSchema.index({ session: 1, student: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);