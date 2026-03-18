package com.parkeasy.ParkEase_backend.serviceImpl;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.parkeasy.ParkEase_backend.dto.UsersRequestDTO;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.repository.UsersRepository;
import com.parkeasy.ParkEase_backend.service.UsersService;

/**
 * @author Atharv Ital
 */
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
	public Optional<Users> getUserById(int user_id) {
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

	@Override
	public Users findByUsername(String username) {
		return usersRepository.findByUsername(username).orElse(null);
	}

	@Override
	public Users findByEmail(String email) {
		return usersRepository.findByEmail(email).orElse(null);
	}

	@Override
	public void updatePassword(Users user, String rawPassword) {
		user.setPassword(passwordEncoder.encode(rawPassword));
		usersRepository.save(user);
	}

}
