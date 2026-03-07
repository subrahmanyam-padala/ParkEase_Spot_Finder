package com.parkeasy.ParkEase_backend.serviceImpl;

import com.parkeasy.ParkEase_backend.dto.PricingConfigDTO;
import com.parkeasy.ParkEase_backend.entity.PricingConfig;
import com.parkeasy.ParkEase_backend.repository.ParkingSpotRepository;
import com.parkeasy.ParkEase_backend.repository.PricingConfigRepository;
import com.parkeasy.ParkEase_backend.service.PricingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PricingServiceImpl implements PricingService {

  private final PricingConfigRepository pricingConfigRepository;
  private final ParkingSpotRepository parkingSpotRepository;

  public PricingServiceImpl(PricingConfigRepository pricingConfigRepository,
      ParkingSpotRepository parkingSpotRepository) {
    this.pricingConfigRepository = pricingConfigRepository;
    this.parkingSpotRepository = parkingSpotRepository;
  }

  @Override
  public PricingConfig getCurrentPricing() {
    return pricingConfigRepository.findAll().stream()
        .findFirst()
        .orElseGet(() -> {
          // Create default pricing config if none exists
          PricingConfig defaultConfig = new PricingConfig(50.0, 80, 1.5);
          return pricingConfigRepository.save(defaultConfig);
        });
  }

  @Override
  @Transactional
  public PricingConfig updatePricing(PricingConfigDTO dto) {
    PricingConfig config = getCurrentPricing();
    config.setBasePricePerHour(dto.getBasePricePerHour());
    config.setSurgeThresholdPercent(dto.getSurgeThresholdPercent());
    config.setSurgeMultiplier(dto.getSurgeMultiplier());
    return pricingConfigRepository.save(config);
  }

  @Override
  public double calculateBaseFee(int durationHours) {
    PricingConfig config = getCurrentPricing();
    return config.getBasePricePerHour() * durationHours;
  }

  @Override
  public double calculateSurgeFee(double baseFee) {
    if (isSurgeActive()) {
      PricingConfig config = getCurrentPricing();
      return baseFee * (config.getSurgeMultiplier() - 1.0);
    }
    return 0.0;
  }

  @Override
  public double calculateTotalFee(int durationHours) {
    double baseFee = calculateBaseFee(durationHours);
    double surgeFee = calculateSurgeFee(baseFee);
    return baseFee + surgeFee;
  }

  @Override
  public boolean isSurgeActive() {
    double occupancyPercent = getCurrentOccupancyPercent();
    PricingConfig config = getCurrentPricing();
    return occupancyPercent >= config.getSurgeThresholdPercent();
  }

  @Override
  public double getCurrentOccupancyPercent() {
    long total = parkingSpotRepository.countTotalSpots();
    if (total == 0)
      return 0;
    long occupied = parkingSpotRepository.countOccupiedSpots();
    return (double) occupied / total * 100;
  }
}
