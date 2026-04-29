package com.backend.qr_attendance.dto;

import lombok.Data;

@Data
public class ScanRequest {

    private String sessionId;   // QR se aayega
    private String studentId;
    private String year;
}