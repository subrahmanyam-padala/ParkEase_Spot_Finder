package com.parkeasy.ParkEase_backend.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminLoginRequest {

	@NotBlank(message = "Email or admin ID is required")
	private String emailOrId;

	@NotBlank(message = "Password is required")
	private String password;

	public String getEmailOrId() {
		return emailOrId;
	}

	public void setEmailOrId(String emailOrId) {
		this.emailOrId = emailOrId;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
}
