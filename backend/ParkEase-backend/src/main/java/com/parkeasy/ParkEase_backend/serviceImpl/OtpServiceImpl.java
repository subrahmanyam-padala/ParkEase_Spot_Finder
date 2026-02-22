package com.parkeasy.ParkEase_backend.serviceImpl;

import com.parkeasy.ParkEase_backend.entity.OtpVerification;
import com.parkeasy.ParkEase_backend.repository.OtpRepository;
import com.parkeasy.ParkEase_backend.service.EmailService;
import com.parkeasy.ParkEase_backend.service.OtpService;
import jakarta.mail.MessagingException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpServiceImpl implements OtpService {

	private final EmailService emailService;
	private final OtpRepository otpRepository;

	// OTP validity duration in minutes
	private static final int OTP_VALIDITY_MINUTES = 10;

	public OtpServiceImpl(EmailService emailService, OtpRepository otpRepository) {
		this.emailService = emailService;
		this.otpRepository = otpRepository;
	}

	@Override
	@Transactional
	public boolean generateAndSendOtp(String email) {
		String normalizedEmail = email.toLowerCase();

		// Generate 6-digit OTP
		String otp = generateOtp();
		LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);

		// Check if OTP already exists for this email
		Optional<OtpVerification> existingOtp = otpRepository.findByEmail(normalizedEmail);

		OtpVerification otpVerification;
		if (existingOtp.isPresent()) {
			// Update existing OTP
			otpVerification = existingOtp.get();
			otpVerification.setOtp(otp);
			otpVerification.setExpiryTime(expiryTime);
			otpVerification.setCreatedAt(LocalDateTime.now());
			otpVerification.setIsVerified(false);
		} else {
			// Create new OTP record
			otpVerification = new OtpVerification(normalizedEmail, otp, expiryTime);
		}

		otpRepository.save(otpVerification);

		try {
			emailService.sendOtpEmail(email, otp);
			return true;
		} catch (MessagingException e) {
			System.err.println("Failed to send OTP email: " + e.getMessage());
			otpRepository.deleteByEmail(normalizedEmail);
			return false;
		}
	}

	@Override
	public boolean verifyOtp(String email, String otp) {
		String normalizedEmail = email.toLowerCase();

		Optional<OtpVerification> otpRecord = otpRepository.findByEmail(normalizedEmail);

		if (otpRecord.isEmpty()) {
			return false; // No OTP found for this email
		}

		OtpVerification otpVerification = otpRecord.get();

		// Check if OTP is expired
		if (LocalDateTime.now().isAfter(otpVerification.getExpiryTime())) {
			otpRepository.deleteByEmail(normalizedEmail);
			return false;
		}

		// Verify OTP
		return otpVerification.getOtp().equals(otp);
	}

	@Override
	@Transactional
	public void clearOtp(String email) {
		otpRepository.deleteByEmail(email.toLowerCase());
	}

	private String generateOtp() {
		SecureRandom random = new SecureRandom();
		int otp = 100000 + random.nextInt(900000); // 6-digit OTP
		return String.valueOf(otp);
	}
}
