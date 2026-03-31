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
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
public class PaymentServiceImpl implements PaymentService {
	private static final String RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";
	private static final double DEFAULT_SPOT_PRICE_PER_HOUR = 75.0;
	private static final double OVERSTAY_MULTIPLIER = 1.5;
	private static final int MIN_EXTENSION_HOURS = 1;
	private static final int MAX_EXTENSION_HOURS = 8;

	private final PaymentRepository paymentRepository;
	private final BookingRepository bookingRepository;
	private final UsersRepository usersRepository;
	private final QrCodeService qrCodeService;
	private final EmailService emailService;
	private final ObjectMapper objectMapper;
	private final HttpClient httpClient;

	@Value("${razorpay.key.id}")
	private String razorpayKeyId;

	@Value("${razorpay.key.secret}")
	private String razorpayKeySecret;

	public PaymentServiceImpl(PaymentRepository paymentRepository, BookingRepository bookingRepository,
			UsersRepository usersRepository, QrCodeService qrCodeService, EmailService emailService,
			ObjectMapper objectMapper) {
		this.paymentRepository = paymentRepository;
		this.bookingRepository = bookingRepository;
		this.usersRepository = usersRepository;
		this.qrCodeService = qrCodeService;
		this.emailService = emailService;
		this.objectMapper = objectMapper;
		this.httpClient = HttpClient.newHttpClient();
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

		if (booking.getTotalAmount() == null || booking.getTotalAmount() <= 0) {
			throw new RuntimeException("Invalid booking amount");
		}

		String razorpayOrderId = createRazorpayOrder(booking);

		Payment payment = new Payment();
		payment.setBooking(booking);
		payment.setUser(user);
		payment.setAmount(booking.getTotalAmount());
		payment.setPaymentMethod(requestDTO.getPaymentMethod() != null ? requestDTO.getPaymentMethod() : "RAZORPAY");
		payment.setRazorpayOrderId(razorpayOrderId);
		payment.setStatus("PENDING");

		Payment savedPayment = paymentRepository.save(payment);

		PaymentResponseDTO response = new PaymentResponseDTO();
		response.setPaymentId(savedPayment.getPaymentId());
		response.setBookingId(booking.getBookingId());
		response.setAmount(booking.getTotalAmount());
		response.setRazorpayOrderId(razorpayOrderId);
		response.setRazorpayKeyId(razorpayKeyId);
		response.setStatus("PENDING");
		response.setMessage("Payment order created successfully.");

		return response;
	}

	@Override
	@Transactional
	public PaymentResponseDTO createOverstayPaymentOrder(Integer userId, PaymentRequestDTO requestDTO) {
		Users user = usersRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

		Booking booking = bookingRepository.findById(requestDTO.getBookingId())
				.orElseThrow(() -> new RuntimeException("Booking not found with ID: " + requestDTO.getBookingId()));

		if (booking.getUser() == null || !booking.getUser().getUserId().equals(userId)) {
			throw new RuntimeException("This overstay payment does not belong to the logged in user");
		}

		String bookingStatus = booking.getStatus() == null ? "" : booking.getStatus().toUpperCase();
		if (!"OVERSTAY".equals(bookingStatus)) {
			if ("CHECKED_IN".equals(bookingStatus) && booking.getEndTime() != null
					&& LocalDateTime.now().isAfter(booking.getEndTime())) {
				long diffMinutes = ChronoUnit.MINUTES.between(booking.getEndTime(), LocalDateTime.now());
				int overstayHours = (int) Math.ceil(diffMinutes / 60.0);
				if (overstayHours < 1) {
					overstayHours = 1;
				}

				double spotPricePerHour = booking.getParkingSpot() != null
						&& booking.getParkingSpot().getPricePerHour() != null
						&& booking.getParkingSpot().getPricePerHour() > 0
								? booking.getParkingSpot().getPricePerHour()
								: DEFAULT_SPOT_PRICE_PER_HOUR;
				double overstayFee = overstayHours * spotPricePerHour * OVERSTAY_MULTIPLIER;

				booking.setStatus("OVERSTAY");
				booking.setOverstayFee(overstayFee);
				bookingRepository.save(booking);
			} else {
				throw new RuntimeException("Overstay payment can be created only for OVERSTAY tickets");
			}
		}

		double overstayFee = booking.getOverstayFee() == null ? 0 : booking.getOverstayFee();
		if (overstayFee <= 0) {
			throw new RuntimeException("Overstay amount is not available for this booking");
		}

		String razorpayOrderId = createRazorpayOrder(overstayFee, booking.getBookingId(), "overstay_", "overstay");

		Payment payment = new Payment();
		payment.setBooking(booking);
		payment.setUser(user);
		payment.setAmount(overstayFee);
		payment.setPaymentMethod("RAZORPAY_OVERSTAY");
		payment.setRazorpayOrderId(razorpayOrderId);
		payment.setStatus("PENDING");
		Payment savedPayment = paymentRepository.save(payment);

		PaymentResponseDTO response = new PaymentResponseDTO();
		response.setPaymentId(savedPayment.getPaymentId());
		response.setBookingId(booking.getBookingId());
		response.setAmount(overstayFee);
		response.setRazorpayOrderId(razorpayOrderId);
		response.setRazorpayKeyId(razorpayKeyId);
		response.setStatus("PENDING");
		response.setMessage("Overstay payment order created successfully.");
		return response;
	}

	@Override
	@Transactional
	public PaymentResponseDTO createExtensionPaymentOrder(Integer userId, PaymentRequestDTO requestDTO) {
		Users user = usersRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

		Booking booking = bookingRepository.findById(requestDTO.getBookingId())
				.orElseThrow(() -> new RuntimeException("Booking not found with ID: " + requestDTO.getBookingId()));

		if (booking.getUser() == null || !booking.getUser().getUserId().equals(userId)) {
			throw new RuntimeException("This extension payment does not belong to the logged in user");
		}

		String bookingStatus = booking.getStatus() == null ? "" : booking.getStatus().toUpperCase();
		if (!("PAID".equals(bookingStatus) || "CHECKED_IN".equals(bookingStatus))) {
			throw new RuntimeException("Extension is allowed only for active paid tickets");
		}

		LocalDateTime now = LocalDateTime.now();
		if (booking.getEndTime() == null || !now.isBefore(booking.getEndTime())) {
			throw new RuntimeException("Ticket already expired. Please use overstay payment flow.");
		}

		Integer extensionHours = requestDTO.getExtensionHours();
		if (extensionHours == null || extensionHours < MIN_EXTENSION_HOURS || extensionHours > MAX_EXTENSION_HOURS) {
			throw new RuntimeException(
					"Extension hours must be between " + MIN_EXTENSION_HOURS + " and " + MAX_EXTENSION_HOURS);
		}

		double spotPricePerHour = booking.getParkingSpot() != null
				&& booking.getParkingSpot().getPricePerHour() != null
				&& booking.getParkingSpot().getPricePerHour() > 0
						? booking.getParkingSpot().getPricePerHour()
						: DEFAULT_SPOT_PRICE_PER_HOUR;
		double extensionFee = spotPricePerHour * extensionHours;

		String razorpayOrderId = createRazorpayOrder(extensionFee, booking.getBookingId(), "extend_", "extension");

		Payment payment = new Payment();
		payment.setBooking(booking);
		payment.setUser(user);
		payment.setAmount(extensionFee);
		payment.setPaymentMethod("RAZORPAY_EXTENSION");
		payment.setExtensionHours(extensionHours);
		payment.setRazorpayOrderId(razorpayOrderId);
		payment.setStatus("PENDING");
		Payment savedPayment = paymentRepository.save(payment);

		PaymentResponseDTO response = new PaymentResponseDTO();
		response.setPaymentId(savedPayment.getPaymentId());
		response.setBookingId(booking.getBookingId());
		response.setAmount(extensionFee);
		response.setRazorpayOrderId(razorpayOrderId);
		response.setRazorpayKeyId(razorpayKeyId);
		response.setStatus("PENDING");
		response.setMessage("Extension payment order created successfully.");
		return response;
	}

