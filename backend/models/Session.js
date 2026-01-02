
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  department: { type: String, required: true },
  level: { type: String, required: true },
  option: { type: String },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  uniqueCode: { type: String, default: () => Math.random().toString(36).substring(2, 8).toUpperCase() }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
