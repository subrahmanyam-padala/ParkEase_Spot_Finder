package com.parkeasy.ParkEase_backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

	// 1️ Get All Users
	@GetMapping
	public ResponseEntity<List<Users>> getAllUsers() {
		return ResponseEntity.ok(usersService.getAllUsers());
	}

	// 2 Get user by User_id
	@GetMapping("/{user_id}")
	public ResponseEntity<Optional<Users>> getUserById(@PathVariable int user_id) {
		Optional<Users> users = usersService.getAllUsers(user_id);
		return ResponseEntity.ok(users);
	}

	// 3 Register User
	@PostMapping
	public ResponseEntity<Users> createUser(@RequestBody UsersRequestDTO usersRequestDTO) {
		return ResponseEntity.ok(usersService.createUsers(usersRequestDTO));
	}

	// 4 Login (Structure Ready – Service will implement)
	@PostMapping("/login")
	public ResponseEntity<String> login(@RequestBody UsersRequestDTO loginDTO) {
		return ResponseEntity.ok("Login API Ready");
	}
}
