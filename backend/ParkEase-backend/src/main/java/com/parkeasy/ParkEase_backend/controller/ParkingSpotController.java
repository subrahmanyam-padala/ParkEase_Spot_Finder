package com.parkeasy.ParkEase_backend.controller;

import com.parkeasy.ParkEase_backend.dto.ParkingSpotRequestDTO;
import com.parkeasy.ParkEase_backend.dto.ParkingSpotResponseDTO;
import com.parkeasy.ParkEase_backend.service.ParkingSpotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/spots")
@CrossOrigin(origins = "*")
public class ParkingSpotController {

  private final ParkingSpotService parkingSpotService;

  public ParkingSpotController(ParkingSpotService parkingSpotService) {
    this.parkingSpotService = parkingSpotService;
  }

  @GetMapping
  public ResponseEntity<List<ParkingSpotResponseDTO>> getAllSpots() {
    return ResponseEntity.ok(parkingSpotService.getAllSpots());
  }

  @GetMapping("/{spotId}")
  public ResponseEntity<ParkingSpotResponseDTO> getSpotById(@PathVariable Long spotId) {
    return ResponseEntity.ok(parkingSpotService.getSpotById(spotId));
  }

  @GetMapping("/available")
  public ResponseEntity<List<ParkingSpotResponseDTO>> getAvailableSpots() {
    return ResponseEntity.ok(parkingSpotService.getAvailableSpots());
  }

  @GetMapping("/available/zone/{zone}")
  public ResponseEntity<List<ParkingSpotResponseDTO>> getAvailableSpotsByZone(@PathVariable String zone) {
    return ResponseEntity.ok(parkingSpotService.getAvailableSpotsByZone(zone));
  }

  @GetMapping("/available/ev")
  public ResponseEntity<List<ParkingSpotResponseDTO>> getAvailableEvSpots() {
    return ResponseEntity.ok(parkingSpotService.getAvailableEvSpots());
  }

  @GetMapping("/zones")
  public ResponseEntity<List<String>> getAllZones() {
    return ResponseEntity.ok(parkingSpotService.getAllZones());
  }

  @GetMapping("/stats")
  public ResponseEntity<Map<String, Object>> getOccupancyStats() {
    return ResponseEntity.ok(parkingSpotService.getOccupancyStats());
  }

  // --- ADMIN ENDPOINTS ---

  @PostMapping
  public ResponseEntity<ParkingSpotResponseDTO> createSpot(@Valid @RequestBody ParkingSpotRequestDTO requestDTO) {
    return ResponseEntity.status(HttpStatus.CREATED).body(parkingSpotService.createSpot(requestDTO));
  }

  @PutMapping("/{spotId}")
  public ResponseEntity<ParkingSpotResponseDTO> updateSpot(@PathVariable Long spotId,
      @Valid @RequestBody ParkingSpotRequestDTO requestDTO) {
    return ResponseEntity.ok(parkingSpotService.updateSpot(spotId, requestDTO));
  }

  @PatchMapping("/{spotId}/occupancy")
  public ResponseEntity<Map<String, String>> toggleOccupancy(@PathVariable Long spotId,
      @RequestParam boolean occupied) {
    parkingSpotService.toggleOccupancy(spotId, occupied);
    return ResponseEntity.ok(Map.of("message", "Spot occupancy updated to " + occupied));
  }

  @DeleteMapping("/{spotId}")
  public ResponseEntity<Map<String, String>> deleteSpot(@PathVariable Long spotId) {
    parkingSpotService.deleteSpot(spotId);
    return ResponseEntity.ok(Map.of("message", "Parking spot deleted successfully"));
  }
}
