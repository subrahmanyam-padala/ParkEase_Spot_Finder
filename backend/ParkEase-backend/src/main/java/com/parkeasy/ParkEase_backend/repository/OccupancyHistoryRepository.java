package com.parkeasy.ParkEase_backend.repository;

import com.parkeasy.ParkEase_backend.entity.OccupancyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OccupancyHistoryRepository extends JpaRepository<OccupancyHistory, Long> {

  List<OccupancyHistory> findByDayOfWeek(String dayOfWeek);

  List<OccupancyHistory> findByRecordedAtBetween(LocalDateTime start, LocalDateTime end);

  @Query("SELECT AVG(o.occupiedCount) FROM OccupancyHistory o WHERE o.dayOfWeek = :dayOfWeek")
  Double findAverageOccupancyByDayOfWeek(@Param("dayOfWeek") String dayOfWeek);

  @Query("SELECT AVG(o.occupiedCount) FROM OccupancyHistory o WHERE o.dayOfWeek = :dayOfWeek " +
      "AND FUNCTION('HOUR', o.recordedAt) = :hour")
  Double findAverageOccupancyByDayAndHour(@Param("dayOfWeek") String dayOfWeek, @Param("hour") int hour);

  @Query("SELECT o FROM OccupancyHistory o ORDER BY o.recordedAt DESC")
  List<OccupancyHistory> findRecentHistory();
}
