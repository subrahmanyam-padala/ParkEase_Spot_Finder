package com.parkeasy.ParkEase_backend.serviceImpl;

import java.io.File;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.parkeasy.ParkEase_backend.service.EmailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * @author Atharv Ital
 */
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
				<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>City Mall - Login Verification</title>
				</head>

				<body style="margin:0; padding:0; background-color:#eef2f5; font-family: Arial, Helvetica, sans-serif;">

				<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:20px 0;">
				<tr>
				<td align="center">

				<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08);">

				<tr>
				<td style="background: linear-gradient(135deg, #1e3c72, #2a5298); padding:35px 30px; text-align:center; color:#ffffff;">

				    <div style="width:60px; height:60px; margin:0 auto 15px auto; background:rgba(255,255,255,0.2); border-radius:50%; line-height:60px;">
				        🏬
				    </div>

				    <h1 style="margin:0; font-size:24px; font-weight:bold; letter-spacing:1px;">
				        City Mall
				    </h1>

				    <p style="margin:8px 0 0 0; font-size:14px; opacity:0.9;">
				        Secure Account Access
				    </p>
				</td>
				</tr>

				<tr>
				<td style="padding:40px 35px; text-align:center;">

				<h2 style="margin-top:0; color:#333;">Login Verification</h2>

				<p style="color:#555; font-size:16px; line-height:1.6;">
				Hello,<br>
				Use the One-Time Password (OTP) below to securely access your City Mall account.<br>
				This code is valid for the next <strong>10 minutes</strong>.
				</p>

				<div style="height:3px; width:60px; background:#2a5298; margin:25px auto; border-radius:3px;"></div>

				<div style="margin:30px 0;">
				<span style="
				    display:inline-block;
				    font-size:40px;
				    font-weight:bold;
				    color:#1e3c72;
				    letter-spacing:12px;
				    padding:20px 40px;
				    background:#f0f4ff;
				    border-radius:10px;
				    border:2px dashed #2a5298;
				    box-shadow:0 6px 15px rgba(42,82,152,0.15);
				">
				{{otp}}
				</span>
				</div>

				<div style="margin-top:25px; font-size:14px; color:#666;">
				    🔒 Encrypted &nbsp;&nbsp; | &nbsp;&nbsp; 🛡 Protected &nbsp;&nbsp; | &nbsp;&nbsp; ⚡ Instant Access
				</div>

				<p style="color:#999; font-size:14px; margin-top:30px;">
				If you did not request this code, please ignore this email or contact City Mall support immediately.
				</p>

				</td>
				</tr>

				<tr>
				<td style="background:#f7f9fc; padding:20px; text-align:center; font-size:12px; color:#888;">
				© 2026 City Mall. All rights reserved.<br>
				This is an automated security message — please do not reply.
				</td>
				</tr>

				</table>

				</td>
				</tr>
				</table>

				</body>
				</html>
				"""
				.replace("{{otp}}", otp);

		helper.setText(htmlBody, true);
		mailSender.send(message);
		System.out.println("OTP email sent successfully to " + toEmail);
	}

	@Override
	public void sendTicketWithQrCode(String toEmail, String ticketDetails, File qrCodeFile) throws MessagingException {

	}
}