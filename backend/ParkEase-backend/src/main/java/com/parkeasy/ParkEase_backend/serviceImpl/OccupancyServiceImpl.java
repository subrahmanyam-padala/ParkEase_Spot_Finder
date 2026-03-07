package com.parkeasy.ParkEase_backend.serviceImpl;

import com.parkeasy.ParkEase_backend.entity.OccupancyHistory;
import com.parkeasy.ParkEase_backend.repository.OccupancyHistoryRepository;
import com.parkeasy.ParkEase_backend.repository.ParkingSpotRepository;
import com.parkeasy.ParkEase_backend.service.OccupancyService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OccupancyServiceImpl implements OccupancyService {

  private final OccupancyHistoryRepository occupancyHistoryRepository;
  private final ParkingSpotRepository parkingSpotRepository;

  public OccupancyServiceImpl(OccupancyHistoryRepository occupancyHistoryRepository,
      ParkingSpotRepository parkingSpotRepository) {
    this.occupancyHistoryRepository = occupancyHistoryRepository;
    this.parkingSpotRepository = parkingSpotRepository;
  }

  /**
   * Automatically records occupancy every hour (cron: at minute 0 of every hour).
   */
  @Override
  @Scheduled(cron = "0 0 * * * *")
  public void recordCurrentOccupancy() {
    LocalDateTime now = LocalDateTime.now();
    long occupied = parkingSpotRepository.countOccupiedSpots();
    long total = parkingSpotRepository.countTotalSpots();

    if (total == 0)
      return;

    OccupancyHistory history = new OccupancyHistory(
        now,
        now.getDayOfWeek().name(),
        (int) occupied,
        (int) total);

    occupancyHistoryRepository.save(history);
    System.out.println("[OccupancyService] Recorded: " + occupied + "/" + total
        + " spots occupied at " + now);
  }

  @Override
  public List<OccupancyHistory> getHistoryByDayOfWeek(String dayOfWeek) {
    return occupancyHistoryRepository.findByDayOfWeek(dayOfWeek.toUpperCase());
  }

  @Override
  public List<OccupancyHistory> getRecentHistory() {
    return occupancyHistoryRepository.findRecentHistory();
  }

  @Override
  public Map<String, Object> getPredictedOccupancy(String dayOfWeek, int hour) {
    Double avgOccupancy = occupancyHistoryRepository
        .findAverageOccupancyByDayAndHour(dayOfWeek.toUpperCase(), hour);

    long totalSpots = parkingSpotRepository.countTotalSpots();

    Map<String, Object> prediction = new LinkedHashMap<>();
    prediction.put("dayOfWeek", dayOfWeek.toUpperCase());
    prediction.put("hour", hour);
    prediction.put("totalSpots", totalSpots);

    if (avgOccupancy != null && totalSpots > 0) {
      prediction.put("predictedOccupied", Math.round(avgOccupancy));
      prediction.put("predictedAvailable", totalSpots - Math.round(avgOccupancy));
      prediction.put("predictedOccupancyPercent",
          Math.round(avgOccupancy / totalSpots * 100 * 100.0) / 100.0);
      prediction.put("confidence", "Based on historical data");
    } else {
      prediction.put("predictedOccupied", "N/A");
      prediction.put("predictedAvailable", "N/A");
      prediction.put("predictedOccupancyPercent", "N/A");
      prediction.put("confidence", "Insufficient historical data");
    }

    return prediction;
  }

  @Override
  public Map<String, Object> getCurrentOccupancyStatus() {
    long total = parkingSpotRepository.countTotalSpots();
    long occupied = parkingSpotRepository.countOccupiedSpots();
    long available = total - occupied;
    double percent = total > 0 ? (double) occupied / total * 100 : 0;

    Map<String, Object> status = new LinkedHashMap<>();
    status.put("totalSpots", total);
    status.put("occupiedSpots", occupied);
    status.put("availableSpots", available);
    status.put("occupancyPercent", Math.round(percent * 100.0) / 100.0);
    status.put("timestamp", LocalDateTime.now());
    return status;
  }
}
