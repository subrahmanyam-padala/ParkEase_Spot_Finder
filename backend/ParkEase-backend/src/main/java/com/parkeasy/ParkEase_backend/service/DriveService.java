package com.parkeasy.ParkEase_backend.service;

public interface DriveService {

  /**
   * Uploads a file to Google Drive and returns the shareable web view link.
   */
  String uploadFileToDrive(String localFilePath, String uploadName);
}
