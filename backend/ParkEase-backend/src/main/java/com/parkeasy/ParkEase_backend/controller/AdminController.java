package com.parkeasy.ParkEase_backend.controller;

import com.parkeasy.ParkEase_backend.dto.PricingConfigDTO;
import com.parkeasy.ParkEase_backend.entity.OccupancyHistory;
import com.parkeasy.ParkEase_backend.entity.PricingConfig;
import com.parkeasy.ParkEase_backend.service.OccupancyService;
import com.parkeasy.ParkEase_backend.service.PricingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

	private final PricingService pricingService;
	private final OccupancyService occupancyService;

	public AdminController(PricingService pricingService, OccupancyService occupancyService) {
		this.pricingService = pricingService;
		this.occupancyService = occupancyService;
	}

	// --- PRICING ---

	@GetMapping("/pricing")
	public ResponseEntity<PricingConfig> getCurrentPricing() {
		return ResponseEntity.ok(pricingService.getCurrentPricing());
	}

	@PutMapping("/pricing")
	public ResponseEntity<PricingConfig> updatePricing(@Valid @RequestBody PricingConfigDTO dto) {
		return ResponseEntity.ok(pricingService.updatePricing(dto));
	}

	@GetMapping("/pricing/surge-status")
	public ResponseEntity<Map<String, Object>> getSurgeStatus() {
		return ResponseEntity.ok(Map.of("surgeActive", pricingService.isSurgeActive(), "occupancyPercent",
				pricingService.getCurrentOccupancyPercent(), "surgeThreshold",
				pricingService.getCurrentPricing().getSurgeThresholdPercent(), "surgeMultiplier",
				pricingService.getCurrentPricing().getSurgeMultiplier()));
	}

	@GetMapping("/pricing/calculate")
	public ResponseEntity<Map<String, Object>> calculatePrice(@RequestParam int hours) {
		double baseFee = pricingService.calculateBaseFee(hours);
		double surgeFee = pricingService.calculateSurgeFee(baseFee);
		double total = baseFee + surgeFee;
		return ResponseEntity.ok(Map.of("hours", hours, "baseFee", baseFee, "surgeFee", surgeFee, "totalFee", total,
				"surgeActive", pricingService.isSurgeActive()));
	}

	// --- OCCUPANCY ---

	@GetMapping("/occupancy/current")
	public ResponseEntity<Map<String, Object>> getCurrentOccupancy() {
		return ResponseEntity.ok(occupancyService.getCurrentOccupancyStatus());
	}

	@GetMapping("/occupancy/history")
	public ResponseEntity<List<OccupancyHistory>> getRecentHistory() {
		return ResponseEntity.ok(occupancyService.getRecentHistory());
	}

	@GetMapping("/occupancy/history/{dayOfWeek}")
	public ResponseEntity<List<OccupancyHistory>> getHistoryByDay(@PathVariable String dayOfWeek) {
		return ResponseEntity.ok(occupancyService.getHistoryByDayOfWeek(dayOfWeek));
	}

	@GetMapping("/occupancy/predict")
	public ResponseEntity<Map<String, Object>> predictOccupancy(@RequestParam String dayOfWeek,
			@RequestParam int hour) {
		return ResponseEntity.ok(occupancyService.getPredictedOccupancy(dayOfWeek, hour));
	}

	@PostMapping("/occupancy/record")
	public ResponseEntity<Map<String, String>> recordNow() {
		occupancyService.recordCurrentOccupancy();
		return ResponseEntity.ok(Map.of("message", "Occupancy recorded successfully"));
	}
}
