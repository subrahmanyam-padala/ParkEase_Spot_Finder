package com.parkeasy.ParkEase_backend.serviceImpl;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.FileContent;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.Permission;
import com.parkeasy.ParkEase_backend.service.DriveService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.util.Collections;
import java.util.List;

@Service
public class DriveServiceImpl implements DriveService {

  @Value("${google.drive.credentials-file:credentials.json}")
  private String credentialsFilePath;

  @Value("${google.drive.tokens-directory:tokens}")
  private String tokensDirectoryPath;

  @Value("${google.drive.folder-id:}")
  private String folderId;

  private static final List<String> SCOPES = Collections.singletonList(DriveScopes.DRIVE_FILE);

  @Override
  public String uploadFileToDrive(String localFilePath, String uploadName) {
    try {
      // Check if credentials file exists
      java.io.File credFile = new java.io.File(credentialsFilePath);
      if (!credFile.exists()) {
        System.err.println("[DriveService] credentials.json not found. Skipping Drive upload.");
        return "LOCAL:" + localFilePath;
      }

      final HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
      Credential credential = getCredentials(httpTransport);

      Drive driveService = new Drive.Builder(httpTransport, GsonFactory.getDefaultInstance(), credential)
          .setApplicationName("ParkEase QR Upload")
          .build();

      // Prepare file metadata
      File fileMetadata = new File();
      fileMetadata.setName(uploadName);
      if (folderId != null && !folderId.isBlank()) {
        fileMetadata.setParents(Collections.singletonList(folderId));
      }

      // Upload the file
      File uploadedFile = driveService.files()
          .create(fileMetadata, new FileContent("image/png", new java.io.File(localFilePath)))
          .setFields("id, webViewLink")
          .execute();

      System.out.println("[DriveService] Uploaded to Drive. ID: " + uploadedFile.getId());

      // Make it publicly readable
      driveService.permissions()
          .create(uploadedFile.getId(),
              new Permission().setType("anyone").setRole("reader"))
          .execute();

      // Return direct image URL (not webViewLink which is an HTML viewer page)
      return "https://drive.google.com/uc?export=view&id=" + uploadedFile.getId();

    } catch (Exception e) {
      System.err.println("[DriveService] Drive upload failed: " + e.getMessage());
      e.printStackTrace();
      return "LOCAL:" + localFilePath;
    }
  }

  private Credential getCredentials(HttpTransport httpTransport) throws Exception {
    java.io.File credFile = new java.io.File(credentialsFilePath);
    GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(
        GsonFactory.getDefaultInstance(),
        new InputStreamReader(new FileInputStream(credFile)));

    GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
        httpTransport, GsonFactory.getDefaultInstance(), clientSecrets, SCOPES)
        .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(tokensDirectoryPath)))
        .setAccessType("offline")
        .build();

    LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(8888).build();
    return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
  }
}
