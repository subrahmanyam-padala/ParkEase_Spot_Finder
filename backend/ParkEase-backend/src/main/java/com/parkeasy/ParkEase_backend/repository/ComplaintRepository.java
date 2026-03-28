package com.parkeasy.ParkEase_backend.repository;

import com.parkeasy.ParkEase_backend.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

	List<Complaint> findByUserUserIdOrderByCreatedAtDesc(Integer userId);

	List<Complaint> findAllByOrderByCreatedAtDesc();

	List<Complaint> findByStatusOrderByCreatedAtDesc(String status);
}
