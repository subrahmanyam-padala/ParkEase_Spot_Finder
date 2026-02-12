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

	@GetMapping
	public ResponseEntity<List<Users>> getAllUsers() {
		List<Users> users = usersService.getAllUsers();
		return ResponseEntity.ok(users);
	}

	@GetMapping("/{user_id}")
	public ResponseEntity<Optional<Users>> getUserById(@PathVariable int user_id) {
		Optional<Users> users = usersService.getAllUsers(user_id);
		return ResponseEntity.ok(users);
	}
	@PostMapping
	public ResponseEntity<Users> createUsers(@RequestBody UsersRequestDTO usersRequestDTO) {
		Users users = usersService.createUsers(usersRequestDTO);
		return ResponseEntity.ok(users);
	}
}
