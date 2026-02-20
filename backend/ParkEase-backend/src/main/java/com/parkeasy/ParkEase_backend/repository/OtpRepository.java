package com.parkeasy.ParkEase_backend.repository;

import com.parkeasy.ParkEase_backend.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {

	/**
	 * Find OTP record by email
	 */
	Optional<OtpVerification> findByEmail(String email);

	/**
	 * Delete OTP record by email
	 */
	@Transactional
	void deleteByEmail(String email);

	/**
	 * Delete all expired OTPs (cleanup method)
	 */
	@Modifying
	@Transactional
	@Query("DELETE FROM OtpVerification o WHERE o.expiryTime < :now")
	void deleteExpiredOtps(@Param("now") LocalDateTime now);

	/**
	 * Check if a valid (non-expired) OTP exists for email
	 */
	@Query("SELECT COUNT(o) > 0 FROM OtpVerification o WHERE o.email = :email AND o.expiryTime > :now AND o.isVerified = false")
	boolean existsValidOtpByEmail(@Param("email") String email, @Param("now") LocalDateTime now);
}
