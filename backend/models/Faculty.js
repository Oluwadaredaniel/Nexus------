
import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({ name: String });

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  options: [optionSchema] 
});

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  departments: [departmentSchema]
});

export default mongoose.model('Faculty', facultySchema);
