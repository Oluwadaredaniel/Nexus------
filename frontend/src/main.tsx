
import './index.css'; 
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/Layout';
import PageLoader from './components/ui/loader';
import PwaListener from './components/PwaListener';

// Lazy Load Pages for Performance
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword'));

const MarkAttendance = lazy(() => import('./pages/shared/MarkAttendance'));
const AttendanceHistory = lazy(() => import('./pages/student/AttendanceHistory'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UploadClassList = lazy(() => import('./pages/admin/UploadClassList'));
const ManageCourses = lazy(() => import('./pages/admin/ManageCourses'));
const ManageFaculties = lazy(() => import('./pages/admin/ManageFaculties'));
const ManageDepartments = lazy(() => import('./pages/admin/ManageDepartments'));
const ManageLevels = lazy(() => import('./pages/admin/ManageLevels'));
const ManageAdmins = lazy(() => import('./pages/admin/ManageAdmins'));
const AssignRep = lazy(() => import('./pages/admin/AssignRep'));
const ManageStudents = lazy(() => import('./pages/admin/ManageStudents'));
const ManageReps = lazy(() => import('./pages/admin/ManageReps'));
const SessionManagement = lazy(() => import('./pages/admin/SessionManagement'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));

const RepDashboard = lazy(() => import('./pages/rep/RepDashboard'));
const CreateSession = lazy(() => import('./pages/rep/CreateSession'));
const SessionList = lazy(() => import('./pages/rep/SessionList'));
const RepClassList = lazy(() => import('./pages/rep/RepClassList'));
const RepProfile = lazy(() => import('./pages/rep/Profile'));
const LiveSession = lazy(() => import('./pages/rep/LiveSession'));

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PwaListener />
    <HashRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(9, 9, 11, 0.95)',
            backdropFilter: 'blur(16px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            borderRadius: '12px',
          },
        }} 
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes wrapped in Layout */}
          <Route element={<Layout />}>
            <Route path="/auth/change-password" element={<ChangePassword />} />
            
            {/* Shared Routes */}
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
            <Route path="/rep/session/:id/monitor" element={<LiveSession />} />
            <Route path="/rep/students" element={<RepClassList />} />
            <Route path="/rep/profile" element={<RepProfile />} />

            {/* Student Routes */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/history" element={<AttendanceHistory />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  </React.StrictMode>
);
