package com.parkeasy.ParkEase_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkeasy.ParkEase_backend.dto.AdminOverviewResponse;
import com.parkeasy.ParkEase_backend.dto.ParkingSlotRequest;
import com.parkeasy.ParkEase_backend.entity.AdminAlert;
import com.parkeasy.ParkEase_backend.entity.AdminUser;
import com.parkeasy.ParkEase_backend.entity.ParkingSlot;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.service.AdminManagementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminManagementController {

	private final AdminManagementService adminManagementService;

	public AdminManagementController(AdminManagementService adminManagementService) {
		this.adminManagementService = adminManagementService;
	}

	@GetMapping("/overview")
	public ResponseEntity<AdminOverviewResponse> getOverview() {
		return ResponseEntity.ok(adminManagementService.getOverview());
	}

	@GetMapping("/slots")
	public ResponseEntity<List<ParkingSlot>> getSlots() {
		return ResponseEntity.ok(adminManagementService.getAllSlots());
	}

	@PostMapping("/slots")
	public ResponseEntity<ParkingSlot> createSlot(@Valid @RequestBody ParkingSlotRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(adminManagementService.createSlot(request));
	}

	@PutMapping("/slots/{slotId}")
	public ResponseEntity<ParkingSlot> updateSlot(@PathVariable("slotId") Long slotId,
			@Valid @RequestBody ParkingSlotRequest request) {
		return ResponseEntity.ok(adminManagementService.updateSlot(slotId, request));
	}

	@GetMapping("/bookings")
	public ResponseEntity<List<Map<String, Object>>> getBookings() {
		return ResponseEntity.ok(adminManagementService.getAllBookings());
	}

	@GetMapping("/users")
	public ResponseEntity<List<Users>> getUsers() {
		return ResponseEntity.ok(adminManagementService.getAllUsers());
	}

	@GetMapping("/admin-users")
	public ResponseEntity<List<AdminUser>> getAdminUsers() {
		return ResponseEntity.ok(adminManagementService.getAllAdminUsers());
	}

	@GetMapping("/revenue")
	public ResponseEntity<Map<String, Object>> getRevenue() {
		return ResponseEntity.ok(adminManagementService.getRevenueSummary());
	}

	@GetMapping("/reports")
	public ResponseEntity<Map<String, Object>> getReports() {
		return ResponseEntity.ok(adminManagementService.getReportsSummary());
	}

	@GetMapping("/alerts")
	public ResponseEntity<List<AdminAlert>> getAlerts() {
		return ResponseEntity.ok(adminManagementService.getActiveAlerts());
	}

	@DeleteMapping("/alerts/{alertId}")
	public ResponseEntity<Map<String, String>> dismissAlert(@PathVariable("alertId") Long alertId) {
		adminManagementService.dismissAlert(alertId);
		return ResponseEntity.ok(Map.of("message", "Alert dismissed"));
	}
}
