package com.backend.qr_attendance.controller;

import com.backend.qr_attendance.dto.SessionRequest;
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
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@CrossOrigin
public class QrController {

    private final LectureSessionRepository lectureSessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    @PostMapping("/create-session")
    public Map<String, String> createSession(@RequestBody SessionRequest req) {

        LectureSession session = new LectureSession();
        session.setLectureName(req.getLectureName());
        session.setLectureCode(req.getLectureCode());
        session.setYear(req.getYear());
        session.setTeacherId(req.getTeacherId()); // ✅ now coming

        session.setStartTime(LocalDateTime.now());
        session.setEndTime(LocalDateTime.now().plusMinutes(30));

        lectureSessionRepository.save(session);


        return Map.of("sessionId", session.getId().toString());
    }

    @GetMapping("/sessions/{teacherId}")
    public List<LectureSession> getSessions(@PathVariable String teacherId) {
        List<LectureSession> sessions = lectureSessionRepository.findByTeacherId(teacherId);
        System.out.println(sessions);
        return sessions;
    }

    @PostMapping("/report-data")
    public List<Map<String, Object>> attendanceHistory(@RequestBody Map<String, String> request) {

        String teacherId = request.get("teacherId");
        String year = request.get("year");
        String date = request.get("date");

        List<Map<String, Object>> result = new ArrayList<>();

        try {
            LocalDate selectedDate = LocalDate.parse(date);

            List<Attendance> records = attendanceRepository.findAll();

            for (Attendance a : records) {

                Optional<LectureSession> sessionOpt =
                        lectureSessionRepository.findById(a.getSessionId());

                if (sessionOpt.isEmpty()) continue;

                LectureSession session = sessionOpt.get();

                // 🔥 FILTERS
                if (!session.getTeacherId().equals(teacherId)) continue;
                if (!session.getYear().equals(year)) continue;

                if (!a.getMarkedAt().toLocalDate().equals(selectedDate)) continue;

                // ✅ STUDENT NAME FIX
                String studentName = userRepository
                        .findByStudentId(a.getStudentId())
                        .map(User::getName)
                        .orElse("Unknown");

                Map<String, Object> map = new HashMap<>();

                map.put("studentId", a.getStudentId());
                map.put("studentName", studentName); // ⭐ ADD THIS
                map.put("subjectName", session.getLectureName());
                map.put("lectureCode", session.getLectureCode());
                map.put("date", a.getMarkedAt());
                map.put("sessionId", a.getSessionId());
                map.put("status", "Present"); // (optional but useful)

                result.add(map);
            }

            // 🔥 SORT
            result.sort((a, b) ->
                    a.get("subjectName").toString()
                            .compareToIgnoreCase(b.get("subjectName").toString())
            );

        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }

    @PostMapping("/extend-session")
    public Map<String, String> extendSession(@RequestBody Map<String, String> request) {

        String sessionId = request.get("sessionId");

        LectureSession session = lectureSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        LocalDate today = LocalDate.now();
        LocalDate sessionDate = session.getStartTime().toLocalDate();

        // ❌ Allow only same day
        if (!today.equals(sessionDate)) {
            throw new RuntimeException("Session can only be extended on the same day ❌");
        }

        // 🔥 Extend by 30 min
        session.setEndTime(LocalDateTime.now().plusMinutes(30));
        lectureSessionRepository.save(session);

        Map<String, String> res = new HashMap<>();
        res.put("message", "Session extended for 30 minutes ✅");
        return res;
    }

    @PostMapping("/manual-attendance")
    public String markManualAttendance(@RequestBody Map<String, String> req) {

        String sessionId = req.get("sessionId");
        String studentId = req.get("studentId");

        LectureSession session = lectureSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Invalid session"));

        User student = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // 🔥 already marked check
        if (attendanceRepository.existsByStudentIdAndSessionId(studentId, sessionId)) {
            return "Already marked ⚠️";
        }

        // 🔥 save
        Attendance a = new Attendance();
        a.setStudentId(studentId);
        a.setSessionId(sessionId);
        a.setMarkedAt(LocalDateTime.now());

        attendanceRepository.save(a);

        return "Attendance marked manually ✅";
    }
}