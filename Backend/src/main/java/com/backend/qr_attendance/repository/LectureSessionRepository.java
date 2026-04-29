package com.backend.qr_attendance.repository;

import com.backend.qr_attendance.entity.LectureSession;
import com.backend.qr_attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LectureSessionRepository extends JpaRepository<LectureSession, String> {

    int countByYear(String studentYear);
    List<LectureSession> findByYear(String studentYear);
    List<LectureSession> findByTeacherId(String teacherId);

}
