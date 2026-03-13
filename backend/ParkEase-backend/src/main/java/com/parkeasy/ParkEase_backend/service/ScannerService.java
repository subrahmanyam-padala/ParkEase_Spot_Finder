package com.parkeasy.ParkEase_backend.service;

import com.parkeasy.ParkEase_backend.dto.ScanResponseDTO;

public interface ScannerService {
  ScanResponseDTO processScan(String qrData);

  ScanResponseDTO payOverstay(String ticketNumber);

  ScanResponseDTO getTicketStatus(String ticketNumber);
}
