package com.backend.qr_attendance.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String name;
    private String email;
    private String contact;
    private String password;
    private String teacherId;
    private String studentId;
    private String year;
    private String registrationCode;
}
