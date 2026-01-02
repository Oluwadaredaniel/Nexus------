
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import UploadClassList from './pages/admin/UploadClassList';
import ManageFaculties from './pages/admin/ManageFaculties';
import ManageCourses from './pages/admin/ManageCourses';
import RepDashboard from './pages/rep/RepDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import AttendanceHistory from './pages/student/AttendanceHistory';
import Profile from './pages/student/Profile';
import AssignRep from './pages/admin/AssignRep';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1e', color: '#fff', border: '1px solid #333' } }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Layout />}>
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/class-lists" element={<UploadClassList />} />
          <Route path="/admin/faculties" element={<ManageFaculties />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/assign-rep" element={<AssignRep />} />
          <Route path="/rep" element={<RepDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/history" element={<AttendanceHistory />} />
          <Route path="/student/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
