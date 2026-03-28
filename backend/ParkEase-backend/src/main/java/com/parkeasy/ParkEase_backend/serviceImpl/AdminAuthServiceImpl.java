package com.parkeasy.ParkEase_backend.serviceImpl;

import com.parkeasy.ParkEase_backend.dto.AdminAuthResponse;
import com.parkeasy.ParkEase_backend.dto.AdminLoginRequest;
import com.parkeasy.ParkEase_backend.dto.AdminRegisterRequest;
import com.parkeasy.ParkEase_backend.dto.AdminResetPasswordRequest;
import com.parkeasy.ParkEase_backend.entity.AdminUser;
import com.parkeasy.ParkEase_backend.repository.AdminUserRepository;
import com.parkeasy.ParkEase_backend.security.JwtUtil;
import com.parkeasy.ParkEase_backend.service.AdminAuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthServiceImpl implements AdminAuthService {

	private static final String ADMIN_TOKEN_PREFIX = "ADMIN::";

	private final AdminUserRepository adminUserRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	public AdminAuthServiceImpl(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder,
			JwtUtil jwtUtil) {
		this.adminUserRepository = adminUserRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
	}

	@Override
	public AdminAuthResponse register(AdminRegisterRequest request) {
		String email = request.getEmail().trim().toLowerCase();
		String adminId = request.getAdminId().trim().toUpperCase();

		if (adminUserRepository.existsByEmail(email)) {
			throw new RuntimeException("Admin email already exists");
		}
		if (adminUserRepository.existsByAdminId(adminId)) {
			throw new RuntimeException("Admin ID already exists");
		}

		AdminUser admin = new AdminUser();
		admin.setName(request.getName().trim());
		admin.setEmail(email);
		admin.setMobile(request.getMobile().trim());
		admin.setAdminId(adminId);
		admin.setPassword(passwordEncoder.encode(request.getPassword()));
		admin.setStatus("Active");

		AdminUser savedAdmin = adminUserRepository.save(admin);
		String token = jwtUtil.generateToken(ADMIN_TOKEN_PREFIX + savedAdmin.getAdminId());
		return toAuthResponse(savedAdmin, token, "Admin registered successfully");
	}

	@Override
	public AdminAuthResponse login(AdminLoginRequest request) {
		String value = request.getEmailOrId().trim();
		AdminUser admin = adminUserRepository.findByEmail(value.toLowerCase())
				.or(() -> adminUserRepository.findByAdminId(value.toUpperCase()))
				.orElseThrow(() -> new RuntimeException("Invalid admin credentials"));

		if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
			throw new RuntimeException("Invalid admin credentials");
		}

		String token = jwtUtil.generateToken(ADMIN_TOKEN_PREFIX + admin.getAdminId());
		return toAuthResponse(admin, token, "Admin login successful");
	}

	@Override
	public void resetPassword(AdminResetPasswordRequest request) {
		AdminUser admin = adminUserRepository.findByEmail(request.getEmail().trim().toLowerCase())
				.filter(existing -> existing.getAdminId().equalsIgnoreCase(request.getAdminId().trim()))
				.orElseThrow(() -> new RuntimeException("Admin not found for the provided email and admin ID"));

		admin.setPassword(passwordEncoder.encode(request.getPassword()));
		adminUserRepository.save(admin);
	}

	@Override
	public AdminUser getAdminByPrincipal(String principal) {
		String normalized = principal;
		if (principal != null && principal.startsWith(ADMIN_TOKEN_PREFIX)) {
			normalized = principal.substring(ADMIN_TOKEN_PREFIX.length());
		}
		return adminUserRepository.findByAdminId(normalized)
				.orElseThrow(() -> new RuntimeException("Admin not found"));
	}

	private AdminAuthResponse toAuthResponse(AdminUser admin, String token, String message) {
		return new AdminAuthResponse(token, message, admin.getId(), admin.getName(), admin.getEmail(), admin.getMobile(),
				admin.getAdminId(), admin.getStatus(), admin.getCreatedAt());
	}
}
