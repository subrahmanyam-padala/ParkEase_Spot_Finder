package com.parkeasy.ParkEase_backend.serviceImpl;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.parkeasy.ParkEase_backend.dto.UsersRequestDTO;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.repository.UsersRepository;
import com.parkeasy.ParkEase_backend.service.UsersService;

@Service
public class UsersServiceImpl implements UsersService {

	private final UsersRepository usersRepository;
	private final PasswordEncoder passwordEncoder;

	public UsersServiceImpl(UsersRepository usersRepository, PasswordEncoder passwordEncoder) {
		this.usersRepository = usersRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public List<Users> getAllUsers() {
		return usersRepository.findAll();
	}

	@Override
	public Optional<Users> getAllUsers(int user_id) {
		return usersRepository.findById(user_id);
	}

	@Override
	public Users createUsers(UsersRequestDTO usersRequestDTO) {
		// Check if username already exists
		if (usersRepository.existsByUsername(usersRequestDTO.getUsername())) {
			throw new RuntimeException("Username already exists");
		}

		// Check if email already exists
		if (usersRepository.existsByEmail(usersRequestDTO.getEmail())) {
			throw new RuntimeException("Email already exists");
		}

		Users users = new Users();
		users.setFullName(usersRequestDTO.getFullName());
		users.setUsername(usersRequestDTO.getUsername());
		users.setPassword(passwordEncoder.encode(usersRequestDTO.getPassword()));
		users.setEmail(usersRequestDTO.getEmail());

		return usersRepository.save(users);
	}

}
