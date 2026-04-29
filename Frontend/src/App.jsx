import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './component/LandingPage';
import Register from './component/Register';
import Login from './component/Login';
import StudentDashboard from './component/student/StudentDashboard';
import TeacherDashboard from './component/teacher/TeacherDashboard';
import QRScanner from './component/student/QRScanner';
import ScanResult from './component/student/ScanResult';
import MyAttendance from './component/student/AttendanceHistory';
import AttendanceRecords from './component/teacher/AttendanceRecords';


function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Register Page */}
        <Route path="/register" element={<Register />} />

        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />

        <Route path="/student-dashboard" element={<StudentDashboard />} />

        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

        <Route path="/scan-qr" element={<QRScanner />} />

        <Route path="/scan-result" element={<ScanResult />} />

        <Route path="/my-attendance" element={<MyAttendance />} />

        <Route path="/attendance-records" element={<AttendanceRecords/>} />

      </Routes>
    </Router>
  );
}

export default App;