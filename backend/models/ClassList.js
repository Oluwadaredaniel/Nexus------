
import mongoose from 'mongoose';

const classListSchema = new mongoose.Schema({
  regNo: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  faculty: { type: String, required: true },
  department: { type: String, required: true },
  level: { type: String, required: true },
  option: { type: String, default: null } // For sub-tracks
}, { timestamps: true });

export default mongoose.model('ClassList', classListSchema);