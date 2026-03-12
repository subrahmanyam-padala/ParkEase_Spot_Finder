package com.parkeasy.ParkEase_backend.dto;

import java.time.LocalDateTime;

public class AdminAuthResponse {

	private String token;
	private String message;
	private Long id;
	private String name;
	private String email;
	private String mobile;
	private String adminId;
	private String status;
	private LocalDateTime createdAt;

	public AdminAuthResponse() {
	}

	public AdminAuthResponse(String token, String message, Long id, String name, String email, String mobile,
			String adminId, String status, LocalDateTime createdAt) {
		this.token = token;
		this.message = message;
		this.id = id;
		this.name = name;
		this.email = email;
		this.mobile = mobile;
		this.adminId = adminId;
		this.status = status;
		this.createdAt = createdAt;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getMobile() {
		return mobile;
	}

	public void setMobile(String mobile) {
		this.mobile = mobile;
	}

	public String getAdminId() {
		return adminId;
	}

	public void setAdminId(String adminId) {
		this.adminId = adminId;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
