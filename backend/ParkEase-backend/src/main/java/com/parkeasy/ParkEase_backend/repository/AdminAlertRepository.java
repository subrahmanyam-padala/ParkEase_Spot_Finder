package com.parkeasy.ParkEase_backend.repository;

import com.parkeasy.ParkEase_backend.entity.AdminAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminAlertRepository extends JpaRepository<AdminAlert, Long> {

	List<AdminAlert> findByStatusOrderByCreatedAtDesc(String status);
}
