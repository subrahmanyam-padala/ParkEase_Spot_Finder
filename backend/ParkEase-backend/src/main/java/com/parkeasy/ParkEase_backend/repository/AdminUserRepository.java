package com.parkeasy.ParkEase_backend.repository;

import com.parkeasy.ParkEase_backend.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

	Optional<AdminUser> findByEmail(String email);

	Optional<AdminUser> findByAdminId(String adminId);

	boolean existsByEmail(String email);

	boolean existsByAdminId(String adminId);
}
