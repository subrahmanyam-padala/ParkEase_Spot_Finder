package com.parkeasy.ParkEase_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "payment_id")
  private Long paymentId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "booking_id", nullable = false)
  private Booking booking;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private Users user;

  @Column(name = "amount", nullable = false)
  private Double amount;

  @Column(name = "payment_method", length = 30)
  private String paymentMethod;

  @Column(name = "transaction_id", unique = true, length = 100)
  private String transactionId;

  @Column(name = "razorpay_order_id", length = 100)
  private String razorpayOrderId;

  @Column(name = "razorpay_payment_id", length = 100)
  private String razorpayPaymentId;

  @Column(name = "razorpay_signature", length = 500)
  private String razorpaySignature;

  @Column(name = "status", nullable = false, length = 20)
  private String status = "PENDING";

  @Column(name = "refund_status", length = 30)
  private String refundStatus = "NOT_APPLICABLE";

  @Column(name = "refund_requested_at")
  private LocalDateTime refundRequestedAt;

  @Column(name = "extension_hours")
  private Integer extensionHours;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }

  public Payment() {
  }

  public Long getPaymentId() {
    return paymentId;
  }

  public void setPaymentId(Long paymentId) {
    this.paymentId = paymentId;
  }

  public Booking getBooking() {
    return booking;
  }

  public void setBooking(Booking booking) {
    this.booking = booking;
  }

  public Users getUser() {
    return user;
  }

  public void setUser(Users user) {
    this.user = user;
  }

  public Double getAmount() {
    return amount;
  }

  public void setAmount(Double amount) {
    this.amount = amount;
  }

  public String getPaymentMethod() {
    return paymentMethod;
  }

  public void setPaymentMethod(String paymentMethod) {
    this.paymentMethod = paymentMethod;
  }

  public String getTransactionId() {
    return transactionId;
  }

  public void setTransactionId(String transactionId) {
    this.transactionId = transactionId;
  }

  public String getRazorpayOrderId() {
    return razorpayOrderId;
  }

  public void setRazorpayOrderId(String razorpayOrderId) {
    this.razorpayOrderId = razorpayOrderId;
  }

  public String getRazorpayPaymentId() {
    return razorpayPaymentId;
  }

  public void setRazorpayPaymentId(String razorpayPaymentId) {
    this.razorpayPaymentId = razorpayPaymentId;
  }

  public String getRazorpaySignature() {
    return razorpaySignature;
  }

  public void setRazorpaySignature(String razorpaySignature) {
    this.razorpaySignature = razorpaySignature;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public String getRefundStatus() {
    return refundStatus;
  }

  public void setRefundStatus(String refundStatus) {
    this.refundStatus = refundStatus;
  }

  public LocalDateTime getRefundRequestedAt() {
    return refundRequestedAt;
  }

  public void setRefundRequestedAt(LocalDateTime refundRequestedAt) {
    this.refundRequestedAt = refundRequestedAt;
  }

  public Integer getExtensionHours() {
    return extensionHours;
  }

  public void setExtensionHours(Integer extensionHours) {
    this.extensionHours = extensionHours;
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
}
