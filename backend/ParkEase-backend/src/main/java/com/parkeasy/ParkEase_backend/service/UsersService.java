package com.parkeasy.ParkEase_backend.service;

import java.util.List;
import java.util.Optional;

import com.parkeasy.ParkEase_backend.dto.UsersRequestDTO;
import com.parkeasy.ParkEase_backend.entity.Users;

/**
 * @author Atharv Ital
 */
public interface UsersService {
	/**
	 * It will return all the users in the database
	 * 
	 * @return
	 */
	List<Users> getAllUsers();

	/**
	 * Get the user by using user_id
	 * 
	 * @param user_id
	 * 
	 *                It will return specific user
	 * @return
	 */
	Optional<Users> getUserById(int user_id);

	/**
	 * Creating the user in the database
	 * 
	 * @param usersRequestDTO
	 * 
	 *                        It will returns the same user
	 * @return
	 */
	Users createUsers(UsersRequestDTO usersRequestDTO);

	/**
	 * Find user by username
	 */
	Users findByUsername(String username);
}
