import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

const LiveAttendanceModal = ({ user, onClose }) => {
  const [sessions, setSessions] = useState([]);

  const [qrData, setQrData] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  // ⏳ Timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // 🔥 Fetch sessions
  const fetchSessions = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/teacher/sessions/${user.teacherId}`
      );

      const sorted = res.data.sort(
        (a, b) =>
          new Date(b.createdAt || b.startTime) -
          new Date(a.createdAt || a.startTime)
      );

      setSessions(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // 🔁 Regenerate QR
  const regenerateQR = async (session) => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/teacher/create-session",
        {
          lectureName: session.lectureName,
          lectureCode: session.lectureCode,
          year: session.year,
          teacherId: user.teacherId,
        }
      );

      const newSessionId = res.data.sessionId;

      setQrData(
        JSON.stringify({
          sessionId: newSessionId,
          lectureName: session.lectureName,
          lectureCode: session.lectureCode,
          year: session.year,
        })
      );

      setTimeLeft(30 * 60);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Active sessions only
  const activeSessions = sessions.filter(
    (s) => s.endTime && new Date(s.endTime) > new Date()
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
    >
      {/* ⛔ Prevent close on inside click */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[90%] max-w-md p-5 rounded-2xl shadow-lg max-h-[80vh] overflow-y-auto"
      >
        <h2 className="text-lg font-bold mb-4 text-center">
          🟢 Live Attendance
        </h2>

        {activeSessions.length === 0 ? (
          <p className="text-center text-gray-500">
            No active sessions found
          </p>
        ) : (
          <div className="space-y-4">
            {activeSessions.map((s, i) => (
              <div key={i} className="border p-4 rounded-xl shadow-sm">
                <h3 className="font-semibold text-indigo-600 text-lg">
                  {s.lectureName}
                </h3>

                <p className="text-sm text-gray-600">
                  Code: {s.lectureCode}
                </p>

                <p className="text-sm text-gray-600">
                  Year: {s.year || "N/A"}
                </p>

                <p className="text-xs text-gray-400 break-all">
                  Session ID: {s.id}
                </p>

                <div className="flex justify-between items-center mt-3">
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                    Active
                  </span>

                  <button
                    onClick={() => regenerateQR(s)}
                    className="bg-indigo-500 text-white px-3 py-1 rounded text-sm cursor-pointer"
                  >
                    🔁 Regenerate QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Bottom Close Button */}
        <button
          onClick={onClose}
          className="mt-5 w-full bg-red-500 text-white py-2 rounded cursor-pointer"
        >
          Close
        </button>
      </div>

      {/* ✅ QR MODAL */}
      {qrData && (
        <div
          onClick={() => {
            setQrData("");
            setTimeLeft(0);
          }}
          className="fixed inset-0 bg-black/50 flex justify-center items-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-2xl text-center"
          >
            <QRCodeCanvas value={qrData} size={180} />

            <p className="mt-3 text-indigo-600 font-semibold">
              {timeLeft > 0
                ? `Expires in ${formatTime(timeLeft)}`
                : "QR Expired ❌"}
            </p>

            <button
              onClick={() => {
                setQrData("");
                setTimeLeft(0);
              }}
              className="mt-3 text-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAttendanceModal;