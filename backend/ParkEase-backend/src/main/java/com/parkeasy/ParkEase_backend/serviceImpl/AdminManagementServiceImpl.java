package com.parkeasy.ParkEase_backend.serviceImpl;

import com.parkeasy.ParkEase_backend.dto.AdminOverviewResponse;
import com.parkeasy.ParkEase_backend.dto.ParkingSlotRequest;
import com.parkeasy.ParkEase_backend.entity.AdminAlert;
import com.parkeasy.ParkEase_backend.entity.AdminUser;
import com.parkeasy.ParkEase_backend.entity.ParkingBooking;
import com.parkeasy.ParkEase_backend.entity.ParkingSlot;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.repository.AdminAlertRepository;
import com.parkeasy.ParkEase_backend.repository.AdminUserRepository;
import com.parkeasy.ParkEase_backend.repository.ParkingBookingRepository;
import com.parkeasy.ParkEase_backend.repository.ParkingSlotRepository;
import com.parkeasy.ParkEase_backend.repository.UsersRepository;
import com.parkeasy.ParkEase_backend.service.AdminManagementService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
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
	private final ParkingBookingRepository parkingBookingRepository;
	private final UsersRepository usersRepository;
	private final AdminUserRepository adminUserRepository;
	private final AdminAlertRepository adminAlertRepository;

	public AdminManagementServiceImpl(ParkingSlotRepository parkingSlotRepository,
			ParkingBookingRepository parkingBookingRepository, UsersRepository usersRepository,
			AdminUserRepository adminUserRepository, AdminAlertRepository adminAlertRepository) {
		this.parkingSlotRepository = parkingSlotRepository;
		this.parkingBookingRepository = parkingBookingRepository;
		this.usersRepository = usersRepository;
		this.adminUserRepository = adminUserRepository;
		this.adminAlertRepository = adminAlertRepository;
	}

	@Override
	public AdminOverviewResponse getOverview() {
		List<ParkingSlot> slots = parkingSlotRepository.findAll();
		List<ParkingBooking> bookings = parkingBookingRepository.findAll();
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
			String slotLabel = booking.getSlot();
			if (slotLabel != null && !slotLabel.isBlank()) {
				slotUsage.merge(slotLabel, Long.valueOf(1L), Long::sum);
			}

			if (isPaid) {
				paidCount++;
				totalRevenue = totalRevenue.add(amount);
				if (createdDate != null && createdDate.equals(today)) {
					todayRevenue = todayRevenue.add(amount);
				}
				if (createdDate != null && createdDate.getYear() == today.getYear()
						&& createdDate.getMonthValue() == today.getMonthValue()) {
					monthRevenue = monthRevenue.add(amount);
				}
				if (createdDate != null && revenueByDay.containsKey(createdDate)) {
					revenueByDay.put(createdDate, revenueByDay.get(createdDate).add(amount));
				}
			} else {
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
		return parkingSlotRepository.save(slot);
	}

	@Override
	public ParkingSlot updateSlot(Long slotId, ParkingSlotRequest request) {
		ParkingSlot slot = parkingSlotRepository.findById(slotId)
				.orElseThrow(() -> new RuntimeException("Slot not found"));
		slot.setNumber(request.getNumber().trim().toUpperCase());
		slot.setFloor(request.getFloor().trim());
		slot.setStatus(normalizeStatus(request.getStatus()));
		slot.setPricePerHour(request.getPricePerHour());
		return parkingSlotRepository.save(slot);
	}

	@Override
	public List<ParkingBooking> getAllBookings() {
		return parkingBookingRepository.findAll().stream()
				.sorted(Comparator.comparing(ParkingBooking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
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
}
