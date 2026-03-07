package com.parkeasy.ParkEase_backend.repository;

import com.parkeasy.ParkEase_backend.entity.PricingConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PricingConfigRepository extends JpaRepository<PricingConfig, Long> {
}
