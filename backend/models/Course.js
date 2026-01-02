
import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  title: { type: String, required: true },
  department: { type: String, required: true },
  level: { type: String, required: true },
  semester: { type: String, default: '1' }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
