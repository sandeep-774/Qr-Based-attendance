package com.backend.qr_attendance.repository;

import com.backend.qr_attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByStudentId(String studentId);
    Optional<User> findByTeacherId(String teacherId);
}
