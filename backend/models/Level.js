
import mongoose from 'mongoose';
const levelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true } 
}, { timestamps: true });
export default mongoose.model('Level', levelSchema);
