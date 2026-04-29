package com.backend.qr_attendance.dto;

import com.backend.qr_attendance.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String message;
    private String token;
    private String email;
    private String name;
    private Role role;
    private String studentId;
    private String teacherId;
}