	@Override
	@Transactional
	public PaymentResponseDTO verifyPayment(PaymentVerifyDTO verifyDTO) {
		Payment payment = paymentRepository.findByRazorpayOrderId(verifyDTO.getRazorpayOrderId()).orElseThrow(
				() -> new RuntimeException("Payment not found for order: " + verifyDTO.getRazorpayOrderId()));

		if ("SUCCESS".equalsIgnoreCase(payment.getStatus())) {
			return toResponseDTO(payment);
		}

		if (!isValidRazorpaySignature(verifyDTO.getRazorpayOrderId(), verifyDTO.getRazorpayPaymentId(),
				verifyDTO.getRazorpaySignature())) {
			throw new RuntimeException("Invalid payment signature");
		}

		payment.setRazorpayPaymentId(verifyDTO.getRazorpayPaymentId());
		payment.setRazorpaySignature(verifyDTO.getRazorpaySignature());
		payment.setTransactionId(verifyDTO.getRazorpayPaymentId());
		payment.setStatus("SUCCESS");
		payment.setRefundStatus("NOT_REQUESTED");
		payment.setRefundRequestedAt(null);
		paymentRepository.save(payment);

		// Update booking status based on payment flow type.
		Booking booking = payment.getBooking();
		if ("RAZORPAY_OVERSTAY".equalsIgnoreCase(payment.getPaymentMethod())) {
			booking.setStatus("OVERSTAY_PAID");
		} else if ("RAZORPAY_EXTENSION".equalsIgnoreCase(payment.getPaymentMethod())) {
			if (booking.getEndTime() == null || !LocalDateTime.now().isBefore(booking.getEndTime())) {
				throw new RuntimeException("Ticket already expired. Extension payment cannot be applied.");
			}
			int extensionHours = payment.getExtensionHours() == null ? 0 : payment.getExtensionHours();
			if (extensionHours <= 0) {
				throw new RuntimeException("Invalid extension hours on payment record");
			}
			booking.setEndTime(booking.getEndTime().plusHours(extensionHours));
			double existingTotal = booking.getTotalAmount() == null ? 0 : booking.getTotalAmount();
			double extensionAmount = payment.getAmount() == null ? 0 : payment.getAmount();
			booking.setTotalAmount(existingTotal + extensionAmount);
		} else {
			booking.setStatus("PAID");
		}
		bookingRepository.save(booking);

		// Generate QR ticket and send confirmation email after primary booking payment.
		if ("RAZORPAY_EXTENSION".equalsIgnoreCase(payment.getPaymentMethod())) {
			sendExtensionTicketEmail(booking, payment.getAmount(), payment.getExtensionHours());
		} else if (!"RAZORPAY_OVERSTAY".equalsIgnoreCase(payment.getPaymentMethod())) {
			sendQrTicketEmail(booking);
		}

		PaymentResponseDTO response = new PaymentResponseDTO();
		response.setPaymentId(payment.getPaymentId());
		response.setBookingId(booking.getBookingId());
		response.setAmount(payment.getAmount());
		response.setRazorpayOrderId(payment.getRazorpayOrderId());
		response.setRazorpayPaymentId(payment.getRazorpayPaymentId());
		response.setStatus("SUCCESS");
		response.setMessage("RAZORPAY_OVERSTAY".equalsIgnoreCase(payment.getPaymentMethod())
				? "Overstay payment verified successfully. Exit QR is now enabled."
				: "RAZORPAY_EXTENSION".equalsIgnoreCase(payment.getPaymentMethod())
						? "Ticket extended successfully. Expiration time has been updated."
						: "Payment verified successfully.");

		return response;
	}

