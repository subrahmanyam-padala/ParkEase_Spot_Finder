package com.parkeasy.ParkEase_backend.service;

import java.io.File;

public interface QrCodeService {

    /**
     * Generates a QR code with booking details, uploads to Google Drive,
     * deletes local file, and returns the Drive URL.
     */
    String generateAndUploadQrCode(String email, String ticketNumber, String name,
            String vehicleNumber, String spotLabel, String zone,
            String startTime, String expirationTime, double price);

    /**
     * Generates a QR code as a temporary file (for email attachment).
     * Caller is responsible for deleting the file after use.
     */
    File generateQrCodeFile(String email, String ticketNumber, String name,
            String vehicleNumber, String spotLabel, String zone,
            String startTime, String expirationTime, double price);
}
