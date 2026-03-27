package com.parkeasy.ParkEase_backend.service;

import com.parkeasy.ParkEase_backend.dto.AdminOverviewResponse;
import com.parkeasy.ParkEase_backend.dto.ParkingSlotRequest;
import com.parkeasy.ParkEase_backend.entity.AdminAlert;
import com.parkeasy.ParkEase_backend.entity.AdminUser;
import com.parkeasy.ParkEase_backend.entity.ParkingSlot;
import com.parkeasy.ParkEase_backend.entity.Users;

import java.util.List;
import java.util.Map;

public interface AdminManagementService {

	AdminOverviewResponse getOverview();

	List<ParkingSlot> getAllSlots();

	ParkingSlot createSlot(ParkingSlotRequest request);

	ParkingSlot updateSlot(Long slotId, ParkingSlotRequest request);

	List<Map<String, Object>> getAllBookings();

	List<Users> getAllUsers();

	List<AdminUser> getAllAdminUsers();

	Map<String, Object> getRevenueSummary();

	Map<String, Object> getReportsSummary();

	List<Map<String, Object>> getRefundRequests();

	Map<String, Object> updateRefundStatus(Long bookingId, String status);

	List<AdminAlert> getActiveAlerts();

	void dismissAlert(Long alertId);
}
