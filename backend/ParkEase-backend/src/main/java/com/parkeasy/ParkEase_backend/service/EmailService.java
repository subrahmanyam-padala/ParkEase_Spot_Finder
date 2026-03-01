package com.parkeasy.ParkEase_backend.service;

import java.io.File;

import jakarta.mail.MessagingException;

/**
 * @author Atharv Ital
 */
public interface EmailService {

	/**
	 * This method for only sending the OTP
	 * 
	 * @param toEmail
	 * @param otp
	 * @throws MessagingException
	 */
	void sendOtpEmail(String toEmail, String otp) throws MessagingException;

	/**
	 * This method for only sending the QR after completion of booking
	 * 
	 * @param toEmail
	 * @param ticketDetails
	 * @param qrCodeFile
	 * @throws MessagingException
	 */
	void sendTicketWithQrCode(String toEmail, String ticketDetails, File qrCodeFile) throws MessagingException;
}
