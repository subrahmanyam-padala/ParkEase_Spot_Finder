package com.parkeasy.ParkEase_backend.service;

import com.parkeasy.ParkEase_backend.dto.ChatbotRequestDTO;
import com.parkeasy.ParkEase_backend.dto.ChatbotResponseDTO;

public interface ChatbotService {

  ChatbotResponseDTO processMessage(ChatbotRequestDTO requestDTO);
}
