
import './index.css'; 
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/Layout';
import Landing from './pages/Landing';

// Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ChangePassword from './pages/auth/ChangePassword';

// Shared
import MarkAttendance from './pages/shared/MarkAttendance';
import AttendanceHistory from './pages/student/AttendanceHistory'; // Reusing for now as per "Shared" intent in prompt but kept file in student for simplicity of moves

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UploadClassList from './pages/admin/UploadClassList';
import ManageCourses from './pages/admin/ManageCourses';
import ManageFaculties from './pages/admin/ManageFaculties';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageLevels from './pages/admin/ManageLevels';
import ManageAdmins from './pages/admin/ManageAdmins';
import AssignRep from './pages/admin/AssignRep';
import ManageStudents from './pages/admin/ManageStudents';
import ManageReps from './pages/admin/ManageReps';
import SessionManagement from './pages/admin/SessionManagement';
import AdminProfile from './pages/admin/Profile';

// Rep Pages
import RepDashboard from './pages/rep/RepDashboard';
import CreateSession from './pages/rep/CreateSession';
import SessionList from './pages/rep/SessionList';
import RepClassList from './pages/rep/RepClassList';
import RepProfile from './pages/rep/Profile';

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
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/auth/change-password" element={<ChangePassword />} />
          
          {/* Shared Routes (Accessible by role config in Layout) */}
          <Route path="/mark-attendance" element={<MarkAttendance />} />
          <Route path="/history" element={<AttendanceHistory />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/class-lists" element={<UploadClassList />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/faculties" element={<ManageFaculties />} />
          <Route path="/admin/departments" element={<ManageDepartments />} />
          <Route path="/admin/levels" element={<ManageLevels />} />
          <Route path="/admin/admins" element={<ManageAdmins />} />
          <Route path="/admin/assign-rep" element={<AssignRep />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/reps" element={<ManageReps />} />
          <Route path="/admin/sessions" element={<SessionManagement />} />
          <Route path="/admin/profile" element={<AdminProfile />} />

          {/* Rep Routes */}
          <Route path="/rep" element={<RepDashboard />} />
          <Route path="/rep/create-session" element={<CreateSession />} />
          <Route path="/rep/sessions" element={<SessionList />} />
          <Route path="/rep/students" element={<RepClassList />} />
          <Route path="/rep/profile" element={<RepProfile />} />

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
