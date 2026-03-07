package com.parkeasy.ParkEase_backend.dto;

public class PaymentResponseDTO {

  private Long paymentId;
  private Long bookingId;
  private Double amount;
  private String razorpayOrderId;
  private String razorpayPaymentId;
  private String status;
  private String message;
  private String razorpayKeyId;

  public PaymentResponseDTO() {
  }

  public Long getPaymentId() {
    return paymentId;
  }

  public void setPaymentId(Long paymentId) {
    this.paymentId = paymentId;
  }

  public Long getBookingId() {
    return bookingId;
  }

  public void setBookingId(Long bookingId) {
    this.bookingId = bookingId;
  }

  public Double getAmount() {
    return amount;
  }

  public void setAmount(Double amount) {
    this.amount = amount;
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

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public String getRazorpayKeyId() {
    return razorpayKeyId;
  }

  public void setRazorpayKeyId(String razorpayKeyId) {
    this.razorpayKeyId = razorpayKeyId;
  }
}
