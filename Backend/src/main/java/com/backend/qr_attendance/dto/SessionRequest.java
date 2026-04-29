package com.backend.qr_attendance.dto;

import lombok.Data;

@Data
public class SessionRequest {

    private String lectureName;
    private String lectureCode;
    private String teacherId;
    private String year;
}