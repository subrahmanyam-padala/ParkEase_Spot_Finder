package com.parkeasy.ParkEase_backend.controller;

import com.parkeasy.ParkEase_backend.dto.PaymentRequestDTO;
import com.parkeasy.ParkEase_backend.dto.PaymentResponseDTO;
import com.parkeasy.ParkEase_backend.dto.PaymentVerifyDTO;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.repository.UsersRepository;
import com.parkeasy.ParkEase_backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

  private final PaymentService paymentService;
  private final UsersRepository usersRepository;

  public PaymentController(PaymentService paymentService, UsersRepository usersRepository) {
    this.paymentService = paymentService;
    this.usersRepository = usersRepository;
  }

  @PostMapping("/create-order")
  public ResponseEntity<?> createPaymentOrder(Authentication authentication,
      @Valid @RequestBody PaymentRequestDTO requestDTO) {
    try {
      Integer userId = getUserIdFromAuth(authentication);
      PaymentResponseDTO response = paymentService.createPaymentOrder(userId, requestDTO);
      return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/verify")
  public ResponseEntity<?> verifyPayment(@Valid @RequestBody PaymentVerifyDTO verifyDTO) {
    try {
      PaymentResponseDTO response = paymentService.verifyPayment(verifyDTO);
      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/my-payments")
  public ResponseEntity<List<PaymentResponseDTO>> getMyPayments(Authentication authentication) {
    Integer userId = getUserIdFromAuth(authentication);
    return ResponseEntity.ok(paymentService.getPaymentsByUserId(userId));
  }

  @GetMapping("/booking/{bookingId}")
  public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByBooking(@PathVariable Long bookingId) {
    return ResponseEntity.ok(paymentService.getPaymentsByBookingId(bookingId));
  }

  @GetMapping("/{paymentId}")
  public ResponseEntity<?> getPaymentById(@PathVariable Long paymentId) {
    try {
      return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
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
