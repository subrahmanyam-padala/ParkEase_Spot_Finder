package com.parkeasy.ParkEase_backend.service;

public interface OtpService {

	/**
	 * Generate and send OTP to the given email
	 * 
	 * @param email The email address to send OTP to
	 * @return true if OTP sent successfully, false otherwise
	 */
	boolean generateAndSendOtp(String email);

	/**
	 * Verify the OTP entered by user
	 * 
	 * @param email The email address
	 * @param otp   The OTP entered by user
	 * @return true if OTP is valid and not expired, false otherwise
	 */
	boolean verifyOtp(String email, String otp);

	/**
	 * Clear OTP from cache after successful verification
	 * 
	 * @param email The email address
	 */
	void clearOtp(String email);
}
