package com.parkeasy.ParkEase_backend.controller;

import com.parkeasy.ParkEase_backend.dto.OverstayPaymentRequestDTO;
import com.parkeasy.ParkEase_backend.dto.ScanRequestDTO;
import com.parkeasy.ParkEase_backend.dto.ScanResponseDTO;
import com.parkeasy.ParkEase_backend.service.ScannerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scan")
public class ScannerController {

  private final ScannerService scannerService;

  public ScannerController(ScannerService scannerService) {
    this.scannerService = scannerService;
  }

  @PostMapping
  public ResponseEntity<ScanResponseDTO> processScan(@RequestBody ScanRequestDTO request) {
    ScanResponseDTO response = scannerService.processScan(request.getQrData());
    if (!response.isSuccess() && response.getAction() == null) {
      return ResponseEntity.badRequest().body(response);
    }
    return ResponseEntity.ok(response);
  }

  @PostMapping("/pay-overstay")
  public ResponseEntity<ScanResponseDTO> payOverstay(@RequestBody OverstayPaymentRequestDTO request) {
    ScanResponseDTO response = scannerService.payOverstay(request.getTicketNumber());
    if (!response.isSuccess()) {
      return ResponseEntity.badRequest().body(response);
    }
    return ResponseEntity.ok(response);
  }

  @GetMapping("/status/{ticketNumber}")
  public ResponseEntity<ScanResponseDTO> getTicketStatus(@PathVariable String ticketNumber) {
    ScanResponseDTO response = scannerService.getTicketStatus(ticketNumber);
    if (!response.isSuccess()) {
      return ResponseEntity.status(404).body(response);
    }
    return ResponseEntity.ok(response);
  }
}
