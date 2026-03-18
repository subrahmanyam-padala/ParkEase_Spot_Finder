package com.parkeasy.ParkEase_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "parking_spots")
public class ParkingSpot {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "spot_id")
  private Long spotId;

  @Column(name = "spot_label", nullable = false, length = 10)
  private String spotLabel;

  @Column(name = "zone", nullable = false, length = 50)
  private String zone;

  @Column(name = "is_occupied", nullable = false)
  private Boolean isOccupied = false;

  @Column(name = "is_ev_only", nullable = false)
  private Boolean isEvOnly = false;

  @Column(name = "navigation_path", length = 500)
  private String navigationPath;

  @Column(name = "price_per_hour", nullable = false)
  private Double pricePerHour = 75.0;

  public ParkingSpot() {
  }

  public ParkingSpot(String spotLabel, String zone, Boolean isEvOnly, String navigationPath) {
    this.spotLabel = spotLabel;
    this.zone = zone;
    this.isEvOnly = isEvOnly;
    this.navigationPath = navigationPath;
    this.isOccupied = false;
    this.pricePerHour = 75.0;
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

  public Double getPricePerHour() {
    return pricePerHour;
  }

  public void setPricePerHour(Double pricePerHour) {
    this.pricePerHour = pricePerHour;
  }
}
