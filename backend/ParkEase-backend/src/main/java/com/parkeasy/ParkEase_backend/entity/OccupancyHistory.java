package com.parkeasy.ParkEase_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "occupancy_history")
public class OccupancyHistory {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "history_id")
  private Long historyId;

  @Column(name = "recorded_at", nullable = false)
  private LocalDateTime recordedAt;

  @Column(name = "day_of_week", nullable = false, length = 15)
  private String dayOfWeek;

  @Column(name = "occupied_count", nullable = false)
  private Integer occupiedCount;

  @Column(name = "total_spots", nullable = false)
  private Integer totalSpots;

  public OccupancyHistory() {
  }

  public OccupancyHistory(LocalDateTime recordedAt, String dayOfWeek, Integer occupiedCount, Integer totalSpots) {
    this.recordedAt = recordedAt;
    this.dayOfWeek = dayOfWeek;
    this.occupiedCount = occupiedCount;
    this.totalSpots = totalSpots;
  }

  public Long getHistoryId() {
    return historyId;
  }

  public void setHistoryId(Long historyId) {
    this.historyId = historyId;
  }

  public LocalDateTime getRecordedAt() {
    return recordedAt;
  }

  public void setRecordedAt(LocalDateTime recordedAt) {
    this.recordedAt = recordedAt;
  }

  public String getDayOfWeek() {
    return dayOfWeek;
  }

  public void setDayOfWeek(String dayOfWeek) {
    this.dayOfWeek = dayOfWeek;
  }

  public Integer getOccupiedCount() {
    return occupiedCount;
  }

  public void setOccupiedCount(Integer occupiedCount) {
    this.occupiedCount = occupiedCount;
  }

  public Integer getTotalSpots() {
    return totalSpots;
  }

  public void setTotalSpots(Integer totalSpots) {
    this.totalSpots = totalSpots;
  }
}
