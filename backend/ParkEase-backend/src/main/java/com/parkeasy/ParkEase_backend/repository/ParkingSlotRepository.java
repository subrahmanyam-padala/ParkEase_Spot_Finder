package com.parkeasy.ParkEase_backend.repository;

import com.parkeasy.ParkEase_backend.entity.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

	Optional<ParkingSlot> findByNumber(String number);

	boolean existsByNumber(String number);
}
