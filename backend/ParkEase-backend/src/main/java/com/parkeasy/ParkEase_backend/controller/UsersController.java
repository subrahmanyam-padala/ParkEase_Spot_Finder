package com.parkeasy.ParkEase_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.parkeasy.ParkEase_backend.dto.UsersRequestDTO;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.service.UsersService;

@RestController
@RequestMapping("/api/users")
public class UsersController {

	private final UsersService usersService;

	public UsersController(UsersService usersService) {
		this.usersService = usersService;
	}

	// 1️⃣ Get All Users
	@GetMapping
	public ResponseEntity<List<Users>> getAllUsers() {
		return ResponseEntity.ok(usersService.getAllUsers());
	}

	// 2️⃣ Register User
	@PostMapping
	public ResponseEntity<Users> createUser(@RequestBody UsersRequestDTO usersRequestDTO) {
		return ResponseEntity.ok(usersService.createUsers(usersRequestDTO));
	}

	// 3️⃣ Login (Structure Ready – Service will implement)
	@PostMapping("/login")
	public ResponseEntity<String> login(@RequestBody UsersRequestDTO loginDTO) {
		return ResponseEntity.ok("Login API Ready");
	}
}
