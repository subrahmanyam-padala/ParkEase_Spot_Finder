package com.parkeasy.ParkEase_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "complaint_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private Users user;

	@Column(name = "subject", nullable = false)
	private String subject;

	@Column(name = "description", nullable = false, columnDefinition = "TEXT")
	private String description;

	@Column(name = "status", nullable = false, length = 30)
	private String status = "OPEN";

	@Column(name = "admin_response", columnDefinition = "TEXT")
	private String adminResponse;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@PrePersist
	protected void onCreate() {
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
		if (this.status == null || this.status.isBlank()) {
			this.status = "OPEN";
		}
	}

	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = LocalDateTime.now();
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public Users getUser() { return user; }
	public void setUser(Users user) { this.user = user; }

	public String getSubject() { return subject; }
	public void setSubject(String subject) { this.subject = subject; }

	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }

	public String getStatus() { return status; }
	public void setStatus(String status) { this.status = status; }

	public String getAdminResponse() { return adminResponse; }
	public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
