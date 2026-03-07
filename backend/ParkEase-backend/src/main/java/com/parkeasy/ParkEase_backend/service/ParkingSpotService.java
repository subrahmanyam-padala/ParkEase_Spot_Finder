package com.parkeasy.ParkEase_backend.service;

import com.parkeasy.ParkEase_backend.dto.ParkingSpotRequestDTO;
import com.parkeasy.ParkEase_backend.dto.ParkingSpotResponseDTO;

import java.util.List;
import java.util.Map;

public interface ParkingSpotService {

  List<ParkingSpotResponseDTO> getAllSpots();

  ParkingSpotResponseDTO getSpotById(Long spotId);

  List<ParkingSpotResponseDTO> getAvailableSpots();

  List<ParkingSpotResponseDTO> getAvailableSpotsByZone(String zone);

  List<ParkingSpotResponseDTO> getAvailableEvSpots();

  ParkingSpotResponseDTO createSpot(ParkingSpotRequestDTO requestDTO);

  ParkingSpotResponseDTO updateSpot(Long spotId, ParkingSpotRequestDTO requestDTO);

  void toggleOccupancy(Long spotId, boolean occupied);

  void deleteSpot(Long spotId);

  Map<String, Object> getOccupancyStats();

  List<String> getAllZones();
}
