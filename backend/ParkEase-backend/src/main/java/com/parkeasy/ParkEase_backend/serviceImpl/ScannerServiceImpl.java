package com.parkeasy.ParkEase_backend.serviceImpl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkeasy.ParkEase_backend.dto.ScanResponseDTO;
import com.parkeasy.ParkEase_backend.entity.Booking;
import com.parkeasy.ParkEase_backend.entity.Payment;
import com.parkeasy.ParkEase_backend.entity.PricingConfig;
import com.parkeasy.ParkEase_backend.repository.BookingRepository;
import com.parkeasy.ParkEase_backend.repository.ParkingSpotRepository;
import com.parkeasy.ParkEase_backend.repository.PaymentRepository;
import com.parkeasy.ParkEase_backend.repository.PricingConfigRepository;
import com.parkeasy.ParkEase_backend.service.ScannerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ScannerServiceImpl implements ScannerService {

	private final BookingRepository bookingRepository;
	private final ParkingSpotRepository parkingSpotRepository;
	private final PaymentRepository paymentRepository;
	private final PricingConfigRepository pricingConfigRepository;
	private final ObjectMapper objectMapper;

	public ScannerServiceImpl(BookingRepository bookingRepository, ParkingSpotRepository parkingSpotRepository,
			PaymentRepository paymentRepository, PricingConfigRepository pricingConfigRepository,
			ObjectMapper objectMapper) {
		this.bookingRepository = bookingRepository;
		this.parkingSpotRepository = parkingSpotRepository;
		this.paymentRepository = paymentRepository;
		this.pricingConfigRepository = pricingConfigRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	@Transactional
	public ScanResponseDTO processScan(String qrData) {
		if (qrData == null || qrData.isBlank()) {
			return ScanResponseDTO.error("qrData is required");
		}

		// Parse QR JSON
		String ticketNumber;
		try {
			JsonNode parsed = objectMapper.readTree(qrData);
			ticketNumber = parsed.has("ticket_no") ? parsed.get("ticket_no").asText() : null;
		} catch (Exception e) {
			return ScanResponseDTO.error("Invalid QR data — could not parse JSON");
		}

		if (ticketNumber == null || ticketNumber.isBlank()) {
			return ScanResponseDTO.error("QR data missing ticket_no");
		}

		Optional<Booking> optBooking = bookingRepository.findByTicketNumber(ticketNumber);
		if (optBooking.isEmpty()) {
			return ScanResponseDTO.error("Ticket not found");
		}

		Booking booking = optBooking.get();
		String spotLabel = booking.getParkingSpot().getSpotLabel();
		String zone = booking.getParkingSpot().getZone();
		String userName = booking.getUser() != null ? booking.getUser().getFullName() : "N/A";
		String userEmail = booking.getUser() != null ? booking.getUser().getEmail() : "";

		// ─── ENTRY SCAN (PAID → CHECKED_IN)
		if ("PAID".equals(booking.getStatus())) {
			booking.setStatus("CHECKED_IN");
			booking.setCheckedInTime(LocalDateTime.now());
			bookingRepository.save(booking);

			Map<String, Object> data = new LinkedHashMap<>();
			data.put("ticketNumber", booking.getTicketNumber());
			data.put("vehicleNumber", booking.getVehicleNumber());
			data.put("userName", userName);
			data.put("userEmail", userEmail);
			data.put("spot", spotLabel + " - " + zone);
			data.put("startTime", booking.getStartTime());
			data.put("endTime", booking.getEndTime());
			data.put("checkedInAt", LocalDateTime.now());
			data.put("status", "CHECKED_IN");

			return ScanResponseDTO.success("ENTRY",
					"Vehicle " + booking.getVehicleNumber() + " checked in successfully", data);
		}

		// ─── EXIT SCAN (CHECKED_IN → COMPLETED or OVERSTAY)
		if ("CHECKED_IN".equals(booking.getStatus())) {
			LocalDateTime now = LocalDateTime.now();
			LocalDateTime endTime = booking.getEndTime();

			if (endTime != null && !now.isAfter(endTime)) {
				// Within time — complete and free spot
				booking.setStatus("COMPLETED");
				bookingRepository.save(booking);

				booking.getParkingSpot().setIsOccupied(false);
				parkingSpotRepository.save(booking.getParkingSpot());

				Map<String, Object> data = new LinkedHashMap<>();
				data.put("ticketNumber", booking.getTicketNumber());
				data.put("vehicleNumber", booking.getVehicleNumber());
				data.put("userName", userName);
				data.put("userEmail", userEmail);
				data.put("spot", spotLabel + " - " + zone);
				data.put("startTime", booking.getStartTime());
				data.put("endTime", booking.getEndTime());
				data.put("exitTime", now);
				data.put("overstay", false);
				data.put("overstayHours", 0);
				data.put("overstayFee", 0);
				data.put("status", "COMPLETED");

				return ScanResponseDTO.success("EXIT",
						"Vehicle " + booking.getVehicleNumber() + " checked out. No overstay — thank you!", data);
			}

			// Overstay detected
			long diffMinutes = endTime != null ? ChronoUnit.MINUTES.between(endTime, now) : 0;
			int overstayHours = (int) Math.ceil(diffMinutes / 60.0);
			if (overstayHours < 1)
				overstayHours = 1;

			double basePricePerHour = getBasePricePerHour();
			double overstayFee = overstayHours * basePricePerHour * 2; // 2x rate

			booking.setStatus("OVERSTAY");
			booking.setOverstayFee(overstayFee);
			bookingRepository.save(booking);

			Map<String, Object> data = new LinkedHashMap<>();
			data.put("ticketNumber", booking.getTicketNumber());
			data.put("vehicleNumber", booking.getVehicleNumber());
			data.put("userName", userName);
			data.put("userEmail", userEmail);
			data.put("spot", spotLabel + " - " + zone);
			data.put("startTime", booking.getStartTime());
			data.put("endTime", booking.getEndTime());
			data.put("exitTime", now);
			data.put("overstay", true);
			data.put("overstayHours", overstayHours);
			data.put("basePricePerHour", basePricePerHour);
			data.put("overstayFee", overstayFee);
			data.put("totalOriginal", booking.getTotalAmount());
			data.put("totalDue", overstayFee);
			data.put("status", "OVERSTAY");

			return ScanResponseDTO.success("EXIT_OVERSTAY",
					String.format("Vehicle %s has overstayed by %d hour(s). Overstay charge: ₹%.2f (2× rate)",
							booking.getVehicleNumber(), overstayHours, overstayFee),
					data);
		}

		// ─── OVERSTAY — waiting for payment
		if ("OVERSTAY".equals(booking.getStatus())) {
			Map<String, Object> data = new LinkedHashMap<>();
			data.put("ticketNumber", booking.getTicketNumber());
			data.put("vehicleNumber", booking.getVehicleNumber());
			data.put("userName", userName);
			data.put("userEmail", userEmail);
			data.put("overstayFee", booking.getOverstayFee() != null ? booking.getOverstayFee() : 0);
			data.put("status", "OVERSTAY");

			return ScanResponseDTO.failure("OVERSTAY_PENDING",
					String.format("Vehicle %s has unpaid overstay charges of ₹%.2f. Payment required before exit.",
							booking.getVehicleNumber(),
							booking.getOverstayFee() != null ? booking.getOverstayFee() : 0),
					data);
		}

		// ─── OVERSTAY PAID — ready to exit
		if ("OVERSTAY_PAID".equals(booking.getStatus())) {
			booking.setStatus("COMPLETED");
			bookingRepository.save(booking);

			booking.getParkingSpot().setIsOccupied(false);
			parkingSpotRepository.save(booking.getParkingSpot());

			Map<String, Object> data = new LinkedHashMap<>();
			data.put("ticketNumber", booking.getTicketNumber());
			data.put("vehicleNumber", booking.getVehicleNumber());
			data.put("userName", userName);
			data.put("userEmail", userEmail);
			data.put("spot", spotLabel + " - " + zone);
			data.put("startTime", booking.getStartTime());
			data.put("endTime", booking.getEndTime());
			data.put("exitTime", LocalDateTime.now());
			data.put("overstay", true);
			data.put("overstayFee", booking.getOverstayFee() != null ? booking.getOverstayFee() : 0);
			data.put("status", "COMPLETED");

			return ScanResponseDTO.success("EXIT",
					"Vehicle " + booking.getVehicleNumber() + " exit processed. Overstay was already paid. Thank you!",
					data);
		}

		// ─── Other statuses
		if ("COMPLETED".equals(booking.getStatus())) {
			return ScanResponseDTO.error("This ticket is already completed");
		}
		if ("CANCELLED".equals(booking.getStatus())) {
			return ScanResponseDTO.error("This ticket has been cancelled");
		}
		if ("ACTIVE".equals(booking.getStatus())) {
			return ScanResponseDTO.error("This ticket has not been paid yet. Payment is required before entry.");
		}

		return ScanResponseDTO.error("Unexpected booking status: " + booking.getStatus());
	}

	@Override
	@Transactional
	public ScanResponseDTO payOverstay(String ticketNumber) {
		if (ticketNumber == null || ticketNumber.isBlank()) {
			return ScanResponseDTO.error("ticketNumber is required");
		}

		Optional<Booking> optBooking = bookingRepository.findByTicketNumber(ticketNumber);
		if (optBooking.isEmpty()) {
			return ScanResponseDTO.error("Ticket not found");
		}

		Booking booking = optBooking.get();
		if (!"OVERSTAY".equals(booking.getStatus())) {
			return ScanResponseDTO.error("Cannot process overstay payment — current status: " + booking.getStatus());
		}

		double overstayFee = booking.getOverstayFee() != null ? booking.getOverstayFee() : 0;

		// Mark as OVERSTAY_PAID
		booking.setStatus("OVERSTAY_PAID");
		bookingRepository.save(booking);

		// Insert payment record
		Payment payment = new Payment();
		payment.setBooking(booking);
		payment.setUser(booking.getUser());
		payment.setAmount(overstayFee);
		payment.setPaymentMethod("OVERSTAY_CHARGE");
		payment.setStatus("SUCCESS");
		payment.setTransactionId("OVERSTAY-" + ticketNumber + "-" + System.currentTimeMillis());
		paymentRepository.save(payment);

		Map<String, Object> data = new LinkedHashMap<>();
		data.put("ticketNumber", booking.getTicketNumber());
		data.put("vehicleNumber", booking.getVehicleNumber());
		data.put("overstayFee", overstayFee);
		data.put("status", "OVERSTAY_PAID");

		return ScanResponseDTO.success("OVERSTAY_PAID",
				String.format("Overstay payment of ₹%.2f processed. Show exit QR to leave.", overstayFee), data);
	}

	@Override
	public ScanResponseDTO getTicketStatus(String ticketNumber) {
		Optional<Booking> optBooking = bookingRepository.findByTicketNumber(ticketNumber);
		if (optBooking.isEmpty()) {
			return ScanResponseDTO.error("Ticket not found");
		}

		Booking booking = optBooking.get();
		String spotLabel = booking.getParkingSpot().getSpotLabel();
		String zone = booking.getParkingSpot().getZone();
		String userName = booking.getUser() != null ? booking.getUser().getFullName() : "N/A";
		String userEmail = booking.getUser() != null ? booking.getUser().getEmail() : "";
		String userPhone = booking.getUser() != null ? booking.getUser().getPhoneNumber() : "";

		Map<String, Object> data = new LinkedHashMap<>();
		data.put("ticketNumber", booking.getTicketNumber());
		data.put("vehicleNumber", booking.getVehicleNumber());
		data.put("userName", userName);
		data.put("userEmail", userEmail);
		data.put("userPhone", userPhone);
		data.put("spot", spotLabel + " - " + zone);
		data.put("startTime", booking.getStartTime());
		data.put("endTime", booking.getEndTime());
		data.put("checkedInTime", booking.getCheckedInTime());
		data.put("baseFee", booking.getBaseFee());
		data.put("surgeFee", booking.getSurgeFee());
		data.put("totalAmount", booking.getTotalAmount());
		data.put("overstayFee", booking.getOverstayFee() != null ? booking.getOverstayFee() : 0);
		data.put("status", booking.getStatus());

		ScanResponseDTO dto = new ScanResponseDTO();
		dto.setSuccess(true);
		dto.setData(data);
		return dto;
	}

	private double getBasePricePerHour() {
		return pricingConfigRepository.findAll().stream().reduce((a, b) -> b).map(PricingConfig::getBasePricePerHour)
				.orElse(50.0);
	}
}
