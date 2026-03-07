package com.parkeasy.ParkEase_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ParkingSpotRequestDTO {

  @NotBlank(message = "Spot label is required")
  private String spotLabel;

  @NotBlank(message = "Zone is required")
  private String zone;

  private Boolean isEvOnly = false;

  private String navigationPath;

  public ParkingSpotRequestDTO() {
  }

  public String getSpotLabel() {
    return spotLabel;
  }

  public void setSpotLabel(String spotLabel) {
    this.spotLabel = spotLabel;
  }

  public String getZone() {
    return zone;
  }

  public void setZone(String zone) {
    this.zone = zone;
  }

  public Boolean getIsEvOnly() {
    return isEvOnly;
  }

  public void setIsEvOnly(Boolean isEvOnly) {
    this.isEvOnly = isEvOnly;
  }

  public String getNavigationPath() {
    return navigationPath;
  }

  public void setNavigationPath(String navigationPath) {
    this.navigationPath = navigationPath;
  }
}
