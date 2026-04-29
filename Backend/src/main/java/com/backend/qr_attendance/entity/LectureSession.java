package com.backend.qr_attendance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
public class LectureSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String lectureName;
    private String lectureCode;
    private String teacherId;
    private String year;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}