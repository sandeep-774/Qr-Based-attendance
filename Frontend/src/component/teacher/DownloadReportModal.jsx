import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DownloadReportModal = ({ user, onClose }) => {
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch data (SAFE)
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/teacher/report-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherId: user.teacherId,
          year,
          date,
        }),
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to fetch data. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 🔥 GROUP BY SUBJECT
  const groupBySubject = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const subject = item.subjectName || "Unknown";

      if (!grouped[subject]) {
        grouped[subject] = [];
      }

      grouped[subject].push(item);
    });

    return grouped;
  };

  // 📄 CSV
  const downloadCSV = async () => {
    if (!year || !date) {
      alert("Please select both year and date");
      return;
    }

    const data = await fetchData();

    if (!data.length) {
      alert("No records found for the selected criteria");
      return;
    }

    const grouped = groupBySubject(data);

    let csv = "Subject,Student ID,Student Name,Code,Date,Status\n";

    Object.keys(grouped).forEach((subject) => {
      grouped[subject].forEach((item) => {
        csv += `"${item.subjectName}","${item.studentId || ""}","${item.studentName || ""}","${item.lectureCode || ""}","${
          item.date ? new Date(item.date).toLocaleDateString("en-IN") : ""
        }","${item.status || "Present"}"\n`;
      });
      csv += `\n`; // Add empty line between subjects
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_${year}_${date}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // 📄 PDF
  const downloadPDF = async () => {
    if (!year || !date) {
      alert("Please select both year and date");
      return;
    }

    const data = await fetchData();

    if (!data.length) {
      alert("No records found for the selected criteria");
      return;
    }

    const grouped = groupBySubject(data);

    const doc = new jsPDF();
    let pageHeight = doc.internal.pageSize.height;
    let y = 20;

    // Add header
    doc.setFontSize(16);
    doc.text(`Attendance Report - ${year} Year`, 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(date).toLocaleDateString("en-IN")}`, 105, 22, { align: "center" });
    
    y = 30;

    Object.keys(grouped).forEach((subject, index) => {
      // Check if we need a new page
      if (y > pageHeight - 50) {
        doc.addPage();
        y = 20;
      }

      // Subject header
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text(subject, 14, y);
      
      y += 5;

      // Create table
      autoTable(doc, {
        startY: y,
        head: [["Student ID", "Student Name", "Code", "Status"]],
        body: grouped[subject].map((item) => [
          item.studentId || "",
          item.studentName || "",
          item.lectureCode || "",
          item.status || "Present",
        ]),
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255],
        },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 10;
    });

    doc.save(`attendance_${year}_${date}.pdf`);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-[90%] max-w-md p-6 rounded-2xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4 text-center cursor-pointer">
          📥 Download Report
        </h2>

        {/* YEAR */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Select Year</label>
          <select
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Select Year</option>
            <option value="1st">1st Year</option>
            <option value="2nd">2nd Year</option>
            <option value="3rd">3rd Year</option>
            <option value="4th">4th Year</option>
          </select>
        </div>

        {/* DATE */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* BUTTONS */}
        <button
          onClick={downloadCSV}
          disabled={loading}
          className="cursor-pointer w-full bg-blue-500 text-white py-2 rounded mb-3 hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Download CSV"}
        </button>

        <button
          onClick={downloadPDF}
          disabled={loading}
          className="cursor-pointer w-full bg-red-500 text-white py-2 rounded mb-3 hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Download PDF"}
        </button>

        <button
          onClick={onClose}
          className="cursor-pointer w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DownloadReportModal;