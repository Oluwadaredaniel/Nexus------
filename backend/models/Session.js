
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Course is now optional
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  
  // Title is mandatory. Auto-filled from course or user input for general sessions.
  title: { type: String, required: true },
  type: { type: String, enum: ['COURSE', 'GENERAL'], default: 'COURSE' },

  department: { type: String, required: true },
  level: { type: String, required: true },
  option: { type: String },
  
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  uniqueCode: { type: String, default: () => Math.random().toString(36).substring(2, 8).toUpperCase() }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);