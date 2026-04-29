import React, { useEffect, useState } from "react";

const AttendanceHistory = () => {
  const [data, setData] = useState([]);

  // 📥 Fetch attendance
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

    const result = await res.json();
    setData(result);
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-xl md:text-2xl font-bold mb-6">
          📊 Attendance History
        </h1>

        {/* ✅ DESKTOP TABLE */}
        <div className="hidden md:block bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th  className="p-3">No</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Teacher</th>
                <th className="p-3">Code</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{i+1}</td>
                  <td className="p-3">{item.subjectName}</td>
                  <td className="p-3">{item.teacherName}</td>
                  <td className="p-3">{item.lectureCode}</td>
                  <td className="p-3">
                    {item.date
                      ? new Date(item.date).toLocaleDateString("en-IN")
                      : "N/A"}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        item.status === "Present"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ MOBILE CARDS */}
        <div className="md:hidden space-y-4">
          {data.map((item, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow">

              <h2 className="font-bold text-lg text-indigo-600">
                {item.subjectName}
              </h2>

              <p className="text-sm text-gray-600">
                Teacher: {item.teacherName}
              </p>

              <p className="text-sm text-gray-600">
                Code: {item.lectureCode}
              </p>

              <p className="text-sm text-gray-600">
                Date:{" "}
                {item.date
                  ? new Date(item.date).toLocaleDateString("en-IN")
                  : "N/A"}
              </p>

              <div className="mt-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    item.status === "Present"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AttendanceHistory;