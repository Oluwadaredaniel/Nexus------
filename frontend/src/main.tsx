
import './index.css'; 
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';

// Shared
import MarkAttendance from './pages/shared/MarkAttendance';
import AttendanceHistory from './pages/student/AttendanceHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UploadClassList from './pages/admin/UploadClassList';
import ManageCourses from './pages/admin/ManageCourses';
import ManageFaculties from './pages/admin/ManageFaculties';
import AssignRep from './pages/admin/AssignRep';
import ManageStudents from './pages/admin/ManageStudents';
import ManageReps from './pages/admin/ManageReps';
import SessionManagement from './pages/admin/SessionManagement';

// Rep Pages
import RepDashboard from './pages/rep/RepDashboard';
import RepClassList from './pages/rep/RepClassList';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import Profile from './pages/student/Profile';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(20, 20, 25, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }} 
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/change-password" element={<ChangePassword />} />
          
          {/* Shared Routes */}
          <Route path="/mark-attendance" element={<MarkAttendance />} />
          <Route path="/history" element={<AttendanceHistory />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/class-lists" element={<UploadClassList />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/faculties" element={<ManageFaculties />} />
          <Route path="/admin/assign-rep" element={<AssignRep />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/reps" element={<ManageReps />} />
          <Route path="/admin/sessions" element={<SessionManagement />} />

          {/* Rep Routes */}
          <Route path="/rep" element={<RepDashboard />} />
          <Route path="/rep/sessions" element={<RepDashboard />} />
          <Route path="/rep/students" element={<RepClassList />} />

          {/* Student Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/history" element={<AttendanceHistory />} />
          <Route path="/student/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
