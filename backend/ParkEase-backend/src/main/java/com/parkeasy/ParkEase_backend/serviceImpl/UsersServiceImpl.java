package com.parkeasy.ParkEase_backend.serviceImpl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.parkeasy.ParkEase_backend.dto.UsersRequestDTO;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.repository.UsersRepository;
import com.parkeasy.ParkEase_backend.service.UsersService;

@Service
public class UsersServiceImpl implements UsersService {

	private final UsersRepository usersRepository;

	public UsersServiceImpl(UsersRepository usersRepository) {
		this.usersRepository = usersRepository;
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
		Users users = new Users();
		users.setUsername(usersRequestDTO.getUsername());
		users.setPassword(usersRequestDTO.getPassword());
		users.setEmail(usersRequestDTO.getEmail());

		return usersRepository.save(users);
	}

}
