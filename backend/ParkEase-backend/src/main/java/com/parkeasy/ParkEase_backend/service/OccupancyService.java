package com.parkeasy.ParkEase_backend.service;

import com.parkeasy.ParkEase_backend.entity.OccupancyHistory;

import java.util.List;
import java.util.Map;

public interface OccupancyService {

  void recordCurrentOccupancy();

  List<OccupancyHistory> getHistoryByDayOfWeek(String dayOfWeek);

  List<OccupancyHistory> getRecentHistory();

  Map<String, Object> getPredictedOccupancy(String dayOfWeek, int hour);

  Map<String, Object> getCurrentOccupancyStatus();
}
