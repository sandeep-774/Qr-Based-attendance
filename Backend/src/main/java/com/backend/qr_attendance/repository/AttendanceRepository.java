package com.backend.qr_attendance.repository;

import com.backend.qr_attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    boolean existsByStudentIdAndSessionId(String studentId, String sessionId);

    int countByStudentId(String studentId);
}
