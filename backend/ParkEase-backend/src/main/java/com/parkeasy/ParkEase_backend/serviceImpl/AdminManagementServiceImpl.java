package com.parkeasy.ParkEase_backend.serviceImpl;

import com.parkeasy.ParkEase_backend.dto.AdminOverviewResponse;
import com.parkeasy.ParkEase_backend.dto.ParkingSlotRequest;
import com.parkeasy.ParkEase_backend.entity.AdminAlert;
import com.parkeasy.ParkEase_backend.entity.AdminUser;
import com.parkeasy.ParkEase_backend.entity.Booking;
import com.parkeasy.ParkEase_backend.entity.ParkingBooking;
import com.parkeasy.ParkEase_backend.entity.ParkingSpot;
import com.parkeasy.ParkEase_backend.entity.ParkingSlot;
import com.parkeasy.ParkEase_backend.entity.Payment;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.repository.AdminAlertRepository;
import com.parkeasy.ParkEase_backend.repository.AdminUserRepository;
import com.parkeasy.ParkEase_backend.repository.BookingRepository;
import com.parkeasy.ParkEase_backend.repository.ParkingBookingRepository;
import com.parkeasy.ParkEase_backend.repository.ParkingSpotRepository;
import com.parkeasy.ParkEase_backend.repository.ParkingSlotRepository;
import com.parkeasy.ParkEase_backend.repository.PaymentRepository;
import com.parkeasy.ParkEase_backend.repository.UsersRepository;
import com.parkeasy.ParkEase_backend.service.AdminManagementService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminManagementServiceImpl implements AdminManagementService {

	private final ParkingSlotRepository parkingSlotRepository;
	private final ParkingSpotRepository parkingSpotRepository;
	private final ParkingBookingRepository parkingBookingRepository;
	private final BookingRepository bookingRepository;
	private final PaymentRepository paymentRepository;
	private final UsersRepository usersRepository;
	private final AdminUserRepository adminUserRepository;
	private final AdminAlertRepository adminAlertRepository;

	public AdminManagementServiceImpl(ParkingSlotRepository parkingSlotRepository,
			ParkingSpotRepository parkingSpotRepository,
			ParkingBookingRepository parkingBookingRepository, BookingRepository bookingRepository,
			PaymentRepository paymentRepository,
			UsersRepository usersRepository,
			AdminUserRepository adminUserRepository, AdminAlertRepository adminAlertRepository) {
		this.parkingSlotRepository = parkingSlotRepository;
		this.parkingSpotRepository = parkingSpotRepository;
		this.parkingBookingRepository = parkingBookingRepository;
		this.bookingRepository = bookingRepository;
		this.paymentRepository = paymentRepository;
		this.usersRepository = usersRepository;
		this.adminUserRepository = adminUserRepository;
		this.adminAlertRepository = adminAlertRepository;
	}

	@Override
	public AdminOverviewResponse getOverview() {
		List<ParkingSlot> slots = parkingSlotRepository.findAll();
		List<ParkingBooking> bookings = parkingBookingRepository.findAll();
		List<Payment> payments = paymentRepository.findAll();
		List<Users> users = usersRepository.findAll();

		AdminOverviewResponse response = new AdminOverviewResponse();
		response.setTotalParkingSlots(slots.size());
		response.setOccupiedSlots(slots.stream().filter(slot -> "occupied".equalsIgnoreCase(slot.getStatus())).count());
		response.setAvailableSlots(slots.stream().filter(slot -> "available".equalsIgnoreCase(slot.getStatus())).count());
		response.setBookingsCount(bookings.size());
		response.setUsersCount(users.size());

		BigDecimal totalRevenue = BigDecimal.ZERO;
		BigDecimal todayRevenue = BigDecimal.ZERO;
		BigDecimal monthRevenue = BigDecimal.ZERO;
		long paidCount = 0;
		long pendingCount = 0;
		LocalDate today = LocalDate.now();

		Map<LocalDate, BigDecimal> revenueByDay = new LinkedHashMap<>();
		for (int i = 6; i >= 0; i--) {
			revenueByDay.put(today.minusDays(i), BigDecimal.ZERO);
		}

		Map<String, Long> slotUsage = new HashMap<>();

		for (ParkingBooking booking : bookings) {
			BigDecimal amount = booking.getAmount() == null ? BigDecimal.ZERO : booking.getAmount();
			boolean isPaid = Boolean.TRUE.equals(booking.getPaid());
			LocalDate createdDate = booking.getCreatedAt() == null ? null : booking.getCreatedAt().toLocalDate();
			LocalDate paidDate = booking.getUpdatedAt() != null
					? booking.getUpdatedAt().toLocalDate()
					: createdDate;
			String slotLabel = booking.getSlot();
			if (slotLabel != null && !slotLabel.isBlank()) {
				slotUsage.merge(slotLabel, Long.valueOf(1L), Long::sum);
			}

			if (isPaid) {
				paidCount++;
				totalRevenue = totalRevenue.add(amount);
				if (paidDate != null && paidDate.equals(today)) {
					todayRevenue = todayRevenue.add(amount);
				}
				if (paidDate != null && paidDate.getYear() == today.getYear()
						&& paidDate.getMonthValue() == today.getMonthValue()) {
					monthRevenue = monthRevenue.add(amount);
				}
				if (paidDate != null && revenueByDay.containsKey(paidDate)) {
					revenueByDay.put(paidDate, revenueByDay.get(paidDate).add(amount));
				}
			} else {
				pendingCount++;
			}
		}

		// Include revenue from the modern booking/payment flow.
		for (Payment payment : payments) {
			String status = payment.getStatus();
			if (status == null) {
				continue;
			}

			String normalizedStatus = status.trim().toUpperCase();
			if ("SUCCESS".equals(normalizedStatus)) {
				BigDecimal amount = payment.getAmount() == null ? BigDecimal.ZERO : BigDecimal.valueOf(payment.getAmount());
				LocalDate paymentDate = payment.getUpdatedAt() != null
						? payment.getUpdatedAt().toLocalDate()
						: (payment.getCreatedAt() != null ? payment.getCreatedAt().toLocalDate() : null);

				paidCount++;
				totalRevenue = totalRevenue.add(amount);
				if (paymentDate != null && paymentDate.equals(today)) {
					todayRevenue = todayRevenue.add(amount);
				}
				if (paymentDate != null && paymentDate.getYear() == today.getYear()
						&& paymentDate.getMonthValue() == today.getMonthValue()) {
					monthRevenue = monthRevenue.add(amount);
				}
				if (paymentDate != null && revenueByDay.containsKey(paymentDate)) {
					revenueByDay.put(paymentDate, revenueByDay.get(paymentDate).add(amount));
				}
			} else if ("PENDING".equals(normalizedStatus)) {
				pendingCount++;
			}
		}

		response.setTotalRevenue(totalRevenue);
		response.setTodayRevenue(todayRevenue);
		response.setMonthRevenue(monthRevenue);
		response.setPaidCount(paidCount);
		response.setPendingCount(pendingCount);

		response.setWeeklyRevenue(revenueByDay.entrySet().stream()
				.map(entry -> Map.<String, Object>of("label",
						entry.getKey().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), "value",
						entry.getValue()))
				.toList());

		response.setSlotColumns(slotUsage.entrySet().stream()
				.sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder())).limit(6)
				.map(entry -> Map.<String, Object>of("label", entry.getKey(), "value", entry.getValue())).toList());

		response.setBookingsRows(bookings.stream()
				.sorted(Comparator.comparing(ParkingBooking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
				.map(booking -> Map.<String, Object>of("id", booking.getId(), "user", booking.getUserName(), "slot",
						booking.getSlot(), "duration", booking.getDuration() + "h", "amount", booking.getAmount(),
						"status", Boolean.TRUE.equals(booking.getPaid()) ? "Paid" : "Pending"))
				.toList());

		response.setUsersRows(users.stream()
				.map(user -> Map.<String, Object>of("id", user.getUserId(), "name", user.getFullName(), "email",
						user.getEmail(), "registered", "Active account", "status", "Active"))
				.toList());

		List<Map<String, Object>> paymentSplit = new ArrayList<>();
		paymentSplit.add(Map.of("label", "Paid", "value", paidCount, "color", "#10b981"));
		paymentSplit.add(Map.of("label", "Pending", "value", pendingCount, "color", "#f59e0b"));
		response.setPaymentSplit(paymentSplit);

		return response;
	}

	@Override
	public List<ParkingSlot> getAllSlots() {
		return parkingSlotRepository.findAll().stream().sorted(Comparator.comparing(ParkingSlot::getNumber)).toList();
	}

	@Override
	public ParkingSlot createSlot(ParkingSlotRequest request) {
		String number = request.getNumber().trim().toUpperCase();
		if (parkingSlotRepository.existsByNumber(number)) {
			throw new RuntimeException("Slot number already exists");
		}

		ParkingSlot slot = new ParkingSlot();
		slot.setNumber(number);
		slot.setFloor(request.getFloor().trim());
		slot.setStatus(normalizeStatus(request.getStatus()));
		slot.setPricePerHour(request.getPricePerHour());
		ParkingSlot savedSlot = parkingSlotRepository.save(slot);
		syncParkingSpot(savedSlot, null);
		return savedSlot;
	}

	@Override
	public ParkingSlot updateSlot(Long slotId, ParkingSlotRequest request) {
		ParkingSlot slot = parkingSlotRepository.findById(slotId)
				.orElseThrow(() -> new RuntimeException("Slot not found"));
		String previousNumber = slot.getNumber();
		slot.setNumber(request.getNumber().trim().toUpperCase());
		slot.setFloor(request.getFloor().trim());
		slot.setStatus(normalizeStatus(request.getStatus()));
		slot.setPricePerHour(request.getPricePerHour());
		ParkingSlot savedSlot = parkingSlotRepository.save(slot);
		syncParkingSpot(savedSlot, previousNumber);
		return savedSlot;
	}

	@Override
	@Transactional(readOnly = true)
	public List<Map<String, Object>> getAllBookings() {
		List<Map<String, Object>> rows = new ArrayList<>();

		// Legacy booking model
		for (ParkingBooking booking : parkingBookingRepository.findAll()) {
			Map<String, Object> row = new LinkedHashMap<>();
			row.put("id", booking.getId());
			row.put("ticketNumber", "LEG-" + booking.getId());
			row.put("userName", booking.getUserName());
			row.put("userEmail", booking.getUserEmail() == null ? "" : booking.getUserEmail());
			row.put("slot", booking.getSlot() == null ? "N/A" : booking.getSlot());
			row.put("duration", booking.getDuration() == null ? 0 : booking.getDuration());
			row.put("amount", booking.getAmount() == null ? BigDecimal.ZERO : booking.getAmount());
			row.put("paid", Boolean.TRUE.equals(booking.getPaid()));
			row.put("status", Boolean.TRUE.equals(booking.getPaid()) ? "PAID" : "PENDING");
			row.put("paymentMethod", booking.getPaymentMethod() == null ? "N/A" : booking.getPaymentMethod());
			row.put("vehicleNumber", "N/A");
			row.put("validUntil", booking.getValidUntil());
			row.put("createdAt", booking.getCreatedAt());
			row.put("updatedAt", booking.getUpdatedAt());
			row.put("source", "legacy");
			rows.add(row);
		}

		// Modern booking/payment model
		List<Booking> modernBookings = bookingRepository.findAll();
		for (Booking booking : modernBookings) {
			List<Payment> bookingPayments = paymentRepository.findByBookingBookingId(booking.getBookingId());
			Payment latestPayment = bookingPayments.stream()
					.sorted(Comparator.comparing(Payment::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
					.findFirst()
					.orElse(null);

			LocalDateTime start = booking.getStartTime();
			LocalDateTime end = booking.getEndTime();
			int durationHours = 0;
			if (start != null && end != null) {
				durationHours = (int) Math.max(1, ChronoUnit.HOURS.between(start, end));
			}

			Map<String, Object> row = new LinkedHashMap<>();
			row.put("id", booking.getBookingId());
			row.put("ticketNumber",
					booking.getTicketNumber() == null ? ("PKE-" + booking.getBookingId()) : booking.getTicketNumber());
			row.put("userName",
					booking.getUser() != null && booking.getUser().getFullName() != null ? booking.getUser().getFullName()
							: "N/A");
			row.put("userEmail",
					booking.getUser() != null && booking.getUser().getEmail() != null ? booking.getUser().getEmail() : "");
			row.put("slot",
					booking.getParkingSpot() != null && booking.getParkingSpot().getSpotLabel() != null
							? booking.getParkingSpot().getSpotLabel()
							: "N/A");
			row.put("duration", durationHours);
			row.put("amount", booking.getTotalAmount() == null ? 0 : booking.getTotalAmount());
			row.put("paid",
					"PAID".equalsIgnoreCase(booking.getStatus()) || "CHECKED_IN".equalsIgnoreCase(booking.getStatus())
							|| "COMPLETED".equalsIgnoreCase(booking.getStatus()) || "OVERSTAY".equalsIgnoreCase(booking.getStatus())
							|| "OVERSTAY_PAID".equalsIgnoreCase(booking.getStatus()));
			row.put("status", booking.getStatus() == null ? "UNKNOWN" : booking.getStatus());
			row.put("paymentMethod",
					latestPayment != null && latestPayment.getPaymentMethod() != null ? latestPayment.getPaymentMethod() : "N/A");
			row.put("vehicleNumber", booking.getVehicleNumber() == null ? "N/A" : booking.getVehicleNumber());
			row.put("validUntil", booking.getEndTime());
			row.put("createdAt", booking.getCreatedAt());
			row.put("updatedAt", booking.getUpdatedAt());
			row.put("source", "modern");
			rows.add(row);
		}

		return rows.stream()
				.sorted(Comparator.comparing(
						row -> (LocalDateTime) row.get("createdAt"),
						Comparator.nullsLast(Comparator.reverseOrder())))
				.toList();
	}

	@Override
	public List<Users> getAllUsers() {
		return usersRepository.findAll();
	}

	@Override
	public List<AdminUser> getAllAdminUsers() {
		return adminUserRepository.findAll().stream()
				.sorted(Comparator.comparing(AdminUser::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
				.toList();
	}

	@Override
	public Map<String, Object> getRevenueSummary() {
		AdminOverviewResponse overview = getOverview();
		return Map.of("totalRevenue", overview.getTotalRevenue(), "todayRevenue", overview.getTodayRevenue(),
				"monthRevenue", overview.getMonthRevenue(), "weeklyRevenue", overview.getWeeklyRevenue(),
				"paidCount", overview.getPaidCount(), "pendingCount", overview.getPendingCount(), "bookingsCount",
				overview.getBookingsCount());
	}

	@Override
	public Map<String, Object> getReportsSummary() {
		AdminOverviewResponse overview = getOverview();
		List<Map<String, Object>> highlights = List.of(
				Map.of("label", "Total Slots", "value", overview.getTotalParkingSlots()),
				Map.of("label", "Active Bookings", "value", overview.getBookingsCount()),
				Map.of("label", "Registered Users", "value", overview.getUsersCount()),
				Map.of("label", "Revenue This Month", "value", overview.getMonthRevenue()));

		List<Map<String, Object>> occupancyByFloor = parkingSlotRepository.findAll().stream()
				.collect(Collectors.groupingBy(ParkingSlot::getFloor, Collectors.counting())).entrySet().stream()
				.map(entry -> Map.<String, Object>of("floor", entry.getKey(), "count", entry.getValue())).toList();

		return Map.of("highlights", highlights, "occupancyByFloor", occupancyByFloor, "paymentSplit",
				overview.getPaymentSplit(), "weeklyRevenue", overview.getWeeklyRevenue());
	}

	@Override
	public List<AdminAlert> getActiveAlerts() {
		return adminAlertRepository.findByStatusOrderByCreatedAtDesc("active");
	}

	@Override
	public void dismissAlert(Long alertId) {
		AdminAlert alert = adminAlertRepository.findById(alertId)
				.orElseThrow(() -> new RuntimeException("Alert not found"));
		alert.setStatus("dismissed");
		adminAlertRepository.save(alert);
	}

	private String normalizeStatus(String status) {
		String normalized = status.trim().toLowerCase();
		if (!"available".equals(normalized) && !"occupied".equals(normalized)) {
			throw new RuntimeException("Status must be available or occupied");
		}
		return normalized;
	}

	private void syncParkingSpot(ParkingSlot slot, String previousNumber) {
		ParkingSpot spot = null;
		if (previousNumber != null && !previousNumber.isBlank() && !previousNumber.equalsIgnoreCase(slot.getNumber())) {
			spot = parkingSpotRepository.findBySpotLabel(previousNumber).orElse(null);
		}
		if (spot == null) {
			spot = parkingSpotRepository.findBySpotLabel(slot.getNumber()).orElseGet(ParkingSpot::new);
		}

		spot.setSpotLabel(slot.getNumber());
		spot.setZone(slot.getFloor());
		spot.setIsOccupied("occupied".equalsIgnoreCase(slot.getStatus()));
		spot.setPricePerHour(slot.getPricePerHour() != null ? slot.getPricePerHour().doubleValue() : 75.0);
		if (spot.getNavigationPath() == null || spot.getNavigationPath().isBlank()) {
			spot.setNavigationPath("Follow signs to " + slot.getNumber());
		}

		parkingSpotRepository.save(spot);
	}
}
