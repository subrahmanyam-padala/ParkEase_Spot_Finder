package com.parkeasy.ParkEase_backend.dto;

import java.time.LocalDateTime;

public class BookingResponseDTO {

  private Long bookingId;
  private String ticketNumber;
  private String spotLabel;
  private String zone;
  private String vehicleNumber;
  private LocalDateTime startTime;
  private LocalDateTime endTime;
  private Double baseFee;
  private Double surgeFee;
  private Double totalAmount;
  private String status;
  private Double overstayFee;
  private LocalDateTime checkedInTime;
  private String qrCodeUrl;
  private String navigationPath;
  private String userName;
  private String userEmail;
  private Integer durationHours;
  private LocalDateTime createdAt;
  private LocalDateTime cancellationRequestedAt;
  private String refundStatus;
  private Double spotPricePerHour;
  private Double overstayMultiplier;

  public BookingResponseDTO() {
  }

  public Long getBookingId() {
    return bookingId;
  }

  public void setBookingId(Long bookingId) {
    this.bookingId = bookingId;
  }

  public String getTicketNumber() {
    return ticketNumber;
  }

  public void setTicketNumber(String ticketNumber) {
    this.ticketNumber = ticketNumber;
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

  public String getVehicleNumber() {
    return vehicleNumber;
  }

  public void setVehicleNumber(String vehicleNumber) {
    this.vehicleNumber = vehicleNumber;
  }

  public LocalDateTime getStartTime() {
    return startTime;
  }

  public void setStartTime(LocalDateTime startTime) {
    this.startTime = startTime;
  }

  public LocalDateTime getEndTime() {
    return endTime;
  }

  public void setEndTime(LocalDateTime endTime) {
    this.endTime = endTime;
  }

  public Double getBaseFee() {
    return baseFee;
  }

  public void setBaseFee(Double baseFee) {
    this.baseFee = baseFee;
  }

  public Double getSurgeFee() {
    return surgeFee;
  }

  public void setSurgeFee(Double surgeFee) {
    this.surgeFee = surgeFee;
  }

  public Double getTotalAmount() {
    return totalAmount;
  }

  public void setTotalAmount(Double totalAmount) {
    this.totalAmount = totalAmount;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public Double getOverstayFee() {
    return overstayFee;
  }

  public void setOverstayFee(Double overstayFee) {
    this.overstayFee = overstayFee;
  }

  public LocalDateTime getCheckedInTime() {
    return checkedInTime;
  }

  public void setCheckedInTime(LocalDateTime checkedInTime) {
    this.checkedInTime = checkedInTime;
  }

  public String getQrCodeUrl() {
    return qrCodeUrl;
  }

  public void setQrCodeUrl(String qrCodeUrl) {
    this.qrCodeUrl = qrCodeUrl;
  }

  public String getNavigationPath() {
    return navigationPath;
  }

  public void setNavigationPath(String navigationPath) {
    this.navigationPath = navigationPath;
  }

  public String getUserName() {
    return userName;
  }

  public void setUserName(String userName) {
    this.userName = userName;
  }

  public String getUserEmail() {
    return userEmail;
  }

  public void setUserEmail(String userEmail) {
    this.userEmail = userEmail;
  }

  public Integer getDurationHours() {
    return durationHours;
  }

  public void setDurationHours(Integer durationHours) {
    this.durationHours = durationHours;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getCancellationRequestedAt() {
    return cancellationRequestedAt;
  }

  public void setCancellationRequestedAt(LocalDateTime cancellationRequestedAt) {
    this.cancellationRequestedAt = cancellationRequestedAt;
  }

  public String getRefundStatus() {
    return refundStatus;
  }

  public void setRefundStatus(String refundStatus) {
    this.refundStatus = refundStatus;
  }

  public Double getSpotPricePerHour() {
    return spotPricePerHour;
  }

  public void setSpotPricePerHour(Double spotPricePerHour) {
    this.spotPricePerHour = spotPricePerHour;
  }

  public Double getOverstayMultiplier() {
    return overstayMultiplier;
  }

  public void setOverstayMultiplier(Double overstayMultiplier) {
    this.overstayMultiplier = overstayMultiplier;
  }
}
