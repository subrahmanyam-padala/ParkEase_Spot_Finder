package com.parkeasy.ParkEase_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "pricing_config")
public class PricingConfig {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "config_id")
  private Long configId;

  @Column(name = "base_price_per_hour", nullable = false)
  private Double basePricePerHour = 50.0;

  @Column(name = "surge_threshold_percent", nullable = false)
  private Integer surgeThresholdPercent = 80;

  @Column(name = "surge_multiplier", nullable = false)
  private Double surgeMultiplier = 1.5;

  public PricingConfig() {
  }

  public PricingConfig(Double basePricePerHour, Integer surgeThresholdPercent, Double surgeMultiplier) {
    this.basePricePerHour = basePricePerHour;
    this.surgeThresholdPercent = surgeThresholdPercent;
    this.surgeMultiplier = surgeMultiplier;
  }

  public Long getConfigId() {
    return configId;
  }

  public void setConfigId(Long configId) {
    this.configId = configId;
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
