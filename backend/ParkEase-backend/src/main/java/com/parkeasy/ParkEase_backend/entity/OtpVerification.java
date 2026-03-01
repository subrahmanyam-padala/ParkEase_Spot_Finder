package com.parkeasy.ParkEase_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * @author Atharv Ital
 */
@Entity
@Table(name = "otp_verification")
public class OtpVerification {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "otp_id")
	private Long otpId;

	@Column(name = "email", nullable = false, unique = true)
	private String email;

	@Column(name = "otp", nullable = false, length = 6)
	private String otp;

	@Column(name = "expiry_time", nullable = false)
	private LocalDateTime expiryTime;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "is_verified", nullable = false)
	private Boolean isVerified = false;

	public OtpVerification() {
	}

	public OtpVerification(String email, String otp, LocalDateTime expiryTime) {
		this.email = email;
		this.otp = otp;
		this.expiryTime = expiryTime;
		this.createdAt = LocalDateTime.now();
		this.isVerified = false;
	}

	public Long getOtpId() {
		return otpId;
	}

	public void setOtpId(Long otpId) {
		this.otpId = otpId;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getOtp() {
		return otp;
	}

	public void setOtp(String otp) {
		this.otp = otp;
	}

	public LocalDateTime getExpiryTime() {
		return expiryTime;
	}

	public void setExpiryTime(LocalDateTime expiryTime) {
		this.expiryTime = expiryTime;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public Boolean getIsVerified() {
		return isVerified;
	}

	public void setIsVerified(Boolean isVerified) {
		this.isVerified = isVerified;
	}
}
