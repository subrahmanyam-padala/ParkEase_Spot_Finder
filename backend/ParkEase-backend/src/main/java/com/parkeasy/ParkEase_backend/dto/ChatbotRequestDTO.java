package com.parkeasy.ParkEase_backend.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatbotRequestDTO {

  @NotBlank(message = "Message is required")
  private String message;

  private Integer userId;

  public ChatbotRequestDTO() {
  }

  public ChatbotRequestDTO(String message, Integer userId) {
    this.message = message;
    this.userId = userId;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public Integer getUserId() {
    return userId;
  }

  public void setUserId(Integer userId) {
    this.userId = userId;
  }
}
