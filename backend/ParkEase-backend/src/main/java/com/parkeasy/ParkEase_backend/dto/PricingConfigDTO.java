package com.parkeasy.ParkEase_backend.dto;

import jakarta.validation.constraints.NotNull;

public class PricingConfigDTO {

  @NotNull(message = "Base price per hour is required")
  private Double basePricePerHour;

  @NotNull(message = "Surge threshold percent is required")
  private Integer surgeThresholdPercent;

  @NotNull(message = "Surge multiplier is required")
  private Double surgeMultiplier;

  public PricingConfigDTO() {
  }

  public PricingConfigDTO(Double basePricePerHour, Integer surgeThresholdPercent, Double surgeMultiplier) {
    this.basePricePerHour = basePricePerHour;
    this.surgeThresholdPercent = surgeThresholdPercent;
    this.surgeMultiplier = surgeMultiplier;
  }

  public Double getBasePricePerHour() {
    return basePricePerHour;
  }

  public void setBasePricePerHour(Double basePricePerHour) {
    this.basePricePerHour = basePricePerHour;
  }

  public Integer getSurgeThresholdPercent() {
    return surgeThresholdPercent;
  }

  public void setSurgeThresholdPercent(Integer surgeThresholdPercent) {
    this.surgeThresholdPercent = surgeThresholdPercent;
  }

  public Double getSurgeMultiplier() {
    return surgeMultiplier;
  }

  public void setSurgeMultiplier(Double surgeMultiplier) {
    this.surgeMultiplier = surgeMultiplier;
  }
}
