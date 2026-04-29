import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ScanResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return null;

  // QR data
  const data = JSON.parse(state.qrData);

  // Student from login
  const user = JSON.parse(localStorage.getItem("user"));
  const markAttendance = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/student/mark-attendance",
        {
          sessionId: data.sessionId,
          studentId: user.studentId,
        }
      );

      alert(res.data);

      if (res.data === "Attendance Marked" || res.data === "Already Marked") {
        navigate("/student-dashboard");
      }
      else navigate("/scan-qr")

    } catch (e) {
      if (e.response && e.response.data) {
        alert(e.response.data);
      } else {
        alert("Server Error");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md text-center">

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Confirm Attendance
        </h2>

        <div className="text-left space-y-2 text-gray-700 mb-6">
          <p><b>Subject:</b> {data.lectureName}</p>
          <p><b>Code:</b> {data.lectureCode}</p>
          <p><b>Year:</b> {data.year}</p>
        </div>

        <button
          onClick={markAttendance}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl shadow-md transition"
        >
          Mark Attendance
        </button>
      </div>
    </div>
  );
};

export default ScanResult;