package com.backend.qr_attendance.controller;

import com.backend.qr_attendance.dto.ScanRequest;
import com.backend.qr_attendance.entity.Attendance;
import com.backend.qr_attendance.entity.LectureSession;
import com.backend.qr_attendance.entity.User;
import com.backend.qr_attendance.repository.AttendanceRepository;
import com.backend.qr_attendance.repository.LectureSessionRepository;
import com.backend.qr_attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@CrossOrigin
public class ScanController {

    private final LectureSessionRepository lectureSessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    @PostMapping("/mark-attendance")
    public String markAttendance(@RequestBody ScanRequest req) {

        LectureSession session = lectureSessionRepository.findById(req.getSessionId())
                .orElseThrow(() -> new RuntimeException("Invalid QR"));
        User student = userRepository.findByStudentId(req.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String sessionYear = session.getYear();
        String studentYear = student.getYear();
        System.out.println("@@@@@@@" + " " + sessionYear + "  " + studentYear);
//         Check if student year is null
        if (studentYear == null || studentYear.isEmpty()) {
            return "Your profile doesn't have year assigned. Please contact administrator.";
        }

        // Check if session year is null
        if (sessionYear == null || sessionYear.isEmpty()) {
            return "This QR code doesn't have year specified.";
        }

        // Check year mismatch
        if (!studentYear.equals(sessionYear)) {
            return "This QR is for " + sessionYear + " year students. You are in " + studentYear + " year.";
        }

        if (LocalDateTime.now().isAfter(session.getEndTime())) {
            return "QR Expired";
        }

        if (attendanceRepository.existsByStudentIdAndSessionId(req.getStudentId(), req.getSessionId())) {
            return "Already Marked";
        }

        Attendance attendance = new Attendance();
        attendance.setStudentId(req.getStudentId());
        attendance.setSessionId(req.getSessionId());
        attendance.setMarkedAt(LocalDateTime.now());
        attendanceRepository.save(attendance);

        return "Attendance Marked";
    }

    @PostMapping("/stats")
    public Map<String, Object> getStudentStats(@RequestBody Map<String, String> request) {

        String studentId = request.get("studentId");

        if (studentId == null || studentId.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Student ID is required");
            return error;
        }

        // 1. Get student details to know their year
        User student = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String studentYear = student.getYear();

        // 2. Get total classes attended by this student (from attendance table)
        int classesAttended = attendanceRepository.countByStudentId(studentId);

        // 3. Get total classes ONLY for this student's year
        int totalClasses = lectureSessionRepository.countByYear(studentYear);

        // 4. Calculate percentage
        double attendancePercentage = totalClasses > 0 ? (classesAttended * 100.0) / totalClasses : 0;
        attendancePercentage = Math.round(attendancePercentage * 10.0) / 10.0;

        // 5. Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("attendancePercentage", attendancePercentage);
        response.put("classesAttended", classesAttended);
        response.put("totalClasses", totalClasses);

        return response;
    }

    @PostMapping("/attendance-history")
    public List<Map<String, Object>> attendanceHistory(@RequestBody Map<String, String> request) {

        String studentId = request.get("studentId");

        List<Map<String, Object>> list = new ArrayList<>();

        try {
            // 🔥 1. Get student
            User student = userRepository.findByStudentId(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            String studentYear = student.getYear();

            // 🔥 2. Get all sessions of that year
            List<LectureSession> sessions = lectureSessionRepository.findByYear(studentYear);

            for (LectureSession session : sessions) {

                // 🔥 3. Get teacher
                User teacher = userRepository.findByTeacherId(session.getTeacherId())
                        .orElse(null);

                // 🔥 4. Check attendance
                boolean isPresent = attendanceRepository
                        .existsByStudentIdAndSessionId(studentId, session.getId());

                // 🔥 5. Prepare response
                Map<String, Object> map = new HashMap<>();
                map.put("subjectName", session.getLectureName());
                map.put("teacherName", teacher != null ? teacher.getName() : "Unknown");
                map.put("lectureCode", session.getLectureCode());
                map.put("date", session.getStartTime());
                map.put("status", isPresent ? "Present" : "Absent");

                list.add(map);
            }

            // 🔥 SORT BY DATE (latest first)
            list.sort((a, b) -> {
                LocalDateTime d1 = (LocalDateTime) a.get("date");
                LocalDateTime d2 = (LocalDateTime) b.get("date");
                return d2.compareTo(d1);
            });

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }
}
