
import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true } // e.g., "100", "200", "300", "400", "500", "Spill"
}, { timestamps: true });

export default mongoose.model('Level', levelSchema);
