package com.parkeasy.ParkEase_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BookingRequestDTO {

  @NotNull(message = "Spot ID is required")
  private Long spotId;

  @NotBlank(message = "Vehicle number is required")
  private String vehicleNumber;

  @NotNull(message = "Duration in hours is required")
  private Integer durationHours;

  public BookingRequestDTO() {
  }

  public BookingRequestDTO(Long spotId, String vehicleNumber, Integer durationHours) {
    this.spotId = spotId;
    this.vehicleNumber = vehicleNumber;
    this.durationHours = durationHours;
  }

  public Long getSpotId() {
    return spotId;
  }

  public void setSpotId(Long spotId) {
    this.spotId = spotId;
  }

  public String getVehicleNumber() {
    return vehicleNumber;
  }

  public void setVehicleNumber(String vehicleNumber) {
    this.vehicleNumber = vehicleNumber;
  }

  public Integer getDurationHours() {
    return durationHours;
  }

  public void setDurationHours(Integer durationHours) {
    this.durationHours = durationHours;
  }
}
