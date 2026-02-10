
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  regNo: { type: String, required: true, unique: true, uppercase: true }, // Used for initial signup (List ID)
  matricNo: { type: String, uppercase: true, default: null }, // The actual Matric Number
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['super_admin', 'faculty_rep', 'dept_rep', 'class_rep', 'student'], 
    default: 'student' 
  },
  faculty: { type: String },
  department: { type: String },
  option: { type: String }, 
  level: { type: String },
  isPasswordChanged: { type: Boolean, default: false },
  
  // Security & Billing
  boundDeviceId: { type: String }, 
  isAccountActive: { type: Boolean, default: false },
  activationExpiry: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);