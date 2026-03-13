package com.parkeasy.ParkEase_backend.serviceImpl;

import com.parkeasy.ParkEase_backend.dto.ChatbotResponseDTO;
import com.parkeasy.ParkEase_backend.dto.ChatbotRequestDTO;
import com.parkeasy.ParkEase_backend.entity.Booking;
import com.parkeasy.ParkEase_backend.entity.ParkingSpot;
import com.parkeasy.ParkEase_backend.entity.PricingConfig;
import com.parkeasy.ParkEase_backend.repository.BookingRepository;
import com.parkeasy.ParkEase_backend.repository.ParkingSpotRepository;
import com.parkeasy.ParkEase_backend.service.ChatbotService;
import com.parkeasy.ParkEase_backend.service.OccupancyService;
import com.parkeasy.ParkEase_backend.service.PricingService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatbotServiceImpl implements ChatbotService {

	private static final List<String> ACTIVE_STATUSES = Arrays.asList("ACTIVE", "PAID", "CHECKED_IN");
	private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("dd MMM, hh:mm a");

	private final ParkingSpotRepository parkingSpotRepository;
	private final BookingRepository bookingRepository;
	private final PricingService pricingService;
	private final OccupancyService occupancyService;

	public ChatbotServiceImpl(ParkingSpotRepository parkingSpotRepository, BookingRepository bookingRepository,
			PricingService pricingService, OccupancyService occupancyService) {
		this.parkingSpotRepository = parkingSpotRepository;
		this.bookingRepository = bookingRepository;
		this.pricingService = pricingService;
		this.occupancyService = occupancyService;
	}

	//
	// Main intent router
	//
	@Override
	public ChatbotResponseDTO processMessage(ChatbotRequestDTO requestDTO) {
		String raw = requestDTO.getMessage();
		if (raw == null || raw.isBlank())
			return handleUnknown();
		String message = raw.toLowerCase().trim();
		Integer userId = requestDTO.getUserId();

		// Greetings
		if (matchesIntent(message.toLowerCase(), "hello", "hi", "hey", "hii", "helo", "greet", "help", "start", "get started", "menu",
				"what can you do", "what do you do")) {
			return handleGreeting();
		}

		// My bookings / ticket / status
		if (matchesIntent(message.toLowerCase(), "my booking", "my ticket", "my reservation", "active booking", "current booking",
				"show booking", "check booking", "booking status", "view ticket", "my pass", "my parking")) {
			return handleMyBookings(userId);
		}

		// QR code / scan / entry / exit
		if (matchesIntent(message.toLowerCase(), "qr", "scan", "barcode", "entry", "exit", "gate", "enter", "check in", "checkin",
				"check-in", "check out", "checkout", "check-out", "leave", "going out")) {
			return handleQrAndGate(userId);
		}

		// Navigation / directions
		if (matchesIntent(message.toLowerCase(), "navigate", "direction", "find my car", "where is my", "where is spot", "location",
				"path", "how to reach", "way to", "how do i get", "guide me", "take me", "show me the way",
				"spot location")) {
			return handleNavigation(message, userId);
		}

		// Pricing
		if (matchesIntent(message.toLowerCase(), "price", "cost", "fee", "charge", "rate", "how much", "pricing", "surge", "tariff",
				"amount", "kitna", "charges", "rupee", "inr", "₹")) {
			return handlePricing();
		}

		// EV / electric spots
		if (matchesIntent(message.toLowerCase(), "ev", "electric", "charging", "charge my car", "ev spot", "electric vehicle",
				"ev parking", "ev charge")) {
			return handleEvSpots();
		}

		// Available spots
		if (matchesIntent(message.toLowerCase(), "available", "free spot", "empty", "vacant", "open spot", "any spot", "show spots",
				"list spots", "find spot", "find parking", "spot available", "is there", "parking available")) {
			return handleAvailableSpots(message);
		}

		// Book / reserve
		if (matchesIntent(message.toLowerCase(), "book", "reserve", "want to park", "need parking", "get a spot", "new booking",
				"make a booking", "create booking")) {
			return handleBookingHelp();
		}

		// Occupancy / busy
		if (matchesIntent(message.toLowerCase(), "occupancy", "busy", "crowd", "predict", "forecast", "rush", "how full",
				"is it full", "lot status", "parking full", "how many spots", "how many available")) {
			return handleOccupancyInfo(message);
		}

		// Zone / floor info
		if (matchesIntent(message.toLowerCase(), "zone", "floor", "level", "section", "area", "ground floor", "rooftop", "premium",
				"which zone")) {
			return handleZoneInfo(message);
		}

		// Overstay
		if (matchesIntent(message.toLowerCase(), "overstay", "over stay", "extra time", "time exceeded", "time expired",
				"beyond time", "late", "penalty", "fine", "exceed")) {
			return handleOverstay(userId);
		}

		// Extend time
		if (matchesIntent(message.toLowerCase(), "extend", "more time", "extra hour", "add time", "increase time", "stay longer",
				"extend my", "extend parking")) {
			return handleExtendTime(userId);
		}

		// Time remaining / duration
		if (matchesIntent(message.toLowerCase(), "time left", "time remaining", "how long", "how much time", "when does", "when will",
				"expiry", "expire", "validity", "valid until", "end time", "parking end", "ticket valid")) {
			return handleTimeRemaining(userId);
		}

		// Cancel / refund
		if (matchesIntent(message.toLowerCase(), "cancel", "refund", "cancellation", "undo booking", "remove booking",
				"delete booking")) {
			return handleCancellation();
		}

		// Payment
		if (matchesIntent(message.toLowerCase(), "payment", "pay", "razorpay", "upi", "gpay", "google pay", "phonepe", "paytm",
				"net banking", "debit card", "credit card", "wallet", "how to pay", "payment method", "pay online")) {
			return handlePaymentHelp();
		}

		// Opening hours / contact / support
		if (matchesIntent(message.toLowerCase(), "open", "close", "timing", "hours", "schedule", "when open", "working hours",
				"support", "contact", "help desk", "customer care", "phone number", "email support")) {
			return handleSupportInfo();
		}

		// Vehicle / number plate
		if (matchesIntent(message.toLowerCase(), "vehicle", "car number", "number plate", "registration", "my car", "my vehicle",
				"change vehicle", "wrong vehicle")) {
			return handleVehicleHelp();
		}

		// Farewell / thanks ("exit" intentionally omitted — caught by QR gate block
		// above)
		if (matchesIntent(message.toLowerCase(), "bye", "goodbye", "see you", "thanks", "thank you", "thank", "thx", "ok thanks",
				"done", "quit", "that's all", "no thanks", "no need", "okay", "great", "awesome", "perfect")) {
			return new ChatbotResponseDTO("You're welcome! 😊 Have a safe drive and a great day at ParkEase! 🅿️",
					"FAREWELL", buildSuggestions("Find a spot", "find_spot", "View pricing", "pricing", "My tickets",
							"my_bookings"));
		}

		return handleUnknown();
	}

	// 
	// Intent handlers
	// 

	private ChatbotResponseDTO handleGreeting() {
		long available = parkingSpotRepository.countTotalSpots() - parkingSpotRepository.countOccupiedSpots();
		String reply = "👋 Hello! Welcome to **ParkEase Assistant**!\n\n" + "Currently **" + available
				+ " spots** are available at ABC City Mall.\n\n" + "Here's what I can help you with:\n"
				+ "🅿️ **Find available spots**\n" + "💰 **Check current pricing**\n"
				+ "📋 **View your bookings & ticket**\n" + "🧭 **Get directions to your spot**\n"
				+ "⚡ **Find EV charging spots**\n" + "📊 **Check how busy the lot is**\n" + "❌ **Cancel a booking**\n"
				+ "💳 **Payment help**\n\n" + "What would you like to do?";
		return new ChatbotResponseDTO(reply, "GREETING", buildSuggestions("Find a spot", "find_spot", "My tickets",
				"my_bookings", "Pricing", "pricing", "How to park?", "help"));
	}

	private ChatbotResponseDTO handleAvailableSpots(String message) {
		List<ParkingSpot> available = parkingSpotRepository.findByIsOccupiedFalse();

		if (available.isEmpty()) {
			return new ChatbotResponseDTO(
					"😔 All parking spots are currently occupied.\n\n"
							+ "Try checking back in 15–30 minutes, or plan your visit during off-peak hours "
							+ "(before 10 AM or after 8 PM) for the best availability.",
					"AVAILABILITY",
					buildSuggestions("Check occupancy", "occupancy", "Pricing", "pricing", "EV spots", "ev"));
		}

		// Check if user asked about a specific zone
		List<String> zones = parkingSpotRepository.findAllZones();
		for (String zone : zones) {
			if (message.contains(zone.toLowerCase())) {
				List<ParkingSpot> zoneSpots = parkingSpotRepository.findByZoneAndIsOccupiedFalse(zone);
				return buildAvailabilityResponse(zoneSpots, zone);
			}
		}

		return buildAvailabilityResponse(available, null);
	}

	private ChatbotResponseDTO buildAvailabilityResponse(List<ParkingSpot> spots, String zone) {
		StringBuilder reply = new StringBuilder();
		if (zone != null) {
			reply.append("🅿️ Available spots in **").append(zone).append("**:\n\n");
		} else {
			reply.append("🅿️ **Available Parking Spots:**\n\n");
		}

		int count = 0;
		for (ParkingSpot spot : spots) {
			if (count >= 8) {
				reply.append("… and **").append(spots.size() - 8).append(" more** spots available.\n");
				break;
			}
			String evTag = Boolean.TRUE.equals(spot.getIsEvOnly()) ? " ⚡" : "";
			reply.append("• **").append(spot.getSpotLabel()).append("**").append(" — ").append(spot.getZone())
					.append(evTag).append("\n");
			count++;
		}

		reply.append("\n💡 **").append(spots.size()).append(" spots** available in total.\n")
				.append("Tap **Book Now** to reserve one!");

		return new ChatbotResponseDTO(reply.toString(), "AVAILABILITY",
				buildSuggestions("Book now", "book", "EV spots", "ev", "Check zones", "zone", "Main menu", "menu"));
	}

	private ChatbotResponseDTO handleNavigation(String message, Integer userId) {
		// Try user's own active booking first
		if (userId != null) {
			List<Booking> myBookings = getActiveBookingsForUser(userId);
			if (!myBookings.isEmpty()) {
				Booking latest = myBookings.get(myBookings.size() - 1);
				ParkingSpot spot = latest.getParkingSpot();
				String nav = (spot.getNavigationPath() != null && !spot.getNavigationPath().isBlank())
						? spot.getNavigationPath()
						: "Follow the parking signs to spot " + spot.getSpotLabel() + ".";

				return new ChatbotResponseDTO(
						"🧭 **Directions to your spot " + spot.getSpotLabel() + " (" + spot.getZone() + "):**\n\n"
								+ "📍 " + nav + "\n\n" + "🎫 Ticket: **" + latest.getTicketNumber() + "**\n"
								+ "🚗 Vehicle: **" + latest.getVehicleNumber() + "**",
						"NAVIGATION", buildSuggestions("View my ticket", "view_ticket", "Main menu", "menu"));
			}
		}

		// Check if user mentioned a specific spot label
		List<ParkingSpot> allSpots = parkingSpotRepository.findAll();
		for (ParkingSpot spot : allSpots) {
			if (message.contains(spot.getSpotLabel().toLowerCase())) {
				String nav = (spot.getNavigationPath() != null && !spot.getNavigationPath().isBlank())
						? spot.getNavigationPath()
						: "Follow the parking signs to spot " + spot.getSpotLabel() + ".";
				return new ChatbotResponseDTO(
						"🧭 **Directions to spot " + spot.getSpotLabel() + " (" + spot.getZone() + "):**\n\n📍 " + nav,
						"NAVIGATION", buildSuggestions("Book this spot", "book", "Other spots", "find_spot"));
			}
		}

		return new ChatbotResponseDTO("🧭 **How to Navigate:**\n\n"
				+ "• Say **\"Where is my spot?\"** if you have an active booking — I'll fetch your directions.\n"
				+ "• Say **\"Navigate to A1\"** (replace A1 with your spot number) for step-by-step directions.\n\n"
				+ "Don't have a booking yet? Reserve a spot first!", "NAVIGATION",
				buildSuggestions("My bookings", "my_bookings", "Find a spot", "find_spot"));
	}

	private ChatbotResponseDTO handlePricing() {
		PricingConfig config = pricingService.getCurrentPricing();
		boolean surgeActive = pricingService.isSurgeActive();
		double occupancy = pricingService.getCurrentOccupancyPercent();

		String surgeInfo = surgeActive
				? "🔴 **SURGE PRICING IS ACTIVE** — lot is **" + String.format("%.0f", occupancy) + "%** full.\n"
						+ "Current rate is **" + config.getSurgeMultiplier() + "× the base price**."
				: "🟢 **Normal pricing** active — lot is **" + String.format("%.0f", occupancy) + "%** full.\n"
						+ "Surge pricing activates above **" + config.getSurgeThresholdPercent() + "%** occupancy.";

		String reply = "💰 **ParkEase Parking Rates:**\n\n" + "Base rate: **₹"
				+ String.format("%.0f", config.getBasePricePerHour()) + " / hour**\n" + surgeInfo + "\n\n"
				+ "📊 Estimated totals:\n" + "• 1 hour → **₹"
				+ String.format("%.0f", pricingService.calculateTotalFee(1)) + "**\n" + "• 2 hours → **₹"
				+ String.format("%.0f", pricingService.calculateTotalFee(2)) + "**\n" + "• 4 hours → **₹"
				+ String.format("%.0f", pricingService.calculateTotalFee(4)) + "**\n" + "• 8 hours → **₹"
				+ String.format("%.0f", pricingService.calculateTotalFee(8)) + "**\n\n"
				+ "💡 Tip: Book during off-peak hours (before 10 AM or after 8 PM) for the best rates!";

		return new ChatbotResponseDTO(reply, "PRICING",
				buildSuggestions("Book now", "book", "Find a spot", "find_spot", "Main menu", "menu"));
	}

	private ChatbotResponseDTO handleBookingHelp() {
		long available = parkingSpotRepository.countTotalSpots() - parkingSpotRepository.countOccupiedSpots();
		return new ChatbotResponseDTO(
				"📋 **How to Book a Parking Spot:**\n\n" + "1️⃣ Tap **Book** in the app to see the **" + available
						+ " available spot(s)**\n" + "2️⃣ Select your preferred spot and zone\n"
						+ "3️⃣ Enter your **vehicle number** and preferred **duration**\n"
						+ "4️⃣ Complete **payment** securely (UPI / Card / Wallet)\n"
						+ "5️⃣ Get your **QR code ticket** — show it at the gate!\n\n"
						+ "The whole process takes less than 2 minutes. 🚀",
				"BOOKING_HELP",
				buildSuggestions("Find a spot", "find_spot", "View pricing", "pricing", "Payment help", "payment"));
	}

	private ChatbotResponseDTO handleMyBookings(Integer userId) {
		if (userId == null) {
			return new ChatbotResponseDTO(
					"🔐 Please **log in** first to view your bookings.\n\n"
							+ "Once logged in, I can show you your active tickets and parking status.",
					"AUTH_REQUIRED", buildSuggestions("Find a spot", "find_spot", "Main menu", "menu"));
		}

		List<Booking> active = getActiveBookingsForUser(userId);
		if (active.isEmpty()) {
			return new ChatbotResponseDTO(
					"📋 You don't have any **active bookings** right now.\n\n"
							+ "Would you like to reserve a parking spot?",
					"MY_BOOKINGS",
					buildSuggestions("Book now", "book", "Find a spot", "find_spot", "Main menu", "menu"));
		}

		StringBuilder reply = new StringBuilder("📋 **Your Current Parking Session");
		if (active.size() > 1)
			reply.append("s (").append(active.size()).append(")");
		reply.append(":**\n\n");

		for (Booking b : active) {
			ParkingSpot spot = b.getParkingSpot();
			String statusLabel = getStatusLabel(b.getStatus());
			String endTime = b.getEndTime() != null ? b.getEndTime().format(TIME_FMT) : "N/A";
			reply.append("🎫 **").append(b.getTicketNumber()).append("**\n").append("   📍 Spot: **")
					.append(spot.getSpotLabel()).append("** (").append(spot.getZone()).append(")\n")
					.append("   🚗 Vehicle: **").append(b.getVehicleNumber()).append("**\n").append("   ✅ Status: **")
					.append(statusLabel).append("**\n").append("   ⏰ Valid until: **").append(endTime).append("**\n")
					.append("   💰 Amount: **₹").append(b.getTotalAmount()).append("**\n\n");
		}

		return new ChatbotResponseDTO(reply.toString(), "MY_BOOKINGS", buildSuggestions("View ticket", "view_ticket",
				"Navigate to spot", "navigate", "Time remaining", "time_left", "Main menu", "menu"));
	}

	private ChatbotResponseDTO handleQrAndGate(Integer userId) {
		if (userId != null) {
			List<Booking> active = getActiveBookingsForUser(userId);
			if (!active.isEmpty()) {
				Booking b = active.get(active.size() - 1);
				String status = b.getStatus();
				if ("PAID".equalsIgnoreCase(status)) {
					return new ChatbotResponseDTO(
							"🎫 **Your ticket is ready for entry!**\n\n" + "Ticket: **" + b.getTicketNumber() + "**\n"
									+ "Spot: **" + b.getParkingSpot().getSpotLabel() + "**\n\n"
									+ "👉 Open your **QR code ticket** in the app and show it at the **entry gate**.\n"
									+ "The scanner will check you in and raise the barrier automatically.",
							"QR_GATE", buildSuggestions("View ticket", "view_ticket", "Navigate to spot", "navigate"));
				} else if ("CHECKED_IN".equalsIgnoreCase(status)) {
					return new ChatbotResponseDTO(
							"🚗 **You are currently checked in!**\n\n" + "Ticket: **" + b.getTicketNumber() + "**\n"
									+ "Spot: **" + b.getParkingSpot().getSpotLabel() + "**\n\n"
									+ "When you're ready to leave, open your **QR ticket** in the app and "
									+ "show it at the **exit gate**. The scanner will check you out.",
							"QR_GATE", buildSuggestions("View ticket", "view_ticket", "Time remaining", "time_left"));
				}
			}
		}

		return new ChatbotResponseDTO("📱 **QR Code & Gate Information:**\n\n" + "**Entry Gate:**\n"
				+ "• Open your ticket in the app → tap **View QR Ticket**\n"
				+ "• Show the QR code to the scanner at the **entry gate**\n" + "• The barrier opens automatically\n\n"
				+ "**Exit Gate:**\n" + "• Show the same QR code at the **exit gate**\n"
				+ "• If you've overstayed, pay the extra fee first on the app\n\n"
				+ "💡 Your QR code works for both entry and exit!", "QR_GATE",
				buildSuggestions("My tickets", "my_bookings", "Book now", "book"));
	}

	private ChatbotResponseDTO handleEvSpots() {
		List<ParkingSpot> evSpots = parkingSpotRepository.findByIsOccupiedFalseAndIsEvOnly(true);
		if (evSpots.isEmpty()) {
			return new ChatbotResponseDTO(
					"⚡ All EV charging spots are currently occupied.\n\n"
							+ "Please check back in a little while. In the meantime, you can also use a regular spot.",
					"EV_SPOTS", buildSuggestions("Find regular spots", "find_spot", "Check occupancy", "occupancy"));
		}

		StringBuilder reply = new StringBuilder("⚡ **Available EV Charging Spots:**\n\n");
		for (ParkingSpot spot : evSpots) {
			reply.append("• **").append(spot.getSpotLabel()).append("** — ").append(spot.getZone()).append("\n");
		}
		reply.append("\n**").append(evSpots.size()).append(" EV spot(s)** available right now.");

		return new ChatbotResponseDTO(reply.toString(), "EV_SPOTS",
				buildSuggestions("Book an EV spot", "book", "View pricing", "pricing", "Main menu", "menu"));
	}

	private ChatbotResponseDTO handleOccupancyInfo(String message) {
		Map<String, Object> status = occupancyService.getCurrentOccupancyStatus();

		String dayOfWeek = LocalDateTime.now().getDayOfWeek().name();
		int nextHour = (LocalDateTime.now().getHour() + 1) % 24;
		Map<String, Object> prediction = occupancyService.getPredictedOccupancy(dayOfWeek, nextHour);

		Object occupancyPct = status.get("occupancyPercent");
		String busyLevel = getBusyLabel(occupancyPct);

		String reply = "📊 **Live Parking Occupancy:**\n\n" + "🔢 Total spots: **" + status.get("totalSpots") + "**\n"
				+ "🚗 Occupied: **" + status.get("occupiedSpots") + "**\n" + "✅ Available: **"
				+ status.get("availableSpots") + "**\n" + "📈 Occupancy: **" + occupancyPct + "%** — " + busyLevel
				+ "\n\n" + "🔮 **Next hour forecast:**\n" + "• Expected free spots: **"
				+ prediction.get("predictedAvailable") + "**\n" + "• Confidence: " + prediction.get("confidence")
				+ "\n\n" + "💡 Tip: Best time to arrive is before 10 AM or after 8 PM.";

		return new ChatbotResponseDTO(reply, "OCCUPANCY",
				buildSuggestions("Find a spot", "find_spot", "Check zones", "zone", "Pricing", "pricing"));
	}

	private ChatbotResponseDTO handleZoneInfo(String message) {
		List<String> zones = parkingSpotRepository.findAllZones();
		if (zones.isEmpty()) {
			return new ChatbotResponseDTO("No parking zones are configured yet.", "ZONE_INFO",
					buildSuggestions("Find a spot", "find_spot", "Main menu", "menu"));
		}

		StringBuilder reply = new StringBuilder("🏢 **Parking Zones at ABC City Mall:**\n\n");
		for (String zone : zones) {
			long total = parkingSpotRepository.countTotalSpotsByZone(zone);
			long occupied = parkingSpotRepository.countOccupiedSpotsByZone(zone);
			long avail = total - occupied;
			String bar = avail == 0 ? "🔴 Full" : avail < total / 3 ? "🟡 Almost full" : "🟢 Available";
			reply.append("📍 **").append(zone).append("**: ").append(avail).append("/").append(total).append(" free  ")
					.append(bar).append("\n");
		}
		reply.append("\nSay **\"available spots in [zone]\"** to see specific spots in a zone.");

		return new ChatbotResponseDTO(reply.toString(), "ZONE_INFO",
				buildSuggestions("Find a spot", "find_spot", "Book now", "book", "Main menu", "menu"));
	}

	private ChatbotResponseDTO handleOverstay(Integer userId) {
		if (userId != null) {
			List<Booking> checkedIn = bookingRepository.findByUserUserIdAndStatus(userId, "CHECKED_IN");
			for (Booking b : checkedIn) {
				if (b.getEndTime() != null && b.getEndTime().isBefore(LocalDateTime.now())) {
					return new ChatbotResponseDTO(
							"⚠️ **Overstay Detected!**\n\n" + "Ticket: **" + b.getTicketNumber() + "**\n" + "Spot: **"
									+ b.getParkingSpot().getSpotLabel() + "**\n" + "Your booking expired at **"
									+ b.getEndTime().format(TIME_FMT) + "**.\n\n"
									+ "An **overstay fee** has been calculated. "
									+ "Please pay the overstay amount in the app before scanning at the exit gate.\n\n"
									+ "Go to **My Tickets → View Ticket → Pay Overstay** to clear it.",
							"OVERSTAY", buildSuggestions("My tickets", "my_bookings", "Main menu", "menu"));
				}
			}
		}

		return new ChatbotResponseDTO("⏱️ **About Overstay at ParkEase:**\n\n"
				+ "If you stay beyond your booked end time, an **overstay fee** is automatically calculated.\n\n"
				+ "**How to pay:**\n" + "1. Open your ticket in the app\n" + "2. Tap **Pay Overstay**\n"
				+ "3. Complete payment\n" + "4. Scan your QR code at the exit gate\n\n"
				+ "💡 You cannot exit without paying the overstay fee first.", "OVERSTAY",
				buildSuggestions("My tickets", "my_bookings", "Payment help", "payment"));
	}

	private ChatbotResponseDTO handleTimeRemaining(Integer userId) {
		if (userId == null) {
			return new ChatbotResponseDTO("🔐 Please **log in** to check your remaining parking time.",
					"TIME_REMAINING", buildSuggestions("Main menu", "menu"));
		}

		List<Booking> active = getActiveBookingsForUser(userId);
		if (active.isEmpty()) {
			return new ChatbotResponseDTO("📋 You have no active parking sessions.\n\nWould you like to book a spot?",
					"TIME_REMAINING", buildSuggestions("Book now", "book", "Find a spot", "find_spot"));
		}

		StringBuilder reply = new StringBuilder("⏰ **Your Parking Time Status:**\n\n");
		LocalDateTime now = LocalDateTime.now();
		for (Booking b : active) {
			if (b.getEndTime() == null) {
				reply.append("🎫 **").append(b.getTicketNumber()).append("** — end time not set.\n\n");
				continue;
			}
			long minutesLeft = Duration.between(now, b.getEndTime()).toMinutes();
			if (minutesLeft < 0) {
				reply.append("🎫 **").append(b.getTicketNumber()).append("**\n").append("   ⚠️ **EXPIRED** ")
						.append(Math.abs(minutesLeft)).append(" min ago — overstay fee applies!\n\n");
			} else {
				long hours = minutesLeft / 60;
				long mins = minutesLeft % 60;
				String timeStr = hours > 0 ? hours + "h " + mins + "m" : mins + " min";
				reply.append("🎫 **").append(b.getTicketNumber()).append("**\n").append("   📍 Spot: **")
						.append(b.getParkingSpot().getSpotLabel()).append("**\n").append("   ⏳ Time left: **")
						.append(timeStr).append("**\n").append("   🕐 Ends at: **")
						.append(b.getEndTime().format(TIME_FMT)).append("**\n\n");
			}
		}

		return new ChatbotResponseDTO(reply.toString(), "TIME_REMAINING",
				buildSuggestions("View ticket", "view_ticket", "My bookings", "my_bookings", "Main menu", "menu"));
	}

	private ChatbotResponseDTO handleExtendTime(Integer userId) {
		if (userId != null) {
			List<Booking> active = getActiveBookingsForUser(userId);
			if (!active.isEmpty()) {
				Booking b = active.get(active.size() - 1);
				String endTime = b.getEndTime() != null ? b.getEndTime().format(TIME_FMT) : "N/A";
				return new ChatbotResponseDTO(
						"⏱️ **Extending Parking Time for ticket " + b.getTicketNumber() + ":**\n\n"
								+ "Your current session ends at **" + endTime + "**\n\n"
								+ "**To extend your parking:**\n" + "1. Go to **My Tickets** in the app\n"
								+ "2. Tap your active ticket\n" + "3. Tap **Extend Time** and choose additional hours\n"
								+ "4. Pay the extra fee — your ticket is updated instantly\n\n"
								+ "💡 Extend before your time runs out to avoid overstay fees!",
						"EXTEND_TIME", buildSuggestions("My tickets", "my_bookings", "Time remaining", "time_left",
								"Overstay info", "overstay", "Main menu", "menu"));
			}
		}
		return new ChatbotResponseDTO("⏱️ **Extending Parking Time:**\n\n"
				+ "You can extend an active parking session directly from the app:\n\n" + "1. Go to **My Tickets**\n"
				+ "2. Tap your active ticket\n" + "3. Tap **Extend Time** and choose extra hours\n"
				+ "4. Complete payment — your end time updates immediately\n\n"
				+ "💡 Always extend before your session expires to avoid overstay charges!", "EXTEND_TIME",
				buildSuggestions("My tickets", "my_bookings", "Overstay info", "overstay", "Main menu", "menu"));
	}

	private ChatbotResponseDTO handleCancellation() {
		return new ChatbotResponseDTO(
				"❌ **How to Cancel a Booking:\n\n" + "1. Tap **Bookings** in the app\n"
						+ "2. Select the booking you want to cancel\n"
						+ "3. Tap **Cancel Booking** — your spot is freed immediately\n\n"
						+ "⚠️ **Note:** Cancellations are only possible before you check in.\n"
						+ "Refunds are processed within 5–7 business days to your original payment method.",
				"CANCELLATION",
				buildSuggestions("My tickets", "my_bookings", "Payment help", "payment", "Main menu", "menu"));
	}

	private ChatbotResponseDTO handlePaymentHelp() {
		return new ChatbotResponseDTO(
				"💳 **Payment Options at ParkEase:**\n\n" + "We accept all major payment methods via **Razorpay**:\n\n"
						+ "• 📱 **UPI** — Google Pay, PhonePe, Paytm, BHIM\n"
						+ "• 💳 **Cards** — Visa, Mastercard, RuPay (Debit & Credit)\n"
						+ "• 🏦 **Net Banking** — all major banks\n" + "• 👛 **Wallets** — Paytm, Amazon Pay\n\n"
						+ "**Steps:**\n" + "1. Select your spot and duration\n" + "2. Tap **Proceed to Pay**\n"
						+ "3. Complete payment on the secure checkout\n"
						+ "4. Your QR code ticket is generated instantly\n\n"
						+ "🔒 All transactions are secure and encrypted.",
				"PAYMENT_HELP", buildSuggestions("Book now", "book", "View pricing", "pricing", "Main menu", "menu"));
	}

	private ChatbotResponseDTO handleSupportInfo() {
		return new ChatbotResponseDTO("🏢 **ParkEase — ABC City Mall Parking**\n\n"
				+ "🕐 **Operating Hours:** 6:00 AM – 11:00 PM (all days)\n\n"
				+ "📞 **Support Helpline:** +91-1800-PARKEASE (toll-free)\n" + "📧 **Email:** support@parkease.in\n"
				+ "🌐 **In-app support:** Tap **Profile → Help & Support**\n\n"
				+ "For urgent issues (barrier stuck, payment failed, spot conflict), "
				+ "please approach the parking attendant at the gate.", "SUPPORT",
				buildSuggestions("My tickets", "my_bookings", "Payment help", "payment", "Main menu", "menu"));
	}

	private ChatbotResponseDTO handleVehicleHelp() {
		return new ChatbotResponseDTO("🚗 **Vehicle Number Help:**\n\n"
				+ "• Your **vehicle number / number plate** is required when booking a spot.\n"
				+ "• Example format: **MH 12 AB 1234** or **KA 01 MX 9999**\n\n" + "**Wrong vehicle number entered?**\n"
				+ "Cancel the current booking and create a new one with the correct number plate.\n"
				+ "(Cancellations are free before check-in.)\n\n"
				+ "💡 Your vehicle number appears on your QR ticket and is checked at the gate.", "VEHICLE_HELP",
				buildSuggestions("My tickets", "my_bookings", "Cancel booking", "cancel", "Main menu", "menu"));
	}

	private ChatbotResponseDTO handleUnknown() {
		return new ChatbotResponseDTO("🤔 I didn't quite catch that. Here are some things I can help with:\n\n"
				+ "• **\"Find available spots\"** — browse parking spots\n"
				+ "• **\"What's the price?\"** — check current rates\n"
				+ "• **\"My tickets\"** — view your active bookings\n" + "• **\"How to use QR?\"** — entry/exit guide\n"
				+ "• **\"How busy is it?\"** — live occupancy\n" + "• **\"EV spots\"** — electric vehicle parking\n"
				+ "• **\"How to cancel?\"** — cancellation help\n" + "• **\"Payment help\"** — payment methods\n\n"
				+ "Try one of the quick options below! 👇", "UNKNOWN",
				buildSuggestions("Find a spot", "find_spot", "My tickets", "my_bookings", "Pricing", "pricing",
						"How to park?", "help"));
	}

	// 
	// Utility helpers
	// 

	/** Returns all bookings for a user with an active/in-progress status. */
	private List<Booking> getActiveBookingsForUser(Integer userId) {
		List<Booking> all = bookingRepository.findByUserUserId(userId);
		return all.stream()
				.filter(b -> ACTIVE_STATUSES.contains(b.getStatus() != null ? b.getStatus().toUpperCase() : ""))
				.collect(Collectors.toList());
	}

	/**
	 * Builds a flat suggestion list as {label, action} maps consumed by the
	 * frontend.
	 */
	private List<Map<String, Object>> buildSuggestions(String... labelActionPairs) {
		List<Map<String, Object>> list = new ArrayList<>();
		for (int i = 0; i + 1 < labelActionPairs.length; i += 2) {
			Map<String, Object> s = new LinkedHashMap<>();
			s.put("label", labelActionPairs[i]);
			s.put("action", labelActionPairs[i + 1]);
			list.add(s);
		}
		return list;
	}

	private boolean matchesIntent(String message, String... keywords) {
		for (String keyword : keywords) {
			if (message.contains(keyword))
				return true;
		}
		return false;
	}

	private String getStatusLabel(String status) {
		if (status == null)
			return "Unknown";
		switch (status.toUpperCase()) {
		case "PAID":
			return "Ready to Enter";
		case "CHECKED_IN":
			return "Parked / Checked In";
		case "ACTIVE":
			return "Active";
		case "COMPLETED":
			return "Completed";
		case "CANCELLED":
			return "Cancelled";
		default:
			return status;
		}
	}

	private String getBusyLabel(Object pctObj) {
		try {
			double pct = Double.parseDouble(pctObj.toString());
			if (pct >= 90)
				return "🔴 Very Busy";
			if (pct >= 70)
				return "🟠 Busy";
			if (pct >= 40)
				return "🟡 Moderate";
			return "🟢 Not Busy";
		} catch (Exception e) {
			return "";
		}
	}
}
