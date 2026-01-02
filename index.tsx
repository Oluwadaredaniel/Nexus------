import './index.css'; 
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './src/components/Layout';
import Landing from './src/pages/Landing';
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';
import ChangePassword from './src/pages/ChangePassword';

// Admin Pages
import AdminDashboard from './src/pages/admin/AdminDashboard';
import UploadClassList from './src/pages/admin/UploadClassList';
import ManageCourses from './src/pages/admin/ManageCourses';
import ManageFaculties from './src/pages/admin/ManageFaculties';
import AssignRep from './src/pages/admin/AssignRep';

// Rep Pages
import RepDashboard from './src/pages/rep/RepDashboard';

// Student Pages
import StudentDashboard from './src/pages/student/StudentDashboard';
import AttendanceHistory from './src/pages/student/AttendanceHistory';
import Profile from './src/pages/student/Profile';

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
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/class-lists" element={<UploadClassList />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/faculties" element={<ManageFaculties />} />
          <Route path="/admin/assign-rep" element={<AssignRep />} />

          {/* Rep Routes */}
          <Route path="/rep" element={<RepDashboard />} />
          <Route path="/rep/sessions" element={<RepDashboard />} />

          {/* Student Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/history" element={<AttendanceHistory />} />
          <Route path="/student/profile" element={<Profile />} />
        </Route>

        {/* Catch-all route to redirect invalid paths to landing or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);