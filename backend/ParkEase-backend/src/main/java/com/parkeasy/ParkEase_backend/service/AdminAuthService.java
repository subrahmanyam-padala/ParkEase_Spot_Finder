package com.parkeasy.ParkEase_backend.service;

import com.parkeasy.ParkEase_backend.dto.AdminAuthResponse;
import com.parkeasy.ParkEase_backend.dto.AdminLoginRequest;
import com.parkeasy.ParkEase_backend.dto.AdminRegisterRequest;
import com.parkeasy.ParkEase_backend.dto.AdminResetPasswordRequest;
import com.parkeasy.ParkEase_backend.entity.AdminUser;

public interface AdminAuthService {

	AdminAuthResponse register(AdminRegisterRequest request);

	AdminAuthResponse login(AdminLoginRequest request);

	void resetPassword(AdminResetPasswordRequest request);

	AdminUser getAdminByPrincipal(String principal);
}
