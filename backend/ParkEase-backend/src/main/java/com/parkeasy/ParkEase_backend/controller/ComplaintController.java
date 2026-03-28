package com.parkeasy.ParkEase_backend.controller;

import com.parkeasy.ParkEase_backend.entity.Complaint;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.repository.ComplaintRepository;
import com.parkeasy.ParkEase_backend.repository.UsersRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
 
@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

	private final ComplaintRepository complaintRepository;
	private final UsersRepository usersRepository;

	public ComplaintController(ComplaintRepository complaintRepository, UsersRepository usersRepository) {
		this.complaintRepository = complaintRepository;
		this.usersRepository = usersRepository;
	}

	/**
	 * User: Create a complaint
	 */
	@PostMapping
	public ResponseEntity<?> createComplaint(Authentication authentication, @RequestBody Map<String, String> payload) {
		try {
			Integer userId = getUserIdFromAuth(authentication);
			Users user = usersRepository.findById(userId)
					.orElseThrow(() -> new RuntimeException("User not found"));

			String subject = payload.get("subject");
			String description = payload.get("description");

			if (subject == null || subject.isBlank() || description == null || description.isBlank()) {
				return ResponseEntity.badRequest().body(Map.of("error", "Subject and description are required"));
			}

			Complaint complaint = new Complaint();
			complaint.setUser(user);
			complaint.setSubject(subject.trim());
			complaint.setDescription(description.trim());
			complaint.setStatus("OPEN");

			Complaint saved = complaintRepository.save(complaint);
			return ResponseEntity.status(HttpStatus.CREATED).body(toMap(saved));
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}

	/**
	 * User: Get my complaints
	 */
	@GetMapping("/my-complaints")
	public ResponseEntity<List<Map<String, Object>>> getMyComplaints(Authentication authentication) {
		Integer userId = getUserIdFromAuth(authentication);
		List<Complaint> complaints = complaintRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
		return ResponseEntity.ok(complaints.stream().map(this::toMap).collect(Collectors.toList()));
	}

	/**
	 * Admin: Get all complaints
	 */
	@GetMapping("/all")
	public ResponseEntity<List<Map<String, Object>>> getAllComplaints() {
		List<Complaint> complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
		return ResponseEntity.ok(complaints.stream().map(this::toMap).collect(Collectors.toList()));
	}

	/**
	 * Admin: Respond to a complaint
	 */
	@PutMapping("/{complaintId}/respond")
	public ResponseEntity<?> respondToComplaint(@PathVariable("complaintId") Long complaintId,
			@RequestBody Map<String, String> payload) {
		try {
			Complaint complaint = complaintRepository.findById(complaintId)
					.orElseThrow(() -> new RuntimeException("Complaint not found"));

			String response = payload.get("adminResponse");
			String status = payload.get("status");

			if (response != null && !response.isBlank()) {
				complaint.setAdminResponse(response.trim());
			}
			if (status != null && !status.isBlank()) {
				complaint.setStatus(status.trim().toUpperCase());
			} else {
				complaint.setStatus("RESOLVED");
			}

			Complaint saved = complaintRepository.save(complaint);
			return ResponseEntity.ok(toMap(saved));
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}

	private Map<String, Object> toMap(Complaint c) {
		Map<String, Object> map = new HashMap<>();
		map.put("id", c.getId());
		map.put("subject", c.getSubject());
		map.put("description", c.getDescription());
		map.put("status", c.getStatus());
		map.put("adminResponse", c.getAdminResponse());
		map.put("createdAt", c.getCreatedAt());
		map.put("updatedAt", c.getUpdatedAt());
		if (c.getUser() != null) {
			map.put("userName", c.getUser().getFullName());
			map.put("userEmail", c.getUser().getEmail());
			map.put("userId", c.getUser().getUserId());
		}
		return map;
	}

	private Integer getUserIdFromAuth(Authentication authentication) {
		String username = authentication.getName();
		Users user = usersRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("User not found: " + username));
		return user.getUserId();
	}
}
