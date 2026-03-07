package com.parkeasy.ParkEase_backend.repository;

import com.parkeasy.ParkEase_backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

  Optional<Booking> findByTicketNumber(String ticketNumber);

  List<Booking> findByUserUserId(Integer userId);

  List<Booking> findByUserUserIdAndStatus(Integer userId, String status);

  List<Booking> findByParkingSpotSpotIdAndStatus(Long spotId, String status);

  List<Booking> findByStatus(String status);

  @Query("SELECT b FROM Booking b WHERE b.parkingSpot.spotId = :spotId AND b.status = 'ACTIVE' " +
      "AND ((b.startTime <= :endTime AND (b.endTime IS NULL OR b.endTime >= :startTime)))")
  List<Booking> findConflictingBookings(@Param("spotId") Long spotId,
      @Param("startTime") LocalDateTime startTime,
      @Param("endTime") LocalDateTime endTime);

  @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'ACTIVE'")
  long countActiveBookings();

  @Query("SELECT b FROM Booking b WHERE b.status = 'ACTIVE' AND b.endTime IS NOT NULL AND b.endTime < :now")
  List<Booking> findExpiredActiveBookings(@Param("now") LocalDateTime now);
}
