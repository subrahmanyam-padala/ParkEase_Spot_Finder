package com.parkeasy.ParkEase_backend.serviceImpl;

import com.parkeasy.ParkEase_backend.dto.BookingRequestDTO;
import com.parkeasy.ParkEase_backend.dto.BookingResponseDTO;
import com.parkeasy.ParkEase_backend.entity.Booking;
import com.parkeasy.ParkEase_backend.entity.ParkingSpot;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.repository.BookingRepository;
import com.parkeasy.ParkEase_backend.repository.ParkingSpotRepository;
import com.parkeasy.ParkEase_backend.repository.UsersRepository;
import com.parkeasy.ParkEase_backend.service.BookingService;
import com.parkeasy.ParkEase_backend.service.EmailService;
import com.parkeasy.ParkEase_backend.service.PricingService;
import com.parkeasy.ParkEase_backend.service.QrCodeService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class BookingServiceImpl implements BookingService {

  private final BookingRepository bookingRepository;
  private final ParkingSpotRepository parkingSpotRepository;
  private final UsersRepository usersRepository;
  private final PricingService pricingService;
  private final QrCodeService qrCodeService;
  private final EmailService emailService;

  public BookingServiceImpl(BookingRepository bookingRepository,
      ParkingSpotRepository parkingSpotRepository,
      UsersRepository usersRepository,
      PricingService pricingService,
      QrCodeService qrCodeService,
      EmailService emailService) {
    this.bookingRepository = bookingRepository;
    this.parkingSpotRepository = parkingSpotRepository;
    this.usersRepository = usersRepository;
    this.pricingService = pricingService;
    this.qrCodeService = qrCodeService;
    this.emailService = emailService;
  }

  @Override
  @Transactional
  public BookingResponseDTO createBooking(Integer userId, BookingRequestDTO requestDTO) {
    // 1. Validate user
    Users user = usersRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

    // 2. Validate and lock parking spot
    ParkingSpot spot = parkingSpotRepository.findById(requestDTO.getSpotId())
        .orElseThrow(() -> new RuntimeException("Parking spot not found with ID: " + requestDTO.getSpotId()));

    if (spot.getIsOccupied()) {
      throw new RuntimeException("Parking spot " + spot.getSpotLabel() + " is already occupied");
    }

    // 3. Check for conflicting bookings (double-booking prevention)
    LocalDateTime startTime = LocalDateTime.now();
    LocalDateTime endTime = startTime.plusHours(requestDTO.getDurationHours());
    List<Booking> conflicts = bookingRepository.findConflictingBookings(
        spot.getSpotId(), startTime, endTime);
    if (!conflicts.isEmpty()) {
      throw new RuntimeException("Conflicting booking exists for spot " + spot.getSpotLabel());
    }

    // 4. Calculate pricing with dynamic surge
    double baseFee = pricingService.calculateBaseFee(requestDTO.getDurationHours());
    double surgeFee = pricingService.calculateSurgeFee(baseFee);
    double totalAmount = baseFee + surgeFee;

    // 5. Generate ticket number
    String ticketNumber = "PKE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

    // 6. Create booking
    Booking booking = new Booking();
    booking.setUser(user);
    booking.setParkingSpot(spot);
    booking.setVehicleNumber(requestDTO.getVehicleNumber());
    booking.setTicketNumber(ticketNumber);
    booking.setStartTime(startTime);
    booking.setEndTime(endTime);
    booking.setBaseFee(baseFee);
    booking.setSurgeFee(surgeFee);
    booking.setTotalAmount(totalAmount);
    booking.setStatus("ACTIVE");

    // 7. Mark spot as occupied
    spot.setIsOccupied(true);
    parkingSpotRepository.save(spot);

    // 8. Save booking
    Booking savedBooking = bookingRepository.save(booking);

    // 9. Generate QR code and upload to Drive (async-safe)
    try {
      String qrCodeUrl = qrCodeService.generateAndUploadQrCode(
          user.getEmail(),
          ticketNumber,
          user.getFullName(),
          requestDTO.getVehicleNumber(),
          spot.getSpotLabel(),
          spot.getZone(),
          startTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
          endTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
          totalAmount);

      savedBooking.setQrCodeUrl(qrCodeUrl);
      savedBooking = bookingRepository.save(savedBooking);
    } catch (Exception e) {
      System.err.println("[BookingService] QR generation failed: " + e.getMessage());
    }

    // NOTE: QR ticket email is sent only after successful payment (see
    // PaymentServiceImpl)

    return toResponseDTO(savedBooking);
  }

  @Override
  public BookingResponseDTO getBookingById(Long bookingId) {
    Booking booking = bookingRepository.findById(bookingId)
        .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
    return toResponseDTO(booking);
  }

  @Override
  public BookingResponseDTO getBookingByTicketNumber(String ticketNumber) {
    Booking booking = bookingRepository.findByTicketNumber(ticketNumber)
        .orElseThrow(() -> new RuntimeException("Booking not found with ticket: " + ticketNumber));
    return toResponseDTO(booking);
  }

  @Override
  public List<BookingResponseDTO> getBookingsByUserId(Integer userId) {
    return bookingRepository.findByUserUserId(userId).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Override
  public List<BookingResponseDTO> getActiveBookingsByUserId(Integer userId) {
    return bookingRepository.findByUserUserIdAndStatus(userId, "ACTIVE").stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Override
  public List<BookingResponseDTO> getAllActiveBookings() {
    return bookingRepository.findByStatus("ACTIVE").stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Override
  @Transactional
  public BookingResponseDTO completeBooking(Long bookingId) {
    Booking booking = bookingRepository.findById(bookingId)
        .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

    if (!"ACTIVE".equals(booking.getStatus())) {
      throw new RuntimeException("Booking is not active. Current status: " + booking.getStatus());
    }

    booking.setStatus("COMPLETED");
    booking.setEndTime(LocalDateTime.now());

    // Free up the parking spot
    ParkingSpot spot = booking.getParkingSpot();
    spot.setIsOccupied(false);
    parkingSpotRepository.save(spot);

    Booking saved = bookingRepository.save(booking);
    return toResponseDTO(saved);
  }

  @Override
  @Transactional
  public BookingResponseDTO cancelBooking(Long bookingId) {
    Booking booking = bookingRepository.findById(bookingId)
        .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

    if (!"ACTIVE".equals(booking.getStatus())) {
      throw new RuntimeException("Booking is not active. Current status: " + booking.getStatus());
    }

    booking.setStatus("CANCELLED");

    // Free up the parking spot
    ParkingSpot spot = booking.getParkingSpot();
    spot.setIsOccupied(false);
    parkingSpotRepository.save(spot);

    Booking saved = bookingRepository.save(booking);
    return toResponseDTO(saved);
  }

  @Override
  @Scheduled(fixedRate = 300000) // Every 5 minutes
  @Transactional
  public void autoCompleteExpiredBookings() {
    List<Booking> expiredBookings = bookingRepository.findExpiredActiveBookings(LocalDateTime.now());
    for (Booking booking : expiredBookings) {
      booking.setStatus("COMPLETED");
      ParkingSpot spot = booking.getParkingSpot();
      spot.setIsOccupied(false);
      parkingSpotRepository.save(spot);
      bookingRepository.save(booking);
      System.out.println("[BookingService] Auto-completed expired booking: " + booking.getTicketNumber());
    }
  }

  private BookingResponseDTO toResponseDTO(Booking booking) {
    BookingResponseDTO dto = new BookingResponseDTO();
    dto.setBookingId(booking.getBookingId());
    dto.setTicketNumber(booking.getTicketNumber());
    dto.setSpotLabel(booking.getParkingSpot().getSpotLabel());
    dto.setZone(booking.getParkingSpot().getZone());
    dto.setVehicleNumber(booking.getVehicleNumber());
    dto.setStartTime(booking.getStartTime());
    dto.setEndTime(booking.getEndTime());
    dto.setBaseFee(booking.getBaseFee());
    dto.setSurgeFee(booking.getSurgeFee());
    dto.setTotalAmount(booking.getTotalAmount());
    dto.setStatus(booking.getStatus());
    dto.setOverstayFee(booking.getOverstayFee());
    dto.setCheckedInTime(booking.getCheckedInTime());
    dto.setQrCodeUrl(booking.getQrCodeUrl());
    dto.setNavigationPath(booking.getParkingSpot().getNavigationPath());
    dto.setUserName(booking.getUser().getFullName());
    dto.setUserEmail(booking.getUser().getEmail());
    return dto;
  }

  private String buildTicketEmailBody(Booking booking, ParkingSpot spot, Users user) {
    return """
        <html>
        <body style="font-family: Arial, sans-serif; background: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #1e3c72, #2a5298); padding: 25px; text-align: center; color: #fff;">
            <h1 style="margin: 0;">🅿️ ParkEase</h1>
            <p>Booking Confirmation</p>
          </div>
          <div style="padding: 25px;">
            <h2>Hello, %s!</h2>
            <p>Your parking spot has been booked successfully.</p>
            <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Ticket No</td><td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Spot</td><td style="padding: 10px; border-bottom: 1px solid #eee;">%s (%s)</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Vehicle</td><td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Start Time</td><td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">End Time</td><td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Total Amount</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #27ae60; font-weight: bold;">₹%.2f</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Navigation</td><td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td></tr>
            </table>
            %s
            <p style="color: #888; font-size: 12px; margin-top: 20px;">This is an automated message from ParkEase. Do not reply.</p>
          </div>
        </div>
        </body>
        </html>
        """
        .formatted(
            user.getFullName(),
            booking.getTicketNumber(),
            spot.getSpotLabel(), spot.getZone(),
            booking.getVehicleNumber(),
            booking.getStartTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")),
            booking.getEndTime() != null
                ? booking.getEndTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                : "N/A",
            booking.getTotalAmount(),
            spot.getNavigationPath() != null ? spot.getNavigationPath() : "Follow signs to " + spot.getSpotLabel(),
            "<div style='text-align: center; margin: 20px 0;'>"
                + "<p style='font-weight: bold; color: #1e3c72;'>Your QR Ticket</p>"
                + "<img src='cid:qrcode_image' alt='QR Code' style='width: 200px; height: 200px; border: 2px solid #2a5298; border-radius: 8px;' />"
                + "<p style='color: #888; font-size: 12px;'>Show this QR code at the parking entrance</p>"
                + "</div>");
  }
}
