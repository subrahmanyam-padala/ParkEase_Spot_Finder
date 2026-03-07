package com.parkeasy.ParkEase_backend.repository;

import com.parkeasy.ParkEase_backend.entity.ParkingSpot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {

  Optional<ParkingSpot> findBySpotLabel(String spotLabel);

  List<ParkingSpot> findByIsOccupiedFalse();

  List<ParkingSpot> findByIsOccupiedTrue();

  List<ParkingSpot> findByZone(String zone);

  List<ParkingSpot> findByIsOccupiedFalseAndIsEvOnly(Boolean isEvOnly);

  List<ParkingSpot> findByZoneAndIsOccupiedFalse(String zone);

  @Query("SELECT COUNT(p) FROM ParkingSpot p WHERE p.isOccupied = true")
  long countOccupiedSpots();

  @Query("SELECT COUNT(p) FROM ParkingSpot p")
  long countTotalSpots();

  @Query("SELECT DISTINCT p.zone FROM ParkingSpot p")
  List<String> findAllZones();

  @Query("SELECT COUNT(p) FROM ParkingSpot p WHERE p.zone = :zone AND p.isOccupied = true")
  long countOccupiedSpotsByZone(String zone);

  @Query("SELECT COUNT(p) FROM ParkingSpot p WHERE p.zone = :zone")
  long countTotalSpotsByZone(String zone);
}
