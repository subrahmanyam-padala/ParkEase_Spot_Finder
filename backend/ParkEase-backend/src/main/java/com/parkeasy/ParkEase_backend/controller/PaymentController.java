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

  @PostMapping("/create-overstay-order")
  public ResponseEntity<?> createOverstayPaymentOrder(Authentication authentication,
      @Valid @RequestBody PaymentRequestDTO requestDTO) {
    try {
      Integer userId = getUserIdFromAuth(authentication);
      PaymentResponseDTO response = paymentService.createOverstayPaymentOrder(userId, requestDTO);
      return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/create-extension-order")
  public ResponseEntity<?> createExtensionPaymentOrder(Authentication authentication,
      @Valid @RequestBody PaymentRequestDTO requestDTO) {
    try {
      Integer userId = getUserIdFromAuth(authentication);
      PaymentResponseDTO response = paymentService.createExtensionPaymentOrder(userId, requestDTO);
      return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    }
  }

  // Fallback route so action-like POST paths are never mistaken for /{paymentId}
  // lookups.
  @PostMapping("/{action}")
  public ResponseEntity<?> createPaymentAction(Authentication authentication,
      @PathVariable("action") String action,
      @Valid @RequestBody PaymentRequestDTO requestDTO) {
    try {
      Integer userId = getUserIdFromAuth(authentication);
      String normalized = action == null ? "" : action.trim().toLowerCase();
      if ("create-order".equals(normalized)) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPaymentOrder(userId, requestDTO));
      }
      if ("create-overstay-order".equals(normalized)) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(paymentService.createOverstayPaymentOrder(userId, requestDTO));
      }
      if ("create-extension-order".equals(normalized)) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(paymentService.createExtensionPaymentOrder(userId, requestDTO));
      }
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("error", "Unknown payment action: " + action));
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
