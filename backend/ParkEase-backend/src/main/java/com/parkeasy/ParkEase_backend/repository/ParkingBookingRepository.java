package com.parkeasy.ParkEase_backend.repository;

import com.parkeasy.ParkEase_backend.entity.ParkingBooking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParkingBookingRepository extends JpaRepository<ParkingBooking, Long> {
}
