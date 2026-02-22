package com.parkeasy.ParkEase_backend.controller;

import com.parkeasy.ParkEase_backend.dto.AuthRequest;
import com.parkeasy.ParkEase_backend.dto.AuthResponse;
import com.parkeasy.ParkEase_backend.dto.OtpRequest;
import com.parkeasy.ParkEase_backend.dto.OtpVerifyRequest;
import com.parkeasy.ParkEase_backend.dto.UsersRequestDTO;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.security.JwtUtil;
import com.parkeasy.ParkEase_backend.service.OtpService;
import com.parkeasy.ParkEase_backend.service.UsersService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UsersService usersService;
    private final OtpService otpService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UsersService usersService,
                          OtpService otpService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.usersService = usersService;
        this.otpService = otpService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));

            String token = jwtUtil.generateToken(authRequest.getUsername());

            return ResponseEntity.ok(new AuthResponse(token, authRequest.getUsername(), "Login successful"));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, null, "Invalid username or password"));
        }
    }

    /**
     * Step 1: Send OTP to email for verification
     */
    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@Valid @RequestBody OtpRequest otpRequest) {
        boolean sent = otpService.generateAndSendOtp(otpRequest.getEmail());

        if (sent) {
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully to " + otpRequest.getEmail(), "email",
                    otpRequest.getEmail()));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to send OTP. Please try again."));
        }
    }

    /**
     * Step 2: Verify OTP and register user if valid
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> verifyOtpAndRegister(@Valid @RequestBody OtpVerifyRequest request) {
        // Verify OTP first
        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());

        if (!isValid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse(null, null, "Invalid or expired OTP"));
        }

        try {
            // OTP is valid, create user
            UsersRequestDTO usersRequestDTO = new UsersRequestDTO(request.getFullName(), request.getUsername(),
                    request.getPassword(), request.getEmail());

            Users user = usersService.createUsers(usersRequestDTO);

            // Clear OTP after successful registration
            otpService.clearOtp(request.getEmail());

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUsername());

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new AuthResponse(token, user.getUsername(), "Email verified and user registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse(null, null, "Registration failed: " + e.getMessage()));
        }
    }

}
