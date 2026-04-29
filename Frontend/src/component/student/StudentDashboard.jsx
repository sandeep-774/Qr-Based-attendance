import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    attendance: 0,
    classesAttended: 0,
    totalClasses: 0,
  });

  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // 📊 Stats
  const getAttendanceData = async (studentId) => {
    try {
      const response = await fetch("http://localhost:8080/api/student/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId }),
      });

      const result = await response.json();

      setStats({
        attendance: result.attendancePercentage || 0,
        classesAttended: result.classesAttended || 0,
        totalClasses: result.totalClasses || 0,
      });
    } catch (error) {
      console.log("API Error:", error);
    }
  };

  // 📥 Fetch attendance (✅ FIXED SORTING)
  const fetchAttendance = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await fetch(
      "http://localhost:8080/api/student/attendance-history",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: user.studentId,
        }),
      }
    );

    const data = await res.json();

    // ✅ SORT BY DATE (latest first)
    return data.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  };

  // 📄 CSV DOWNLOAD (✅ SERIAL NO ADDED)
  const downloadCSV = async () => {
    const data = await fetchAttendance();

    if (!data || data.length === 0) {
      alert("No records found");
      return;
    }

    const headers = ["No", "Subject", "Teacher", "Code", "Date", "Status"];

    const rows = data.map((item, index) => [
      index + 1,
      `"${item.subjectName || ""}"`,
      `"${item.teacherName || ""}"`,
      `"${item.lectureCode || ""}"`,
      `"${item.date ? new Date(item.date).toLocaleDateString("en-IN") : ""}"`,
      `"${item.status || ""}"`,
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `attendance_${user.studentId}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowDownloadOptions(false);
  };

  // 📄 PDF DOWNLOAD (✅ SERIAL NO ADDED)
 const downloadPDF = async () => {
  const data = await fetchAttendance();

  if (!data || data.length === 0) {
    alert("No records found");
    return;
  }

  const doc = new jsPDF();

  const rows = data.map((item, index) => [
    index + 1,
    item.subjectName,
    item.teacherName,
    item.lectureCode,
    item.date
      ? new Date(item.date).toLocaleDateString("en-IN")
      : "",
    item.status,
  ]);

  autoTable(doc, {
    head: [["No", "Subject", "Teacher", "Code", "Date", "Status"]],
    body: rows,

    // 🔥 COLOR LOGIC
    didParseCell: function (data) {
      if (data.column.index === 5) { // Status column
        if (data.cell.raw === "Absent") {
          data.cell.styles.textColor = [255, 0, 0]; // 🔴 Red
        }
        if (data.cell.raw === "Present") {
          data.cell.styles.textColor = [0, 128, 0]; // 🟢 Green (optional)
        }
      }
    },
  });

  doc.save(`attendance_${user.studentId}.pdf`);
};

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || storedUser.role !== "STUDENT") {
      navigate("/login");
    } else {
      setUser(storedUser);
      getAttendanceData(storedUser.studentId);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              👋 Hi, {user.name}
            </h1>
            <p className="text-gray-500 text-sm">
              Student ID: {user.studentId}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 cursor-pointeri"
          >
            Logout
          </button>
        </div>

        {/* ATTENDANCE SUMMARY */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">📊 Attendance Overview</h2>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-green-500 h-3 rounded-full"
              style={{ width: `${stats.attendance}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-600">
            {stats.attendance}% attendance
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

          <div className="bg-white rounded-xl p-5 shadow text-center">
            <p className="text-gray-500 text-sm">Classes Attended</p>
            <h2 className="text-2xl font-bold text-blue-600">
              {stats.classesAttended}
            </h2>
          </div>

          <div className="bg-white rounded-xl p-5 shadow text-center">
            <p className="text-gray-500 text-sm">Total Classes</p>
            <h2 className="text-2xl font-bold text-purple-600">
              {stats.totalClasses}
            </h2>
          </div>

          <div className="bg-white rounded-xl p-5 shadow text-center">
            <p className="text-gray-500 text-sm">Status</p>
            <h2
              className={`text-xl font-bold ${
                stats.attendance >= 75 ? "text-green-600" : "text-red-500"
              }`}
            >
              {stats.attendance >= 75 ? "Good 👍" : "Low ⚠️"}
            </h2>
          </div>

        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div
            onClick={() => navigate("/scan-qr")}
            className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-2xl shadow hover:scale-[1.03] transition"
          >
            <h2 className="text-lg font-bold mb-1">📷 Scan QR</h2>
            <p className="text-sm opacity-90">
              Mark attendance instantly
            </p>
          </div>

          <div
            onClick={() => navigate("/my-attendance")}
            className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow hover:scale-[1.03] transition"
          >
            <h2 className="text-lg font-bold mb-1">📊 My Records</h2>
            <p className="text-sm opacity-90">
              View attendance history
            </p>
          </div>

          <div
            onClick={() => setShowDownloadOptions(true)}
            className="bg-white border p-6 rounded-2xl shadow hover:shadow-md cursor-pointer"
          >
            <h2 className="text-lg font-semibold">📥 Download Report</h2>
            <p className="text-gray-500 text-sm">CSV / PDF</p>
          </div>

          <div className="bg-white border p-6 rounded-2xl shadow hover:shadow-md cursor-pointer">
            <h2 className="text-lg font-semibold">🔔 Notifications</h2>
            <p className="text-gray-500 text-sm">Coming soon</p>
          </div>

        </div>

      </div>

      {/* DOWNLOAD MODAL */}
      {showDownloadOptions && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-72 text-center">

            <h2 className="text-lg font-bold mb-4">Download Report</h2>

            <button
              onClick={downloadCSV}
              className="w-full bg-blue-500 text-white py-2 rounded mb-3 cursor-pointer"
            >
              Download CSV
            </button>

            <button
              onClick={downloadPDF}
              className="w-full bg-red-500 text-white py-2 rounded mb-3 cursor-pointer"
            >
              Download PDF
            </button>

            <button
              onClick={() => setShowDownloadOptions(false)}
              className="text-gray-500 cursor-pointer"
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;