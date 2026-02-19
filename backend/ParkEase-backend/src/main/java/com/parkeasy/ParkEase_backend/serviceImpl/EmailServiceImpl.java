package com.parkeasy.ParkEase_backend.serviceImpl;

import java.io.File;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.parkeasy.ParkEase_backend.service.EmailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServiceImpl implements EmailService {

	@Autowired
	private JavaMailSender mailSender;

	private final String SENDER_EMAIL = "aasra.grocery@gmail.com";

	@Override
	public void sendOtpEmail(String toEmail, String otp) throws MessagingException {
		MimeMessage message = mailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

		helper.setFrom(SENDER_EMAIL);
		helper.setTo(toEmail);
		helper.setSubject("Your One-Time Password (OTP) - ParkEase");

		String htmlBody = """
				<!DOCTYPE html>
				<html>
				<body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7f6; padding: 20px; margin: 0;">
				    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: center;">
				        <h2 style="color: #333333; margin-top: 0;">Login Verification</h2>
				        <p style="color: #555555; font-size: 16px; line-height: 1.5;">
				            Hello,<br>Please use the following One-Time Password (OTP) to complete your login.
				            This code is valid for the next <strong>10 minutes</strong>.
				        </p>

				        <div style="margin: 35px 0;">
				            <span style="font-size: 36px; font-weight: bold; color: #4CAF50; letter-spacing: 8px; padding: 15px 30px; background-color: #e8f5e9; border-radius: 6px; border: 1px dashed #4CAF50;">
				                %s
				            </span>
				        </div>

				        <p style="color: #999999; font-size: 14px; margin-bottom: 0;">
				            If you did not request this code, please ignore this email or contact support.
				        </p>
				    </div>
				</body>
				</html>
				"""
				.formatted(otp);

		helper.setText(htmlBody, true);
		mailSender.send(message);
		System.out.println("OTP email sent successfully to " + toEmail);
	}

	@Override
	public void sendTicketWithQrCode(String toEmail, String ticketDetails, File qrCodeFile) throws MessagingException {
		MimeMessage message = mailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

		helper.setFrom(SENDER_EMAIL);
		helper.setTo(toEmail);
		helper.setSubject("🎟️ Your Parking Ticket & QR Code - ParkEase");

		String htmlBody = """
				<!DOCTYPE html>
				<html>
				<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #eaeff3; padding: 40px 20px; margin: 0;">

				    <table width="100%%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.08);">

				        <tr>
				            <td style="background-color: #2c3e50; color: #ffffff; padding: 30px; text-align: center;">
				                <h1 style="margin: 0; font-size: 26px; letter-spacing: 2px; text-transform: uppercase;">Parking Ticket</h1>
				                <p style="margin: 8px 0 0 0; font-size: 15px; color: #bdc3c7;">ParkEase</p>
				            </td>
				        </tr>

				        <tr>
				            <td style="padding: 40px 30px; background-color: #ffffff;">
				                <h3 style="margin-top: 0; color: #2c3e50; font-size: 18px; border-bottom: 2px solid #f0f3f4; padding-bottom: 10px;">Ticket Information</h3>

				                <div style="color: #555555; font-size: 16px; line-height: 1.8;">
				                    %s
				                </div>
				            </td>
				        </tr>

				        <tr>
				            <td style="background-color: #ffffff;">
				                <div style="border-top: 3px dashed #eaeff3; margin: 0 15px;"></div>
				            </td>
				        </tr>

				        <tr>
				            <td style="padding: 30px; text-align: center; background-color: #fbfcfc;">
				                <p style="margin: 0 0 20px 0; color: #7f8c8d; font-weight: 600; font-size: 14px; letter-spacing: 1px;">READY TO SCAN</p>

				                <img src="cid:qrCodeImage" alt="Ticket QR Code" style="width: 220px; height: 220px; display: inline-block; border: 8px solid #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />

				                <p style="color: #95a5a6; font-size: 13px; margin-top: 25px; margin-bottom: 0;">
				                    Please turn up your screen brightness when presenting this code at the gate.
				                </p>
				            </td>
				        </tr>

				    </table>

				</body>
				</html>
				"""
				.formatted(ticketDetails);

		helper.setText(htmlBody, true);

		FileSystemResource res = new FileSystemResource(qrCodeFile);
		helper.addInline("qrCodeImage", res);

		mailSender.send(message);
		System.out.println("Premium ticket email sent successfully to " + toEmail);
	}
}