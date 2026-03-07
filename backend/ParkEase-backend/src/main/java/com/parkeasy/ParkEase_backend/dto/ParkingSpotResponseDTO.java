package com.parkeasy.ParkEase_backend.dto;

public class ParkingSpotResponseDTO {

  private Long spotId;
  private String spotLabel;
  private String zone;
  private Boolean isOccupied;
  private Boolean isEvOnly;
  private String navigationPath;

  public ParkingSpotResponseDTO() {
  }

  public ParkingSpotResponseDTO(Long spotId, String spotLabel, String zone, Boolean isOccupied,
      Boolean isEvOnly, String navigationPath) {
    this.spotId = spotId;
    this.spotLabel = spotLabel;
    this.zone = zone;
    this.isOccupied = isOccupied;
    this.isEvOnly = isEvOnly;
    this.navigationPath = navigationPath;
  }

  public Long getSpotId() {
    return spotId;
  }

  public void setSpotId(Long spotId) {
    this.spotId = spotId;
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

  public Boolean getIsOccupied() {
    return isOccupied;
  }

  public void setIsOccupied(Boolean isOccupied) {
    this.isOccupied = isOccupied;
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
