package com.parkeasy.ParkEase_backend.dto;

import jakarta.validation.constraints.NotNull;

public class PaymentRequestDTO {

  @NotNull(message = "Booking ID is required")
  private Long bookingId;

  private String paymentMethod;

  public PaymentRequestDTO() {
  }

  public Long getBookingId() {
    return bookingId;
  }

  public void setBookingId(Long bookingId) {
    this.bookingId = bookingId;
  }

  public String getPaymentMethod() {
    return paymentMethod;
  }

  public void setPaymentMethod(String paymentMethod) {
    this.paymentMethod = paymentMethod;
  }
}
