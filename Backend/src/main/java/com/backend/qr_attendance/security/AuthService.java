package com.backend.qr_attendance.security;

import com.backend.qr_attendance.dto.LoginRequest;
import com.backend.qr_attendance.dto.LoginResponse;
import com.backend.qr_attendance.dto.RegisterRequest;
import com.backend.qr_attendance.entity.Role;
import com.backend.qr_attendance.entity.User;
import com.backend.qr_attendance.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public String register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already registered!";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setContact(request.getContact());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Decide role from registrationCode
        Role role;
        if ("STU8113".equals(request.getRegistrationCode())) {
            role = Role.STUDENT;
            user.setStudentId(request.getStudentId());
            user.setYear(request.getYear());
        }
        else if ("TCH8181".equals(request.getRegistrationCode())) {
            role = Role.TEACHER;
            user.setTeacherId(request.getTeacherId());
        }
        else {
            return "Invalid Registration Code!";
        }

        user.setRole(role);

        userRepository.save(user);

        return "User Registered Successfully!";
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        LoginResponse response = new LoginResponse();
        response.setMessage("Login Successful");
        response.setToken(token);
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole());

        if (user.getRole() == Role.STUDENT) {
            response.setStudentId(user.getStudentId());
        } else if (user.getRole() == Role.TEACHER) {
            response.setTeacherId(user.getTeacherId());
        }

        return response;
    }
}