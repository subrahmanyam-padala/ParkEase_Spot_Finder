package com.parkeasy.ParkEase_backend.service;

import com.parkeasy.ParkEase_backend.dto.PricingConfigDTO;
import com.parkeasy.ParkEase_backend.entity.PricingConfig;

public interface PricingService {

	PricingConfig getCurrentPricing();

	PricingConfig updatePricing(PricingConfigDTO pricingConfigDTO);

	double calculateBaseFee(int durationHours);

	double calculateSurgeFee(double baseFee);

	double calculateTotalFee(int durationHours);

	boolean isSurgeActive();

	double getCurrentOccupancyPercent();
}
