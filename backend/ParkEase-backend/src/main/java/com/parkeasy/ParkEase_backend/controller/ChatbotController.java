package com.parkeasy.ParkEase_backend.controller;

import com.parkeasy.ParkEase_backend.dto.ChatbotRequestDTO;
import com.parkeasy.ParkEase_backend.dto.ChatbotResponseDTO;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.repository.UsersRepository;
import com.parkeasy.ParkEase_backend.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

  private final ChatbotService chatbotService;
  private final UsersRepository usersRepository;

  public ChatbotController(ChatbotService chatbotService, UsersRepository usersRepository) {
    this.chatbotService = chatbotService;
    this.usersRepository = usersRepository;
  }

  @PostMapping("/message")
  public ResponseEntity<ChatbotResponseDTO> sendMessage(
      Authentication authentication,
      @Valid @RequestBody ChatbotRequestDTO requestDTO) {

    // Inject userId from authentication if available
    if (authentication != null && requestDTO.getUserId() == null) {
      try {
        String username = authentication.getName();
        Users user = usersRepository.findByUsername(username).orElse(null);
        if (user != null) {
          requestDTO.setUserId(user.getUserId());
        }
      } catch (Exception ignored) {
      }
    }

    ChatbotResponseDTO response = chatbotService.processMessage(requestDTO);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/welcome")
  public ResponseEntity<ChatbotResponseDTO> getWelcome() {
    ChatbotRequestDTO request = new ChatbotRequestDTO("hello", null);
    return ResponseEntity.ok(chatbotService.processMessage(request));
  }
}
