package com.parkeasy.ParkEase_backend.controller;

import com.parkeasy.ParkEase_backend.dto.AdminAuthResponse;
import com.parkeasy.ParkEase_backend.dto.AdminLoginRequest;
import com.parkeasy.ParkEase_backend.dto.AdminRegisterRequest;
import com.parkeasy.ParkEase_backend.dto.AdminResetPasswordRequest;
import com.parkeasy.ParkEase_backend.entity.AdminUser;
import com.parkeasy.ParkEase_backend.service.AdminAuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

	private final AdminAuthService adminAuthService;

	public AdminAuthController(AdminAuthService adminAuthService) {
		this.adminAuthService = adminAuthService;
	}

	@PostMapping("/register")
	public ResponseEntity<AdminAuthResponse> register(@Valid @RequestBody AdminRegisterRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(adminAuthService.register(request));
	}

	@PostMapping("/login")
	public ResponseEntity<AdminAuthResponse> login(@Valid @RequestBody AdminLoginRequest request) {
		return ResponseEntity.ok(adminAuthService.login(request));
	}

	@PostMapping("/reset-password")
	public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody AdminResetPasswordRequest request) {
		adminAuthService.resetPassword(request);
		return ResponseEntity.ok(Map.of("message", "Admin password reset successful"));
	}

	@GetMapping("/me")
	public ResponseEntity<AdminUser> me(Authentication authentication) {
		return ResponseEntity.ok(adminAuthService.getAdminByPrincipal(authentication.getName()));
	}
}
