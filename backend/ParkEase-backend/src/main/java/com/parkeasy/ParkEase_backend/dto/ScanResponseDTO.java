package com.parkeasy.ParkEase_backend.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ScanResponseDTO {
  private boolean success;
  private String action;
  private String message;
  private String error;
  private Map<String, Object> data;

  public ScanResponseDTO() {
  }

  public static ScanResponseDTO success(String action, String message, Map<String, Object> data) {
    ScanResponseDTO dto = new ScanResponseDTO();
    dto.setSuccess(true);
    dto.setAction(action);
    dto.setMessage(message);
    dto.setData(data);
    return dto;
  }

  public static ScanResponseDTO error(String error) {
    ScanResponseDTO dto = new ScanResponseDTO();
    dto.setSuccess(false);
    dto.setError(error);
    return dto;
  }

  public static ScanResponseDTO failure(String action, String message, Map<String, Object> data) {
    ScanResponseDTO dto = new ScanResponseDTO();
    dto.setSuccess(false);
    dto.setAction(action);
    dto.setMessage(message);
    dto.setData(data);
    return dto;
  }

  public boolean isSuccess() {
    return success;
  }

  public void setSuccess(boolean success) {
    this.success = success;
  }

  public String getAction() {
    return action;
  }

  public void setAction(String action) {
    this.action = action;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public String getError() {
    return error;
  }

  public void setError(String error) {
    this.error = error;
  }

  public Map<String, Object> getData() {
    return data;
  }

  public void setData(Map<String, Object> data) {
    this.data = data;
  }
}
