package com.parkeasy.ParkEase_backend.repository;

import com.parkeasy.ParkEase_backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author Atharv Ital
 */
@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {

	/**
	 * Finding the User by using username
	 * 
	 * @param username
	 * @return
	 */
	Optional<Users> findByUsername(String username);

	/**
	 * Finding the User by using email
	 * 
	 * @param email
	 * @return
	 */
	Optional<Users> findByEmail(String email);

	/**
	 * Checking weather User is exist with the username
	 * 
	 * @param username
	 * @return
	 */
	boolean existsByUsername(String username);

	/**
	 * Checking weather User is exist with the email
	 * 
	 * @param email
	 * @return
	 */
	boolean existsByEmail(String email);
}
