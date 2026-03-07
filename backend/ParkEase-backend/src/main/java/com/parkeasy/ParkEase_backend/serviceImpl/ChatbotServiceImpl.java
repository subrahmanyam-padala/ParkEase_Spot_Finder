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

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ChatbotServiceImpl implements ChatbotService {

  private final ParkingSpotRepository parkingSpotRepository;
  private final BookingRepository bookingRepository;
  private final PricingService pricingService;
  private final OccupancyService occupancyService;

  public ChatbotServiceImpl(ParkingSpotRepository parkingSpotRepository,
      BookingRepository bookingRepository,
      PricingService pricingService,
      OccupancyService occupancyService) {
    this.parkingSpotRepository = parkingSpotRepository;
    this.bookingRepository = bookingRepository;
    this.pricingService = pricingService;
    this.occupancyService = occupancyService;
  }

  @Override
  public ChatbotResponseDTO processMessage(ChatbotRequestDTO requestDTO) {
    String message = requestDTO.getMessage().toLowerCase().trim();
    Integer userId = requestDTO.getUserId();

    // Detect intent and respond
    if (matchesIntent(message, "hello", "hi", "hey", "greet", "help", "start")) {
      return handleGreeting();
    }
    if (matchesIntent(message, "available", "free", "empty", "open", "vacant", "spot")) {
      return handleAvailableSpots(message);
    }
    if (matchesIntent(message, "navigate", "direction", "find my car", "where", "location", "path", "how to reach",
        "way to")) {
      return handleNavigation(message, userId);
    }
    if (matchesIntent(message, "price", "cost", "fee", "charge", "rate", "how much", "pricing", "surge")) {
      return handlePricing();
    }
    if (matchesIntent(message, "book", "reserve", "parking")) {
      return handleBookingHelp();
    }
    if (matchesIntent(message, "my booking", "my ticket", "active booking", "status")) {
      return handleMyBookings(userId);
    }
    if (matchesIntent(message, "ev", "electric", "charging")) {
      return handleEvSpots();
    }
    if (matchesIntent(message, "occupancy", "busy", "crowd", "predict", "forecast", "rush")) {
      return handleOccupancyInfo(message);
    }
    if (matchesIntent(message, "zone", "floor", "level", "section")) {
      return handleZoneInfo(message);
    }
    if (matchesIntent(message, "cancel", "refund")) {
      return handleCancellation();
    }
    if (matchesIntent(message, "payment", "pay", "razorpay", "upi")) {
      return handlePaymentHelp();
    }
    if (matchesIntent(message, "bye", "thanks", "thank", "exit", "quit")) {
      return new ChatbotResponseDTO(
          "You're welcome! Have a great day at ParkEase! 🅿️ Drive safe!",
          "FAREWELL");
    }

    return handleUnknown();
  }

  private ChatbotResponseDTO handleGreeting() {
    long available = parkingSpotRepository.countTotalSpots() - parkingSpotRepository.countOccupiedSpots();
    String reply = "👋 Hello! Welcome to **ParkEase Assistant**!\n\n" +
        "I can help you with:\n" +
        "🔹 **Find available spots** - \"Show me available spots\"\n" +
        "🔹 **Get pricing** - \"What's the current price?\"\n" +
        "🔹 **Navigate to your spot** - \"How to reach my spot?\"\n" +
        "🔹 **Check EV spots** - \"Show EV charging spots\"\n" +
        "🔹 **View occupancy** - \"How busy is it?\"\n" +
        "🔹 **My bookings** - \"Show my active bookings\"\n" +
        "🔹 **Payment help** - \"How to pay?\"\n\n" +
        "Currently **" + available + " spots** are available. How can I help you today?";
    return new ChatbotResponseDTO(reply, "GREETING");
  }

  private ChatbotResponseDTO handleAvailableSpots(String message) {
    List<ParkingSpot> available = parkingSpotRepository.findByIsOccupiedFalse();

    if (available.isEmpty()) {
      return new ChatbotResponseDTO(
          "😔 Sorry, all parking spots are currently occupied. " +
              "I recommend checking back in 15-30 minutes or trying during off-peak hours.",
          "AVAILABILITY");
    }

    // Check if user asked for a specific zone
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
      reply.append("🅿️ Here are the available spots:\n\n");
    }

    List<Map<String, Object>> suggestions = new ArrayList<>();
    int count = 0;
    for (ParkingSpot spot : spots) {
      if (count >= 10) {
        reply.append("... and ").append(spots.size() - 10).append(" more spots available.\n");
        break;
      }
      String evTag = spot.getIsEvOnly() ? " ⚡EV" : "";
      reply.append("• **").append(spot.getSpotLabel()).append("**")
          .append(" (").append(spot.getZone()).append(")").append(evTag).append("\n");

      Map<String, Object> suggestion = new LinkedHashMap<>();
      suggestion.put("spotId", spot.getSpotId());
      suggestion.put("spotLabel", spot.getSpotLabel());
      suggestion.put("zone", spot.getZone());
      suggestion.put("isEvOnly", spot.getIsEvOnly());
      suggestions.add(suggestion);
      count++;
    }

    reply.append("\n💡 Total available: **").append(spots.size()).append(" spots**");
    reply.append("\nSay \"book\" to reserve a spot!");

    return new ChatbotResponseDTO(reply.toString(), "AVAILABILITY", suggestions);
  }

  private ChatbotResponseDTO handleNavigation(String message, Integer userId) {
    if (userId != null) {
      List<Booking> activeBookings = bookingRepository.findByUserUserIdAndStatus(userId, "ACTIVE");
      if (!activeBookings.isEmpty()) {
        Booking latest = activeBookings.get(activeBookings.size() - 1);
        ParkingSpot spot = latest.getParkingSpot();
        String nav = spot.getNavigationPath() != null ? spot.getNavigationPath()
            : "Follow the signs to " + spot.getSpotLabel();

        return new ChatbotResponseDTO(
            "🧭 **Navigation to your spot " + spot.getSpotLabel() + " (" + spot.getZone() + "):**\n\n" +
                "📍 " + nav + "\n\n" +
                "Your ticket: **" + latest.getTicketNumber() + "**\n" +
                "Vehicle: " + latest.getVehicleNumber(),
            "NAVIGATION");
      }
    }

    // Check if user mentioned a specific spot
    List<ParkingSpot> allSpots = parkingSpotRepository.findAll();
    for (ParkingSpot spot : allSpots) {
      if (message.contains(spot.getSpotLabel().toLowerCase())) {
        String nav = spot.getNavigationPath() != null ? spot.getNavigationPath()
            : "Follow the signs to " + spot.getSpotLabel();
        return new ChatbotResponseDTO(
            "🧭 **Navigation to " + spot.getSpotLabel() + " (" + spot.getZone() + "):**\n\n" +
                "📍 " + nav,
            "NAVIGATION");
      }
    }

    return new ChatbotResponseDTO(
        "🧭 I can help you navigate! Please tell me:\n" +
            "• Your spot number (e.g., \"Navigate to A1\")\n" +
            "• Or say \"Find my car\" if you have an active booking",
        "NAVIGATION");
  }

  private ChatbotResponseDTO handlePricing() {
    PricingConfig config = pricingService.getCurrentPricing();
    boolean surgeActive = pricingService.isSurgeActive();
    double occupancy = pricingService.getCurrentOccupancyPercent();

    String surgeInfo = surgeActive
        ? "🔴 **SURGE PRICING ACTIVE** (Lot is " + String.format("%.0f", occupancy) + "% full)\n" +
            "Prices are currently **" + config.getSurgeMultiplier() + "x** the base rate."
        : "🟢 **Normal pricing** (Lot is " + String.format("%.0f", occupancy) + "% full)\n" +
            "Surge kicks in at " + config.getSurgeThresholdPercent() + "% occupancy.";

    double exampleTotal = pricingService.calculateTotalFee(1);

    String reply = "💰 **ParkEase Pricing Info:**\n\n" +
        "Base price: **₹" + String.format("%.2f", config.getBasePricePerHour()) + "/hour**\n" +
        surgeInfo + "\n\n" +
        "📊 Example: 1 hour = **₹" + String.format("%.2f", exampleTotal) + "**\n" +
        "📊 Example: 3 hours = **₹" + String.format("%.2f", pricingService.calculateTotalFee(3)) + "**\n" +
        "📊 Example: 8 hours = **₹" + String.format("%.2f", pricingService.calculateTotalFee(8)) + "**";

    return new ChatbotResponseDTO(reply, "PRICING");
  }

  private ChatbotResponseDTO handleBookingHelp() {
    long available = parkingSpotRepository.countTotalSpots() - parkingSpotRepository.countOccupiedSpots();
    return new ChatbotResponseDTO(
        "📋 **How to Book a Parking Spot:**\n\n" +
            "1️⃣ Browse available spots (currently **" + available + "** available)\n" +
            "2️⃣ Select your preferred spot\n" +
            "3️⃣ Enter your vehicle number and duration\n" +
            "4️⃣ Complete payment via Razorpay\n" +
            "5️⃣ Receive your QR code ticket via email!\n\n" +
            "Use `POST /api/bookings` with your spot ID, vehicle number, and duration.\n" +
            "Say \"show available spots\" to see what's open!",
        "BOOKING_HELP");
  }

  private ChatbotResponseDTO handleMyBookings(Integer userId) {
    if (userId == null) {
      return new ChatbotResponseDTO(
          "Please log in to view your bookings. Send your user ID with the message.",
          "AUTH_REQUIRED");
    }

    List<Booking> active = bookingRepository.findByUserUserIdAndStatus(userId, "ACTIVE");
    if (active.isEmpty()) {
      return new ChatbotResponseDTO(
          "📋 You don't have any active bookings right now.\n" +
              "Say \"book\" to reserve a parking spot!",
          "MY_BOOKINGS");
    }

    StringBuilder reply = new StringBuilder("📋 **Your Active Bookings:**\n\n");
    for (Booking b : active) {
      reply.append("🎫 **").append(b.getTicketNumber()).append("**\n")
          .append("   Spot: ").append(b.getParkingSpot().getSpotLabel())
          .append(" (").append(b.getParkingSpot().getZone()).append(")\n")
          .append("   Vehicle: ").append(b.getVehicleNumber()).append("\n")
          .append("   Expires: ").append(b.getEndTime()).append("\n\n");
    }

    return new ChatbotResponseDTO(reply.toString(), "MY_BOOKINGS");
  }

  private ChatbotResponseDTO handleEvSpots() {
    List<ParkingSpot> evSpots = parkingSpotRepository.findByIsOccupiedFalseAndIsEvOnly(true);
    if (evSpots.isEmpty()) {
      return new ChatbotResponseDTO(
          "⚡ No EV charging spots are available right now. " +
              "Please check back soon or try regular spots.",
          "EV_SPOTS");
    }

    StringBuilder reply = new StringBuilder("⚡ **Available EV Charging Spots:**\n\n");
    for (ParkingSpot spot : evSpots) {
      reply.append("• **").append(spot.getSpotLabel()).append("** (").append(spot.getZone()).append(")\n");
    }
    reply.append("\nTotal EV spots available: **").append(evSpots.size()).append("**");

    return new ChatbotResponseDTO(reply.toString(), "EV_SPOTS");
  }

  private ChatbotResponseDTO handleOccupancyInfo(String message) {
    Map<String, Object> status = occupancyService.getCurrentOccupancyStatus();

    String dayOfWeek = LocalDateTime.now().getDayOfWeek().name();
    int nextHour = LocalDateTime.now().getHour() + 1;
    Map<String, Object> prediction = occupancyService.getPredictedOccupancy(dayOfWeek, nextHour);

    String reply = "📊 **Current Occupancy Status:**\n\n" +
        "Total spots: **" + status.get("totalSpots") + "**\n" +
        "Occupied: **" + status.get("occupiedSpots") + "**\n" +
        "Available: **" + status.get("availableSpots") + "**\n" +
        "Occupancy: **" + status.get("occupancyPercent") + "%**\n\n" +
        "🔮 **Prediction for next hour:**\n" +
        "Expected availability: " + prediction.get("predictedAvailable") + " spots\n" +
        "Confidence: " + prediction.get("confidence");

    return new ChatbotResponseDTO(reply, "OCCUPANCY");
  }

  private ChatbotResponseDTO handleZoneInfo(String message) {
    List<String> zones = parkingSpotRepository.findAllZones();
    if (zones.isEmpty()) {
      return new ChatbotResponseDTO("No parking zones configured yet.", "ZONE_INFO");
    }

    StringBuilder reply = new StringBuilder("🏢 **Parking Zones:**\n\n");
    for (String zone : zones) {
      long total = parkingSpotRepository.countTotalSpotsByZone(zone);
      long occupied = parkingSpotRepository.countOccupiedSpotsByZone(zone);
      long avail = total - occupied;
      reply.append("📍 **").append(zone).append("**: ")
          .append(avail).append("/").append(total).append(" available\n");
    }
    reply.append("\nSay \"available spots in [zone name]\" to see specific spots!");

    return new ChatbotResponseDTO(reply.toString(), "ZONE_INFO");
  }

  private ChatbotResponseDTO handleCancellation() {
    return new ChatbotResponseDTO(
        "❌ **How to Cancel a Booking:**\n\n" +
            "1. Go to your active bookings\n" +
            "2. Select the booking you want to cancel\n" +
            "3. Click Cancel - your spot will be freed immediately\n\n" +
            "Use `POST /api/bookings/{bookingId}/cancel` to cancel.\n" +
            "Refunds are processed within 5-7 business days.",
        "CANCELLATION");
  }

  private ChatbotResponseDTO handlePaymentHelp() {
    return new ChatbotResponseDTO(
        "💳 **Payment Options at ParkEase:**\n\n" +
            "We accept payments via **Razorpay** which supports:\n" +
            "• 💳 Credit/Debit Cards (Visa, Mastercard, RuPay)\n" +
            "• 📱 UPI (Google Pay, PhonePe, Paytm)\n" +
            "• 🏦 Net Banking\n" +
            "• 👛 Wallets\n\n" +
            "**Steps:**\n" +
            "1. Create a booking\n" +
            "2. Initiate payment via `POST /api/payments/create-order`\n" +
            "3. Complete on Razorpay checkout\n" +
            "4. Verify via `POST /api/payments/verify`\n\n" +
            "All transactions are secure and encrypted! 🔒",
        "PAYMENT_HELP");
  }

  private ChatbotResponseDTO handleUnknown() {
    return new ChatbotResponseDTO(
        "🤔 I'm not sure I understand. Here's what I can help with:\n\n" +
            "• \"Available spots\" - Find parking\n" +
            "• \"Pricing\" - Check current rates\n" +
            "• \"Navigate to [spot]\" - Get directions\n" +
            "• \"My bookings\" - View your bookings\n" +
            "• \"EV spots\" - Electric vehicle spots\n" +
            "• \"How busy\" - Occupancy info\n" +
            "• \"Zones\" - Zone information\n" +
            "• \"Payment\" - Payment help\n\n" +
            "Try asking one of these! 😊",
        "UNKNOWN");
  }

  private boolean matchesIntent(String message, String... keywords) {
    for (String keyword : keywords) {
      if (message.contains(keyword)) {
        return true;
      }
    }
    return false;
  }
}
