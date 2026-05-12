import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import LiveAttendanceModal from "./LiveAttendanceModal";
import DownloadReportModal from "./DownloadReportModal";
import SettingsModal from "./SettingsModal";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [lectureName, setLectureName] = useState("");
  const [lectureCode, setLectureCode] = useState("");
  const [year, setYear] = useState("");
  const [qrData, setQrData] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualSessionId, setManualSessionId] = useState("");
  const [manualStudentId, setManualStudentId] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Stats state
  const [todaySessions, setTodaySessions] = useState(0);
  const [activeSession, setActiveSession] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || storedUser.role !== "TEACHER") {
      navigate("/login");
    } else {
      setUser(storedUser);
      fetchStats(storedUser.teacherId);
    }
  }, [navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Fetch dashboard stats

const fetchStats = async (teacherId) => {
  try {
    setLoading(true);

    // ✅ Today's sessions (real)
    const todayRes = await axios.get(
      `http://localhost:8080/api/teacher/today-sessions/${teacherId}`
    );
    setTodaySessions(todayRes.data?.count ?? 0);

    // ✅ Active session (real boolean)
    const activeRes = await axios.get(
      `http://localhost:8080/api/teacher/active-session/${teacherId}`
    );

    // Fix 1: Check if activeRes.data has a session
    const isActive = activeRes.data !== null && activeRes.data !== 0;
    setActiveSession(isActive);

    // Fix 2: Check if active session exists before calling count API
    if (isActive) {
      const countRes = await axios.get(
        `http://localhost:8080/api/teacher/live-session-students/${teacherId}`
      );
      setTotalStudents(countRes.data ?? 0);
    } else {
      setTotalStudents(0);
    }

  } catch (err) {
    console.error("Error fetching stats:", err);
    setTodaySessions(0);
    setActiveSession(false);
    setTotalStudents(0);
  } finally {
    setLoading(false);
  }
};

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const generateQR = async () => {
    if (!lectureName || !lectureCode || !year) {
      alert("Fill all details");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/api/teacher/create-session",
        {
          lectureName,
          lectureCode,
          year,
          teacherId: user.teacherId,
        }
      );

      const sessionId = res.data.sessionId;

      setQrData(
        JSON.stringify({ sessionId, lectureName, lectureCode, year })
      );

      setTimeLeft(30 * 60);

      // Refresh stats after creating session
      fetchStats(user.teacherId);
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Error creating session");
    }
  };

  const markManualAttendance = async () => {
    if (!manualSessionId || !manualStudentId) {
      alert("Fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/api/teacher/manual-attendance",
        {
          sessionId: manualSessionId,
          studentId: manualStudentId,
        }
      );

      alert(res.data);
      setManualSessionId("");
      setManualStudentId("");
      setShowManualModal(false);

    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Error");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              👋 Hello, {user.name}
            </h1>
            <p className="text-gray-500 text-sm">
              Teacher ID: {user.teacherId}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* QUICK STATS - REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Today's Sessions</p>
            {loading ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mx-auto mt-1"></div>
            ) : (
              <h2 className="text-2xl font-bold">{todaySessions}</h2>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
  <p className="text-gray-500 text-sm">Active Session</p>

  {loading ? (
    <div className="animate-pulse h-8 w-24 bg-gray-200 rounded mx-auto mt-1"></div>
  ) : activeSession ? (
    <h2 className="text-green-600 font-bold">
      Live Session
    </h2>
  ) : (
    <h2 className="text-red-500 font-bold">
      No Active Session
    </h2>
  )}
</div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Total Students</p>
            {loading ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mx-auto mt-1"></div>
            ) : (
              <h2 className="text-2xl font-bold">{totalStudents}</h2>
            )}
          </div>
        </div>

        {/* MAIN ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Start Attendance */}
          <div
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer hover:scale-[1.03] transition"
          >
            <h2 className="text-lg font-bold mb-1">📷 Start Attendance</h2>
            <p className="text-sm opacity-90">Generate QR & start session</p>
          </div>

          {/* View Attendance */}
          <div
            onClick={() => navigate("/attendance-records")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-2xl shadow-lg cursor-pointer hover:scale-[1.03] transition"
          >
            <h2 className="text-lg font-bold mb-1">📊 Attendance Records</h2>
            <p className="text-sm opacity-90">View past attendance</p>
          </div>

          {/* Live Attendance */}
          <div
            onClick={() => setShowLiveModal(true)}
            className="bg-white border p-6 rounded-2xl shadow hover:shadow-md transition cursor-pointer"
          >
            <h2 className="text-lg font-semibold">🟢 Live Attendance</h2>
            <p className="text-gray-500 text-sm">View active sessions</p>
          </div>

          {/* Manual Attendance */}
          <div
            onClick={() => setShowManualModal(true)}
            className="bg-white border p-6 rounded-2xl shadow hover:shadow-md transition cursor-pointer"
          >
            <h2 className="text-lg font-semibold">📝 Manual Entry</h2>
            <p className="text-gray-500 text-sm">Mark manually</p>
          </div>

          {/* Download Report */}
          <div
            onClick={() => setShowDownloadModal(true)}
            className="bg-white border p-6 rounded-2xl shadow hover:shadow-md transition cursor-pointer"
          >
            <h2 className="text-lg font-semibold">📥 Download Report</h2>
            <p className="text-gray-500 text-sm">CSV / PDF</p>
          </div>

          {/* Settings */}
          <div
            onClick={() => setShowSettings(true)}
            className="bg-white border p-6 rounded-2xl shadow hover:shadow-md transition cursor-pointer"
          >
            <h2 className="text-lg font-semibold">⚙️ Settings</h2>
            <p className="text-gray-500 text-sm">Profile & preferences</p>
          </div>

        </div>

        {/* ACTIVE SESSION PANEL */}

      </div>

      {/* MODALS - same as before */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white w-[380px] p-6 rounded-2xl shadow-lg relative">
            <h2 className="text-lg font-bold mb-4 text-center">
              Start Attendance Session
            </h2>
            <input
              type="text"
              placeholder="Lecture Name"
              className="w-full border p-2 rounded mb-3"
              value={lectureName}
              onChange={(e) => setLectureName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Lecture Code"
              className="w-full border p-2 rounded mb-3"
              value={lectureCode}
              onChange={(e) => setLectureCode(e.target.value)}
            />
            <select
              className="w-full border p-2 rounded mb-4"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Select Year</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>
            <button
              onClick={generateQR}
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              Generate QR
            </button>
            {qrData && (
              <div className="mt-6 bg-white p-6 rounded-2xl shadow flex flex-col items-center">
                <QRCodeCanvas value={qrData} size={180} />
                <p className="mt-3 font-semibold text-indigo-600">
                  {timeLeft > 0
                    ? `Session ends in ${formatTime(timeLeft)}`
                    : "Session expired ❌"}
                </p>
                <button
                  onClick={() => {
                    setQrData("");
                    setTimeLeft(0);
                    fetchStats(user.teacherId);
                  }}
                  className="mt-3 text-sm text-red-500"
                >
                  End Session
                </button>
              </div>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-500 text-xl"
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {showLiveModal && (
        <LiveAttendanceModal
          user={user}
          onClose={() => setShowLiveModal(false)}
        />
      )}

      {showDownloadModal && (
        <DownloadReportModal
          user={user}
          onClose={() => setShowDownloadModal(false)}
        />
      )}

      {showManualModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white w-[350px] p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center">
              Manual Attendance
            </h2>
            <input
              type="text"
              placeholder="Session ID"
              className="w-full border p-2 rounded mb-3"
              value={manualSessionId}
              onChange={(e) => setManualSessionId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Student ID / Roll No"
              className="w-full border p-2 rounded mb-4"
              value={manualStudentId}
              onChange={(e) => setManualStudentId(e.target.value)}
            />
            <button
              onClick={markManualAttendance}
              className="w-full bg-green-600 text-white py-2 rounded mb-3 cursor-pointer"
            >
              Mark Attendance
            </button>
            <button
              onClick={() => setShowManualModal(false)}
              className="w-full bg-gray-400 text-white py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;