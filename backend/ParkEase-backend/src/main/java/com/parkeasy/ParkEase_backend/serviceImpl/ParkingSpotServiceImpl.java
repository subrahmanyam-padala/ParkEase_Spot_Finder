package com.parkeasy.ParkEase_backend.serviceImpl;

import com.parkeasy.ParkEase_backend.dto.ParkingSpotRequestDTO;
import com.parkeasy.ParkEase_backend.dto.ParkingSpotResponseDTO;
import com.parkeasy.ParkEase_backend.entity.ParkingSpot;
import com.parkeasy.ParkEase_backend.repository.ParkingSpotRepository;
import com.parkeasy.ParkEase_backend.service.ParkingSpotService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ParkingSpotServiceImpl implements ParkingSpotService {

  private final ParkingSpotRepository parkingSpotRepository;

  public ParkingSpotServiceImpl(ParkingSpotRepository parkingSpotRepository) {
    this.parkingSpotRepository = parkingSpotRepository;
  }

  @Override
  public List<ParkingSpotResponseDTO> getAllSpots() {
    return parkingSpotRepository.findAll().stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Override
  public ParkingSpotResponseDTO getSpotById(Long spotId) {
    ParkingSpot spot = parkingSpotRepository.findById(spotId)
        .orElseThrow(() -> new RuntimeException("Parking spot not found with ID: " + spotId));
    return toResponseDTO(spot);
  }

  @Override
  public List<ParkingSpotResponseDTO> getAvailableSpots() {
    return parkingSpotRepository.findByIsOccupiedFalse().stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Override
  public List<ParkingSpotResponseDTO> getAvailableSpotsByZone(String zone) {
    return parkingSpotRepository.findByZoneAndIsOccupiedFalse(zone).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Override
  public List<ParkingSpotResponseDTO> getAvailableEvSpots() {
    return parkingSpotRepository.findByIsOccupiedFalseAndIsEvOnly(true).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Override
  @Transactional
  public ParkingSpotResponseDTO createSpot(ParkingSpotRequestDTO requestDTO) {
    ParkingSpot spot = new ParkingSpot();
    spot.setSpotLabel(requestDTO.getSpotLabel());
    spot.setZone(requestDTO.getZone());
    spot.setIsEvOnly(requestDTO.getIsEvOnly() != null ? requestDTO.getIsEvOnly() : false);
    spot.setNavigationPath(requestDTO.getNavigationPath());
    spot.setIsOccupied(false);
    ParkingSpot saved = parkingSpotRepository.save(spot);
    return toResponseDTO(saved);
  }

  @Override
  @Transactional
  public ParkingSpotResponseDTO updateSpot(Long spotId, ParkingSpotRequestDTO requestDTO) {
    ParkingSpot spot = parkingSpotRepository.findById(spotId)
        .orElseThrow(() -> new RuntimeException("Parking spot not found with ID: " + spotId));
    spot.setSpotLabel(requestDTO.getSpotLabel());
    spot.setZone(requestDTO.getZone());
    if (requestDTO.getIsEvOnly() != null) {
      spot.setIsEvOnly(requestDTO.getIsEvOnly());
    }
    if (requestDTO.getNavigationPath() != null) {
      spot.setNavigationPath(requestDTO.getNavigationPath());
    }
    ParkingSpot saved = parkingSpotRepository.save(spot);
    return toResponseDTO(saved);
  }

  @Override
  @Transactional
  public void toggleOccupancy(Long spotId, boolean occupied) {
    ParkingSpot spot = parkingSpotRepository.findById(spotId)
        .orElseThrow(() -> new RuntimeException("Parking spot not found with ID: " + spotId));
    spot.setIsOccupied(occupied);
    parkingSpotRepository.save(spot);
  }

  @Override
  @Transactional
  public void deleteSpot(Long spotId) {
    if (!parkingSpotRepository.existsById(spotId)) {
      throw new RuntimeException("Parking spot not found with ID: " + spotId);
    }
    parkingSpotRepository.deleteById(spotId);
  }

  @Override
  public Map<String, Object> getOccupancyStats() {
    long total = parkingSpotRepository.countTotalSpots();
    long occupied = parkingSpotRepository.countOccupiedSpots();
    long available = total - occupied;
    double occupancyPercent = total > 0 ? (double) occupied / total * 100 : 0;

    Map<String, Object> stats = new LinkedHashMap<>();
    stats.put("totalSpots", total);
    stats.put("occupiedSpots", occupied);
    stats.put("availableSpots", available);
    stats.put("occupancyPercent", Math.round(occupancyPercent * 100.0) / 100.0);

    // Zone-wise breakdown
    List<Map<String, Object>> zoneStats = new ArrayList<>();
    List<String> zones = parkingSpotRepository.findAllZones();
    for (String zone : zones) {
      long zoneTotal = parkingSpotRepository.countTotalSpotsByZone(zone);
      long zoneOccupied = parkingSpotRepository.countOccupiedSpotsByZone(zone);
      Map<String, Object> zoneStat = new LinkedHashMap<>();
      zoneStat.put("zone", zone);
      zoneStat.put("total", zoneTotal);
      zoneStat.put("occupied", zoneOccupied);
      zoneStat.put("available", zoneTotal - zoneOccupied);
      zoneStats.add(zoneStat);
    }
    stats.put("zoneBreakdown", zoneStats);

    return stats;
  }

  @Override
  public List<String> getAllZones() {
    return parkingSpotRepository.findAllZones();
  }

  private ParkingSpotResponseDTO toResponseDTO(ParkingSpot spot) {
    return new ParkingSpotResponseDTO(
        spot.getSpotId(),
        spot.getSpotLabel(),
        spot.getZone(),
        spot.getIsOccupied(),
        spot.getIsEvOnly(),
        spot.getNavigationPath(),
        spot.getPricePerHour());
  }
}
