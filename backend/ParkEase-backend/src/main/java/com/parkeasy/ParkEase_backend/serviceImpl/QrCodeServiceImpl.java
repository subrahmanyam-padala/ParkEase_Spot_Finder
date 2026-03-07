package com.parkeasy.ParkEase_backend.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.parkeasy.ParkEase_backend.service.DriveService;
import com.parkeasy.ParkEase_backend.service.QrCodeService;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class QrCodeServiceImpl implements QrCodeService {

  private final DriveService driveService;
  private final ObjectMapper objectMapper;

  public QrCodeServiceImpl(DriveService driveService, ObjectMapper objectMapper) {
    this.driveService = driveService;
    this.objectMapper = objectMapper;
  }

  @Override
  public String generateAndUploadQrCode(String email, String ticketNumber, String name,
      String vehicleNumber, String spotLabel, String zone,
      String startTime, String expirationTime, double price) {

    String localFileName = "qr_" + UUID.randomUUID().toString() + ".png";

    try {
      // Build QR data matching frontend JSON format for scanner compatibility
      Map<String, Object> qrData = new LinkedHashMap<>();
      qrData.put("ticket_no", ticketNumber);
      qrData.put("spot", spotLabel + " - " + zone);
      qrData.put("vehicle", vehicleNumber);
      qrData.put("start_time", startTime);
      qrData.put("end_time", expirationTime);
      qrData.put("amount", price);

      String jsonData = objectMapper.writeValueAsString(qrData);

      // 2. Generate QR Code
      generateQRCode(jsonData, localFileName, 300, 300);
      System.out.println("[QrCodeService] QR Code generated: " + localFileName);

      // 3. Upload to Google Drive
      String driveUrl = driveService.uploadFileToDrive(localFileName,
          "ParkEase_QR_" + ticketNumber + ".png");
      System.out.println("[QrCodeService] Drive URL: " + driveUrl);

      // 4. Delete local file
      deleteLocalFile(localFileName);

      return driveUrl;

    } catch (Exception e) {
      System.err.println("[QrCodeService] Error: " + e.getMessage());
      e.printStackTrace();
      // Clean up on failure
      deleteLocalFile(localFileName);
      return null;
    }
  }

  private void generateQRCode(String data, String path, int width, int height) throws Exception {
    Map<EncodeHintType, Object> hints = new java.util.HashMap<>();
    hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
    hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

    BitMatrix matrix = new MultiFormatWriter().encode(data, BarcodeFormat.QR_CODE, width, height, hints);
    Path outputPath = new File(path).toPath();
    MatrixToImageWriter.writeToPath(matrix, "PNG", outputPath);
  }

  private void deleteLocalFile(String filePath) {
    File file = new File(filePath);
    if (file.exists()) {
      if (file.delete()) {
        System.out.println("[QrCodeService] Local file deleted: " + filePath);
      } else {
        System.out.println("[QrCodeService] Failed to delete: " + filePath);
      }
    }
  }

  @Override
  public File generateQrCodeFile(String email, String ticketNumber, String name,
      String vehicleNumber, String spotLabel, String zone,
      String startTime, String expirationTime, double price) {

    String localFileName = "qr_email_" + UUID.randomUUID().toString() + ".png";

    try {
      // Build QR data matching frontend JSON format for scanner compatibility
      Map<String, Object> qrData = new LinkedHashMap<>();
      qrData.put("email", email);
      qrData.put("ticket_no", ticketNumber);
      qrData.put("name", name);
      qrData.put("vehicle_no", vehicleNumber);
      qrData.put("parking_spot_details", spotLabel + " - " + zone);
      qrData.put("expiration_time", expirationTime);
      qrData.put("price", price);

      String jsonData = objectMapper.writeValueAsString(qrData);
      generateQRCode(jsonData, localFileName, 300, 300);
      System.out.println("[QrCodeService] QR file generated for email: " + localFileName);
      return new File(localFileName);
    } catch (Exception e) {
      System.err.println("[QrCodeService] Error generating QR file: " + e.getMessage());
      deleteLocalFile(localFileName);
      return null;
    }
  }
}
