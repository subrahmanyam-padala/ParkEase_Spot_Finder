package com.parkeasy.ParkEase_backend.dto;

import java.util.List;
import java.util.Map;

public class ChatbotResponseDTO {

  private String reply;
  private String intent;
  private List<Map<String, Object>> suggestions;

  public ChatbotResponseDTO() {
  }

  public ChatbotResponseDTO(String reply) {
    this.reply = reply;
  }

  public ChatbotResponseDTO(String reply, String intent) {
    this.reply = reply;
    this.intent = intent;
  }

  public ChatbotResponseDTO(String reply, String intent, List<Map<String, Object>> suggestions) {
    this.reply = reply;
    this.intent = intent;
    this.suggestions = suggestions;
  }

  public String getReply() {
    return reply;
  }

  public void setReply(String reply) {
    this.reply = reply;
  }

  public String getIntent() {
    return intent;
  }

  public void setIntent(String intent) {
    this.intent = intent;
  }

  public List<Map<String, Object>> getSuggestions() {
    return suggestions;
  }

  public void setSuggestions(List<Map<String, Object>> suggestions) {
    this.suggestions = suggestions;
  }
}
