package com.parkeasy.ParkEase_backend.dto;

public class OverstayPaymentRequestDTO {
  private String ticketNumber;

  public OverstayPaymentRequestDTO() {
  }

  public String getTicketNumber() {
    return ticketNumber;
  }

  public void setTicketNumber(String ticketNumber) {
    this.ticketNumber = ticketNumber;
  }
}
