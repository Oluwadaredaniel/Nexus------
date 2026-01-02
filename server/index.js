
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import repRoutes from './routes/repRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // For class list uploads
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rep', repRoutes);
app.use('/api/attendance', attendanceRoutes);

// Socket.IO Logic for Real-time Attendance Updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_session', (sessionId) => {
    socket.join(sessionId);
  });

  socket.on('attendance_marked', ({ sessionId, studentName }) => {
    // Broadcast to the rep watching this session
    io.to(sessionId).emit('update_attendees', { studentName });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Database & Bootstrap
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nexus')
  .then(async () => {
    console.log('MongoDB Connected');
    // Bootstrap Super Admin
    const adminExists = await User.findOne({ role: 'super_admin' });
    if (!adminExists) {
      await User.create({
        regNo: 'SUPER_ADMIN',
        password: 'admin', // Will be hashed by hook
        name: 'System Administrator',
        role: 'super_admin'
      });
      console.log('Bootstrap: SUPER_ADMIN account created (pw: admin)');
    }
  })
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
