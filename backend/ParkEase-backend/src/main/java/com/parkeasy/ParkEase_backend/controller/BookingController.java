package com.parkeasy.ParkEase_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkeasy.ParkEase_backend.dto.BookingRequestDTO;
import com.parkeasy.ParkEase_backend.dto.BookingResponseDTO;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.repository.UsersRepository;
import com.parkeasy.ParkEase_backend.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

  private final BookingService bookingService;
  private final UsersRepository usersRepository;

  public BookingController(BookingService bookingService, UsersRepository usersRepository) {
    this.bookingService = bookingService;
    this.usersRepository = usersRepository;
  }

  @PostMapping
  public ResponseEntity<?> createBooking(Authentication authentication,
      @Valid @RequestBody BookingRequestDTO requestDTO) {
    try {
      Integer userId = getUserIdFromAuth(authentication);
      BookingResponseDTO response = bookingService.createBooking(userId, requestDTO);
      return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/{bookingId}")
  public ResponseEntity<?> getBookingById(@PathVariable("bookingId") Long bookingId) {
    try {
      return ResponseEntity.ok(bookingService.getBookingById(bookingId));
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/ticket/{ticketNumber}")
  public ResponseEntity<?> getBookingByTicket(@PathVariable("ticketNumber") String ticketNumber) {
    try {
      return ResponseEntity.ok(bookingService.getBookingByTicketNumber(ticketNumber));
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/my-bookings")
  public ResponseEntity<List<BookingResponseDTO>> getMyBookings(Authentication authentication) {
    Integer userId = getUserIdFromAuth(authentication);
    return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
  }

  @GetMapping("/my-bookings/active")
  public ResponseEntity<List<BookingResponseDTO>> getMyActiveBookings(Authentication authentication) {
    Integer userId = getUserIdFromAuth(authentication);
    return ResponseEntity.ok(bookingService.getActiveBookingsByUserId(userId));
  }

  @GetMapping("/active")
  public ResponseEntity<List<BookingResponseDTO>> getAllActiveBookings() {
    return ResponseEntity.ok(bookingService.getAllActiveBookings());
  }

  @PostMapping("/{bookingId}/complete")
  public ResponseEntity<?> completeBooking(@PathVariable("bookingId") Long bookingId) {
    try {
      return ResponseEntity.ok(bookingService.completeBooking(bookingId));
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/{bookingId}/cancel")
  public ResponseEntity<?> cancelBooking(@PathVariable("bookingId") Long bookingId) {
    try {
      return ResponseEntity.ok(bookingService.cancelBooking(bookingId));
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    }
  }

  private Integer getUserIdFromAuth(Authentication authentication) {
    String username = authentication.getName();
    Users user = usersRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found: " + username));
    return user.getUserId();
  }
}
