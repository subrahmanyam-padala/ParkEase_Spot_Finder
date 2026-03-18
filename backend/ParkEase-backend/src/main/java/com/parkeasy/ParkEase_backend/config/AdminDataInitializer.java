package com.parkeasy.ParkEase_backend.config;

import com.parkeasy.ParkEase_backend.entity.AdminAlert;
import com.parkeasy.ParkEase_backend.entity.AdminUser;
import com.parkeasy.ParkEase_backend.entity.Booking;
import com.parkeasy.ParkEase_backend.entity.ParkingBooking;
import com.parkeasy.ParkEase_backend.entity.ParkingSpot;
import com.parkeasy.ParkEase_backend.entity.ParkingSlot;
import com.parkeasy.ParkEase_backend.repository.AdminAlertRepository;
import com.parkeasy.ParkEase_backend.repository.AdminUserRepository;
import com.parkeasy.ParkEase_backend.repository.BookingRepository;
import com.parkeasy.ParkEase_backend.repository.ParkingBookingRepository;
import com.parkeasy.ParkEase_backend.repository.ParkingSpotRepository;
import com.parkeasy.ParkEase_backend.repository.ParkingSlotRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
public class AdminDataInitializer {

	@Bean
	CommandLineRunner seedAdminData(ParkingSlotRepository parkingSlotRepository,
			ParkingSpotRepository parkingSpotRepository,
			BookingRepository bookingRepository,
			ParkingBookingRepository parkingBookingRepository, AdminAlertRepository adminAlertRepository,
			AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			// Seed default admin user if not exists
			if (!adminUserRepository.existsByAdminId("ANI")) {
				AdminUser admin = new AdminUser();
				admin.setName("Ani Admin");
				admin.setEmail("ani@parkease.com");
				admin.setMobile("9999999999");
				admin.setAdminId("ANI");
				admin.setPassword(passwordEncoder.encode("ani123456"));
				admin.setStatus("Active");
				adminUserRepository.save(admin);
				System.out.println("[AdminDataInitializer] Default admin user created: ANI");
			}
			if (parkingSlotRepository.count() == 0) {
				List<ParkingSlot> slots = new ArrayList<>();
				for (int i = 1; i <= 12; i++) {
					ParkingSlot slot = new ParkingSlot();
					slot.setNumber("A" + i);
					slot.setFloor(i <= 6 ? "Ground" : "Level 1");
					slot.setStatus(i % 4 == 0 ? "occupied" : "available");
					slot.setPricePerHour(BigDecimal.valueOf(75 + (i % 3) * 25L));
					slots.add(slot);
				}
				parkingSlotRepository.saveAll(slots);
			}

			syncAdminSlotsToUserSpots(parkingSlotRepository, parkingSpotRepository);
			reconcileOccupancyFromBookings(bookingRepository, parkingSlotRepository, parkingSpotRepository);

			if (parkingBookingRepository.count() == 0) {
				List<ParkingBooking> bookings = new ArrayList<>();
				bookings.add(buildBooking("Aarav Sharma", "aarav@example.com", "A1", 2, 150, true, "upi", 1));
				bookings.add(buildBooking("Meera Nair", "meera@example.com", "A4", 3, 300, true, "card", 2));
				bookings.add(buildBooking("Guest User", "guest@example.com", "A8", 1, 100, false, null, 0));
				parkingBookingRepository.saveAll(bookings);
			}

			if (adminAlertRepository.count() == 0) {
				AdminAlert alertOne = new AdminAlert();
				alertOne.setMessage("Slot A4 is marked occupied for more than 2 hours.");
				alertOne.setType("Occupancy");

				AdminAlert alertTwo = new AdminAlert();
				alertTwo.setMessage("Daily revenue crossed Rs 400. Review payment summary.");
				alertTwo.setType("Revenue");

				adminAlertRepository.saveAll(List.of(alertOne, alertTwo));
			}
		};
	}

	private void reconcileOccupancyFromBookings(BookingRepository bookingRepository,
			ParkingSlotRepository parkingSlotRepository,
			ParkingSpotRepository parkingSpotRepository) {
		List<String> occupiedStatuses = Arrays.asList("ACTIVE", "PAID", "CHECKED_IN", "OVERSTAY", "OVERSTAY_PAID");
		List<Booking> activeBookings = bookingRepository.findByStatusIn(occupiedStatuses);
		Set<String> activeSpotLabels = activeBookings.stream()
				.map(Booking::getParkingSpot)
				.filter(java.util.Objects::nonNull)
				.map(ParkingSpot::getSpotLabel)
				.filter(label -> label != null && !label.isBlank())
				.map(label -> label.trim().toUpperCase())
				.collect(Collectors.toSet());

		for (String rawSpotLabel : activeSpotLabels) {
			if (rawSpotLabel == null || rawSpotLabel.isBlank()) {
				continue;
			}
			String spotLabel = rawSpotLabel.trim().toUpperCase();

			parkingSpotRepository.findBySpotLabel(spotLabel).ifPresent(spot -> {
				spot.setIsOccupied(true);
				parkingSpotRepository.save(spot);
			});

			parkingSlotRepository.findByNumber(spotLabel).ifPresent(slot -> {
				slot.setStatus("occupied");
				parkingSlotRepository.save(slot);
			});
		}
		if (!activeSpotLabels.isEmpty()) {
			System.out.println(
					"[AdminDataInitializer] Reconciled occupancy for " + activeSpotLabels.size() + " active spot labels");
		}
	}

	private void syncAdminSlotsToUserSpots(ParkingSlotRepository parkingSlotRepository,
			ParkingSpotRepository parkingSpotRepository) {
		List<ParkingSlot> slots = parkingSlotRepository.findAll();
		for (ParkingSlot slot : slots) {
			ParkingSpot spot = parkingSpotRepository.findBySpotLabel(slot.getNumber()).orElseGet(ParkingSpot::new);
			spot.setSpotLabel(slot.getNumber());
			spot.setZone(slot.getFloor());
			spot.setIsOccupied("occupied".equalsIgnoreCase(slot.getStatus()));
			spot.setPricePerHour(slot.getPricePerHour() != null ? slot.getPricePerHour().doubleValue() : 75.0);
			if (spot.getNavigationPath() == null || spot.getNavigationPath().isBlank()) {
				spot.setNavigationPath("Follow signs to " + slot.getNumber());
			}
			parkingSpotRepository.save(spot);
		}
		System.out.println("[AdminDataInitializer] Synced " + slots.size() + " admin slots to user parking spots");
	}

	private ParkingBooking buildBooking(String userName, String email, String slot, int duration, int amount,
			boolean paid,
			String paymentMethod, int daysAgo) {
		ParkingBooking booking = new ParkingBooking();
		booking.setUserName(userName);
		booking.setUserEmail(email);
		booking.setSlot(slot);
		booking.setDuration(duration);
		booking.setAmount(BigDecimal.valueOf(amount));
		booking.setPricePerHour(BigDecimal.valueOf(amount / duration));
		booking.setPaid(paid);
		booking.setPaymentMethod(paymentMethod);
		booking.setValidUntil(LocalDateTime.now().plusHours(duration));
		booking.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
		booking.setUpdatedAt(LocalDateTime.now().minusDays(daysAgo));
		return booking;
	}
}
