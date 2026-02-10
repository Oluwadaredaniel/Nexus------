
import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  singletonId: { type: String, default: 'CONFIG', unique: true },
  loginMode: { 
    type: String, 
    enum: ['BOTH', 'REG_ONLY', 'MATRIC_ONLY'], 
    default: 'BOTH' 
  },
  allowRepSignup: { type: Boolean, default: false } // Future use
}, { timestamps: true });

export default mongoose.model('SystemSettings', systemSettingsSchema);