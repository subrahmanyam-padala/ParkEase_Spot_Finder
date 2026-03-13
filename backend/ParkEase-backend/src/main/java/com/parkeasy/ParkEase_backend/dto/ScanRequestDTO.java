package com.parkeasy.ParkEase_backend.dto;

public class ScanRequestDTO {
  private String qrData;

  public ScanRequestDTO() {
  }

  public String getQrData() {
    return qrData;
  }

  public void setQrData(String qrData) {
    this.qrData = qrData;
  }
}
