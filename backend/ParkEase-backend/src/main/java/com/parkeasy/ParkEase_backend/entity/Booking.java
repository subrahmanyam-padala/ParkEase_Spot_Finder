package com.parkeasy.ParkEase_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "booking_id")
  private Long bookingId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private Users user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "spot_id", nullable = false)
  private ParkingSpot parkingSpot;

  @Column(name = "vehicle_number", nullable = false, length = 20)
  private String vehicleNumber;

  @Column(name = "ticket_number", nullable = false, unique = true, length = 30)
  private String ticketNumber;

  @Column(name = "start_time", nullable = false)
  private LocalDateTime startTime;

  @Column(name = "end_time")
  private LocalDateTime endTime;

  @Column(name = "base_fee", nullable = false)
  private Double baseFee;

  @Column(name = "surge_fee")
  private Double surgeFee = 0.0;

  @Column(name = "total_amount")
  private Double totalAmount;

  @Column(name = "status", nullable = false, length = 20)
  private String status = "ACTIVE";

  @Column(name = "overstay_fee")
  private Double overstayFee;

  @Column(name = "checked_in_time")
  private LocalDateTime checkedInTime;

  @Column(name = "qr_code_url", length = 1000)
  private String qrCodeUrl;

  @Version
  @Column(name = "version")
  private Integer version;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(name = "cancellation_requested_at")
  private LocalDateTime cancellationRequestedAt;

  @Column(name = "refund_status", length = 30)
  private String refundStatus = "NOT_APPLICABLE";

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }

  public Booking() {
  }

  public Long getBookingId() {
    return bookingId;
  }

  public void setBookingId(Long bookingId) {
    this.bookingId = bookingId;
  }

  public Users getUser() {
    return user;
  }

  public void setUser(Users user) {
    this.user = user;
  }

  public ParkingSpot getParkingSpot() {
    return parkingSpot;
  }

  public void setParkingSpot(ParkingSpot parkingSpot) {
    this.parkingSpot = parkingSpot;
  }

  public String getVehicleNumber() {
    return vehicleNumber;
  }

  public void setVehicleNumber(String vehicleNumber) {
    this.vehicleNumber = vehicleNumber;
  }

  public String getTicketNumber() {
    return ticketNumber;
  }

  public void setTicketNumber(String ticketNumber) {
    this.ticketNumber = ticketNumber;
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

  public Integer getVersion() {
    return version;
  }

  public void setVersion(Integer version) {
    this.version = version;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
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
}
