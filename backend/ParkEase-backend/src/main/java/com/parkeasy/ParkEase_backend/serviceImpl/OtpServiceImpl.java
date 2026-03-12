 package com.parkeasy.ParkEase_backend.serviceImpl;

import com.parkeasy.ParkEase_backend.entity.OtpVerification;
import com.parkeasy.ParkEase_backend.repository.OtpRepository;
import com.parkeasy.ParkEase_backend.service.EmailService;
import com.parkeasy.ParkEase_backend.service.OtpService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpServiceImpl implements OtpService {

    private final EmailService emailService;
    private final OtpRepository otpRepository;
    private static final int OTP_VALIDITY_MINUTES = 10;

    public OtpServiceImpl(EmailService emailService, OtpRepository otpRepository) {
        this.emailService = emailService;
        this.otpRepository = otpRepository;
    }

    @Override
    @Transactional
    public boolean generateAndSendOtp(String email) {

        try {
            String normalizedEmail = email.toLowerCase();

            // Generate 6-digit OTP
            String otp = generateOtp();
            LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);

            // Check if OTP already exists
            Optional<OtpVerification> existingOtp = otpRepository.findByEmail(normalizedEmail);

            OtpVerification otpVerification;

            if (existingOtp.isPresent()) {
                otpVerification = existingOtp.get();
                otpVerification.setOtp(otp);
                otpVerification.setExpiryTime(expiryTime);
                otpVerification.setCreatedAt(LocalDateTime.now());
                otpVerification.setIsVerified(false);
            } else {
                otpVerification = new OtpVerification(normalizedEmail, otp, expiryTime);
            }

            otpRepository.save(otpVerification);

            // 🔥 Send email
            emailService.sendOtpEmail(email, otp);

            return true;

        } catch (Exception e) {

            System.out.println("❌ ERROR WHILE SENDING OTP:");
            e.printStackTrace();  // 🔥 THIS WILL SHOW FULL ERROR

            // Clean up DB record if mail failed
            otpRepository.deleteByEmail(email.toLowerCase());

            return false;
        }
    }

    @Override
    public boolean verifyOtp(String email, String otp) {

        try {
            String normalizedEmail = email.toLowerCase();

            Optional<OtpVerification> otpRecord = otpRepository.findByEmail(normalizedEmail);

            if (otpRecord.isEmpty()) {
                return false;
            }

            OtpVerification otpVerification = otpRecord.get();

            // Check expiry
            if (LocalDateTime.now().isAfter(otpVerification.getExpiryTime())) {
                otpRepository.deleteByEmail(normalizedEmail);
                return false;
            }

            return otpVerification.getOtp().equals(otp);

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    @Transactional
    public void clearOtp(String email) {
        otpRepository.deleteByEmail(email.toLowerCase());
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
