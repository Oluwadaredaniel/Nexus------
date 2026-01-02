
import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true } // e.g., "100", "200", "ND 1"
}, { timestamps: true });

export default mongoose.model('Level', levelSchema);
