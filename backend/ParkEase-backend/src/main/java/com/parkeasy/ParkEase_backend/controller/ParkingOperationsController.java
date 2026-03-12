package com.parkeasy.ParkEase_backend.controller;

import com.parkeasy.ParkEase_backend.dto.ParkingBookingRequest;
import com.parkeasy.ParkEase_backend.dto.PaymentUpdateRequest;
import com.parkeasy.ParkEase_backend.entity.ParkingBooking;
import com.parkeasy.ParkEase_backend.entity.ParkingSlot;
import com.parkeasy.ParkEase_backend.service.ParkingOperationsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/parking")
public class ParkingOperationsController {

	private final ParkingOperationsService parkingOperationsService;

	public ParkingOperationsController(ParkingOperationsService parkingOperationsService) {
		this.parkingOperationsService = parkingOperationsService;
	}

	@GetMapping("/slots")
	public ResponseEntity<List<ParkingSlot>> getSlots() {
		return ResponseEntity.ok(parkingOperationsService.getSlots());
	}

	@GetMapping("/bookings")
	public ResponseEntity<List<ParkingBooking>> getBookings() {
		return ResponseEntity.ok(parkingOperationsService.getBookings());
	}

	@PostMapping("/bookings")
	public ResponseEntity<ParkingBooking> createBooking(@Valid @RequestBody ParkingBookingRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(parkingOperationsService.createBooking(request));
	}

	@PutMapping("/bookings/{bookingId}/payment")
	public ResponseEntity<ParkingBooking> updatePayment(@PathVariable Long bookingId,
			@Valid @RequestBody PaymentUpdateRequest request) {
		return ResponseEntity.ok(parkingOperationsService.markBookingPaid(bookingId, request.getPaymentMethod()));
	}
}
