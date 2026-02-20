package com.parkeasy.ParkEase_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UsersRequestDTO {
	@NotBlank(message = "Full name cannot be blank")
	private String fullName;

	@NotBlank(message = "Username cannot be blank")
	@Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
	private String username;

	@NotBlank(message = "Password cannot be blank")
	@Size(min = 8, message = "Password must be at least 8 characters long")
	private String password;

	@NotBlank(message = "Email cannot be blank")
	@Email(message = "Must be a valid email format")
	private String email;

	public UsersRequestDTO() {

	}

	public UsersRequestDTO(@NotBlank(message = "Full name cannot be blank") String fullName,
						   @NotBlank(message = "Username cannot be blank") @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String username,
						   @NotBlank(message = "Password cannot be blank") @Size(min = 8, message = "Password must be at least 8 characters long") String password,
						   @NotBlank(message = "Email cannot be blank") @Email(message = "Must be a valid email format") String email) {
		super();
		this.fullName = fullName;
		this.username = username;
		this.password = password;
		this.email = email;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

}