	private String createRazorpayOrder(double amount, Long bookingId, String receiptPrefix, String context) {
		try {
			long amountInPaise = Math.round(amount * 100);
			if (amountInPaise <= 0) {
				throw new RuntimeException("Amount must be greater than zero");
			}

			String payload = objectMapper.writeValueAsString(java.util.Map.of(
					"amount", amountInPaise,
					"currency", "INR",
					"receipt", receiptPrefix + bookingId + "_" + System.currentTimeMillis(),
					"notes", java.util.Map.of("bookingId", String.valueOf(bookingId), "context", context)));

			String auth = Base64.getEncoder().encodeToString(
					(razorpayKeyId + ":" + razorpayKeySecret).getBytes(StandardCharsets.UTF_8));

			HttpRequest request = HttpRequest.newBuilder()
					.uri(URI.create(RAZORPAY_ORDERS_URL))
					.header("Content-Type", "application/json")
					.header("Authorization", "Basic " + auth)
					.POST(HttpRequest.BodyPublishers.ofString(payload))
					.build();

			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new RuntimeException("Failed to create Razorpay order: " + response.body());
			}

			JsonNode node = objectMapper.readTree(response.body());
			String orderId = node.path("id").asText();
			if (orderId == null || orderId.isBlank()) {
				throw new RuntimeException("Razorpay order ID missing in response");
			}
			return orderId;
		} catch (RuntimeException e) {
			throw e;
		} catch (Exception e) {
			throw new RuntimeException("Unable to create Razorpay order", e);
		}
	}

	private String createRazorpayOrder(Booking booking) {
		return createRazorpayOrder(booking.getTotalAmount(), booking.getBookingId(), "booking_", "booking");
	}

	private boolean isValidRazorpaySignature(String orderId, String paymentId, String signature) {
		try {
			String payload = orderId + "|" + paymentId;
			Mac sha256Hmac = Mac.getInstance("HmacSHA256");
			SecretKeySpec secretKey = new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8),
					"HmacSHA256");
			sha256Hmac.init(secretKey);
			byte[] hash = sha256Hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
			StringBuilder computedSignature = new StringBuilder(hash.length * 2);
			for (byte b : hash) {
				computedSignature.append(String.format("%02x", b));
			}
			return computedSignature.toString().equals(signature);
		} catch (Exception e) {
			throw new RuntimeException("Unable to verify payment signature", e);
		}
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

	private void sendExtensionTicketEmail(Booking booking, Double extensionAmount, Integer extensionHours) {
		try {
			Users user = booking.getUser();
			ParkingSpot spot = booking.getParkingSpot();
			String body = """
					<html>
					<body style=\"font-family: Arial, sans-serif; background: #f4f6f8; padding: 20px;\">
					<div style=\"max-width: 620px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);\">
					  <div style=\"background: linear-gradient(135deg, #0f766e, #0ea5a4); padding: 24px; text-align: center; color: #fff;\">
					    <h1 style=\"margin: 0;\">🅿️ ParkEase</h1>
					    <p style=\"margin: 8px 0 0 0;\">Ticket Extended Successfully</p>
					  </div>
					  <div style=\"padding: 24px;\">
					    <h2 style=\"margin-top: 0;\">Hello, %s!</h2>
					    <p>Your existing ticket has been extended. The same ticket number remains valid.</p>
					    <table style=\"width: 100%%; border-collapse: collapse; margin: 18px 0;\">
					      <tr><td style=\"padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;\">Ticket No</td><td style=\"padding: 10px; border-bottom: 1px solid #eee;\">%s</td></tr>
					      <tr><td style=\"padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;\">Spot</td><td style=\"padding: 10px; border-bottom: 1px solid #eee;\">%s (%s)</td></tr>
					      <tr><td style=\"padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;\">Added Time</td><td style=\"padding: 10px; border-bottom: 1px solid #eee;\">%d hour(s)</td></tr>
					      <tr><td style=\"padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;\">Extension Paid</td><td style=\"padding: 10px; border-bottom: 1px solid #eee; color: #16a34a; font-weight: bold;\">₹%.2f</td></tr>
					      <tr><td style=\"padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;\">New End Time</td><td style=\"padding: 10px; border-bottom: 1px solid #eee;\">%s</td></tr>
					    </table>
					    <p style=\"font-size: 12px; color: #666;\">Use the same QR ticket in the app for entry/exit scans.</p>
					  </div>
					</div>
					</body>
					</html>
					"""
					.formatted(
							user.getFullName(),
							booking.getTicketNumber(),
							spot.getSpotLabel(),
							spot.getZone(),
							extensionHours == null ? 0 : extensionHours,
							extensionAmount == null ? 0 : extensionAmount,
							booking.getEndTime() != null
									? booking.getEndTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
									: "N/A");
			emailService.sendTicketWithQrCode(user.getEmail(), body, null);
		} catch (Exception e) {
			System.err.println("[PaymentService] Extension ticket email failed: " + e.getMessage());
		}
	}
}
