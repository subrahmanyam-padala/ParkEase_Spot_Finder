package com.parkeasy.ParkEase_backend.serviceImpl;

import com.parkeasy.ParkEase_backend.dto.PaymentRequestDTO;
import com.parkeasy.ParkEase_backend.dto.PaymentResponseDTO;
import com.parkeasy.ParkEase_backend.dto.PaymentVerifyDTO;
import com.parkeasy.ParkEase_backend.entity.Booking;
import com.parkeasy.ParkEase_backend.entity.ParkingSpot;
import com.parkeasy.ParkEase_backend.entity.Payment;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.repository.BookingRepository;
import com.parkeasy.ParkEase_backend.repository.PaymentRepository;
import com.parkeasy.ParkEase_backend.repository.UsersRepository;
import com.parkeasy.ParkEase_backend.service.EmailService;
import com.parkeasy.ParkEase_backend.service.PaymentService;
import com.parkeasy.ParkEase_backend.service.QrCodeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

	private final PaymentRepository paymentRepository;
	private final BookingRepository bookingRepository;
	private final UsersRepository usersRepository;
	private final QrCodeService qrCodeService;
	private final EmailService emailService;

	public PaymentServiceImpl(PaymentRepository paymentRepository, BookingRepository bookingRepository,
			UsersRepository usersRepository, QrCodeService qrCodeService, EmailService emailService) {
		this.paymentRepository = paymentRepository;
		this.bookingRepository = bookingRepository;
		this.usersRepository = usersRepository;
		this.qrCodeService = qrCodeService;
		this.emailService = emailService;
	}

	@Override
	@Transactional
	public PaymentResponseDTO createPaymentOrder(Integer userId, PaymentRequestDTO requestDTO) {
		Users user = usersRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

		Booking booking = bookingRepository.findById(requestDTO.getBookingId())
				.orElseThrow(() -> new RuntimeException("Booking not found with ID: " + requestDTO.getBookingId()));

		if (!"ACTIVE".equals(booking.getStatus())) {
			throw new RuntimeException("Booking is not active. Cannot create payment.");
		}

		// Generate mock order & transaction IDs
		String mockOrderId = "mock_order_" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
		String mockTransactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

		// Save payment record
		Payment payment = new Payment();
		payment.setBooking(booking);
		payment.setUser(user);
		payment.setAmount(booking.getTotalAmount());
		payment.setPaymentMethod(requestDTO.getPaymentMethod() != null ? requestDTO.getPaymentMethod() : "MOCK_PAY");
		payment.setRazorpayOrderId(mockOrderId);
		payment.setTransactionId(mockTransactionId);
		payment.setStatus("PENDING");

		Payment savedPayment = paymentRepository.save(payment);

		PaymentResponseDTO response = new PaymentResponseDTO();
		response.setPaymentId(savedPayment.getPaymentId());
		response.setBookingId(booking.getBookingId());
		response.setAmount(booking.getTotalAmount());
		response.setRazorpayOrderId(mockOrderId);
		response.setRazorpayKeyId("mock_key_for_demo");
		response.setStatus("PENDING");
		response.setMessage("Mock payment order created. Call /verify to auto-approve.");

		return response;
	}

	@Override
	@Transactional
	public PaymentResponseDTO verifyPayment(PaymentVerifyDTO verifyDTO) {
		Payment payment = paymentRepository.findByRazorpayOrderId(verifyDTO.getRazorpayOrderId()).orElseThrow(
				() -> new RuntimeException("Payment not found for order: " + verifyDTO.getRazorpayOrderId()));

		// Mock verification: auto-approve all payments
		String mockPaymentId = "mock_pay_" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
		payment.setRazorpayPaymentId(mockPaymentId);
		payment.setRazorpaySignature("mock_signature_valid");
		payment.setStatus("SUCCESS");
		paymentRepository.save(payment);

		// Update booking status to PAID
		Booking booking = payment.getBooking();
		booking.setStatus("PAID");
		bookingRepository.save(booking);

		// Generate QR ticket and send confirmation email after successful payment
		sendQrTicketEmail(booking);

		PaymentResponseDTO response = new PaymentResponseDTO();
		response.setPaymentId(payment.getPaymentId());
		response.setBookingId(booking.getBookingId());
		response.setAmount(payment.getAmount());
		response.setRazorpayOrderId(payment.getRazorpayOrderId());
		response.setRazorpayPaymentId(mockPaymentId);
		response.setStatus("SUCCESS");
		response.setMessage("Payment verified successfully (Mock - auto-approved)!");

		return response;
	}

	@Override
	public List<PaymentResponseDTO> getPaymentsByUserId(Integer userId) {
		return paymentRepository.findByUserUserId(userId).stream().map(this::toResponseDTO).toList();
	}

	@Override
	public List<PaymentResponseDTO> getPaymentsByBookingId(Long bookingId) {
		return paymentRepository.findByBookingBookingId(bookingId).stream().map(this::toResponseDTO).toList();
	}

	@Override
	public PaymentResponseDTO getPaymentById(Long paymentId) {
		Payment payment = paymentRepository.findById(paymentId)
				.orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));
		return toResponseDTO(payment);
	}

	private PaymentResponseDTO toResponseDTO(Payment payment) {
		PaymentResponseDTO dto = new PaymentResponseDTO();
		dto.setPaymentId(payment.getPaymentId());
		dto.setBookingId(payment.getBooking().getBookingId());
		dto.setAmount(payment.getAmount());
		dto.setRazorpayOrderId(payment.getRazorpayOrderId());
		dto.setRazorpayPaymentId(payment.getRazorpayPaymentId());
		dto.setStatus(payment.getStatus());
		dto.setMessage(payment.getStatus().equals("SUCCESS") ? "Payment completed"
				: "Payment " + payment.getStatus().toLowerCase());
		return dto;
	}

	/**
	 * Generate QR code and send booking confirmation email after successful
	 * payment.
	 */
	private void sendQrTicketEmail(Booking booking) {
		File qrFile = null;
		try {
			Users user = booking.getUser();
			ParkingSpot spot = booking.getParkingSpot();

			qrFile = qrCodeService.generateQrCodeFile(user.getEmail(), booking.getTicketNumber(), user.getFullName(),
					booking.getVehicleNumber(), spot.getSpotLabel(), spot.getZone(),
					booking.getStartTime() != null
							? booking.getStartTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
							: "N/A",
					booking.getEndTime() != null
							? booking.getEndTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
							: "N/A",
					booking.getTotalAmount());

			String ticketDetails = buildTicketEmailBody(booking, spot, user);
			emailService.sendTicketWithQrCode(user.getEmail(), ticketDetails, qrFile);
			System.out.println("[PaymentService] QR ticket email sent to " + user.getEmail());
		} catch (Exception e) {
			System.err.println("[PaymentService] QR ticket email failed: " + e.getMessage());
		} finally {
			if (qrFile != null && qrFile.exists()) {
				qrFile.delete();
			}
		}
	}

	private String buildTicketEmailBody(Booking booking, ParkingSpot spot, Users user) {
		return """
				<html>
				<body style="font-family: Arial, sans-serif; background: #f4f6f8; padding: 20px;">
				<div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
				  <div style="background: linear-gradient(135deg, #1e3c72, #2a5298); padding: 25px; text-align: center; color: #fff;">
				    <h1 style="margin: 0;">🅿️ ParkEase</h1>
				    <p>Payment Confirmed — Your QR Ticket</p>
				  </div>
				  <div style="padding: 25px;">
				    <h2>Hello, %s!</h2>
				    <p>Your payment is confirmed. Here is your parking ticket.</p>
				    <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
				      <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Ticket No</td><td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td></tr>
				      <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Spot</td><td style="padding: 10px; border-bottom: 1px solid #eee;">%s (%s)</td></tr>
				      <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Vehicle</td><td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td></tr>
				      <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Start Time</td><td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td></tr>
				      <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">End Time</td><td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td></tr>
				      <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Amount Paid</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #27ae60; font-weight: bold;">₹%.2f</td></tr>
				      <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Navigation</td><td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td></tr>
				    </table>
				    %s
				    <p style="color: #888; font-size: 12px; margin-top: 20px;">This is an automated message from ParkEase. Do not reply.</p>
				  </div>
				</div>
				</body>
				</html>
				"""
				.formatted(user.getFullName(), booking.getTicketNumber(), spot.getSpotLabel(), spot.getZone(),
						booking.getVehicleNumber(),
						booking.getStartTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")),
						booking.getEndTime() != null
								? booking.getEndTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
								: "N/A",
						booking.getTotalAmount(),
						spot.getNavigationPath() != null ? spot.getNavigationPath()
								: "Follow signs to " + spot.getSpotLabel(),
						"<div style='text-align: center; margin: 20px 0;'>"
								+ "<p style='font-weight: bold; color: #1e3c72;'>Your QR Ticket</p>"
								+ "<img src='cid:qrcode_image' alt='QR Code' style='width: 200px; height: 200px; border: 2px solid #2a5298; border-radius: 8px;' />"
								+ "<p style='color: #888; font-size: 12px;'>Show this QR code at the parking entrance</p>"
								+ "</div>");
	}
}
