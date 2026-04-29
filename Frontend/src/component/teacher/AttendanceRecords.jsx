import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

const AttendanceRecords = () => {
    const [sessions, setSessions] = useState([]);
    const [user, setUser] = useState(null);

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
    const fetchSessions = async (teacherId) => {
        try {
            const res = await axios.get(
                `http://localhost:8080/api/teacher/sessions/${teacherId}`
            );
            setSessions(res.data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
            fetchSessions(storedUser.teacherId);
        }
    }, []);

    // ✅ 🔥 FIXED: Regenerate QR WITHOUT creating new session
    const regenerateQR = (session) => {
        setQrData(
            JSON.stringify({
                sessionId: session.id, // ✅ SAME SESSION ID
                lectureName: session.lectureName,
                lectureCode: session.lectureCode,
                year: session.year,
            })
        );

        setTimeLeft(30 * 60); // ⏳ reset timer
    };

    // 📅 Safe Date
    const formatDate = (dateValue) => {
        if (!dateValue) return "N/A";
        try {
            return new Date(dateValue).toLocaleDateString("en-IN");
        } catch {
            return "Invalid Date";
        }
    };

    // 🔥 SORT: Active first → Latest first
    const sortedSessions = [...sessions].sort((a, b) => {
        const isActiveA = a.endTime && new Date(a.endTime) > new Date();
        const isActiveB = b.endTime && new Date(b.endTime) > new Date();

        if (isActiveA && !isActiveB) return -1;
        if (!isActiveA && isActiveB) return 1;

        const dateA = new Date(a.createdAt || a.startTime || 0);
        const dateB = new Date(b.createdAt || b.startTime || 0);

        return dateB - dateA;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">

                <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                    📊 Attendance Records
                </h1>

                {/* ✅ DESKTOP TABLE */}
                <div className="hidden md:block bg-white rounded-2xl shadow overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">Lecture</th>
                                <th className="p-3">Code</th>
                                <th className="p-3">Year</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Session ID</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sortedSessions.map((s, i) => {
                                const isActive =
                                    s.endTime && new Date(s.endTime) > new Date();

                                return (
                                    <tr key={i} className="border-t">
                                        <td className="p-3">{s.lectureName}</td>
                                        <td className="p-3">{s.lectureCode}</td>
                                        <td className="p-3">{s.year || "N/A"}</td>
                                        <td className="p-3">
                                            {formatDate(s.createdAt || s.startTime)}
                                        </td>
                                        <td className="p-3">{s.id}</td>

                                        <td className="p-3">
                                            <span
                                                className={`px-2 py-1 rounded text-sm ${
                                                    isActive
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-red-100 text-red-600"
                                                }`}
                                            >
                                                {isActive ? "Active" : "Expired"}
                                            </span>
                                        </td>

                                        <td className="p-3">
                                            <button
                                                onClick={() => regenerateQR(s)}
                                                className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 cursor-pointer"
                                            >
                                                🔁 Regenerate
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* ✅ MOBILE CARDS */}
                <div className="md:hidden space-y-4">
                    {sortedSessions.map((s, i) => {
                        const isActive =
                            s.endTime && new Date(s.endTime) > new Date();

                        return (
                            <div key={i} className="bg-white p-4 rounded-xl shadow">

                                <h2 className="font-bold text-lg">
                                    {s.lectureName}
                                </h2>

                                <p className="text-sm text-gray-600">
                                    Code: {s.lectureCode}
                                </p>

                                <p className="text-sm text-gray-600">
                                    Year: {s.year || "N/A"}
                                </p>

                                <p className="text-sm text-gray-600">
                                    Date: {formatDate(s.createdAt || s.startTime)}
                                </p>

                                <p className="text-sm text-gray-600 break-all">
                                    Session ID: {s.id}
                                </p>

                                <div className="flex justify-between items-center mt-3">

                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            isActive
                                                ? "bg-green-100 text-green-600"
                                                : "bg-red-100 text-red-600"
                                        }`}
                                    >
                                        {isActive ? "Active" : "Expired"}
                                    </span>

                                    <button
                                        onClick={() => regenerateQR(s)}
                                        className="bg-indigo-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                        🔁 QR
                                    </button>

                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* QR MODAL */}
                {qrData && (
                    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">

                            <QRCodeCanvas value={qrData} size={180} />

                            <p className="mt-3 font-semibold text-indigo-600">
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
        </div>
    );
};

export default AttendanceRecords;