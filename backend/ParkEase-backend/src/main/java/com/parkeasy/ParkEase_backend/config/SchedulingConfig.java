package com.parkeasy.ParkEase_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SchedulingConfig {
  // Enables @Scheduled annotations for:
  // - OccupancyServiceImpl: Records occupancy every hour
  // - BookingServiceImpl: Auto-completes expired bookings every 5 minutes
}
