package com.parkeasy.ParkEase_backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AdminOverviewResponse {

	private long totalParkingSlots;
	private long occupiedSlots;
	private long availableSlots;
	private BigDecimal totalRevenue;
	private BigDecimal todayRevenue;
	private BigDecimal monthRevenue;
	private long bookingsCount;
	private long usersCount;
	private long paidCount;
	private long pendingCount;
	private List<Map<String, Object>> weeklyRevenue;
	private List<Map<String, Object>> slotColumns;
	private List<Map<String, Object>> bookingsRows;
	private List<Map<String, Object>> usersRows;
	private List<Map<String, Object>> paymentSplit;

	public long getTotalParkingSlots() {
		return totalParkingSlots;
	}

	public void setTotalParkingSlots(long totalParkingSlots) {
		this.totalParkingSlots = totalParkingSlots;
	}

	public long getOccupiedSlots() {
		return occupiedSlots;
	}

	public void setOccupiedSlots(long occupiedSlots) {
		this.occupiedSlots = occupiedSlots;
	}

	public long getAvailableSlots() {
		return availableSlots;
	}

	public void setAvailableSlots(long availableSlots) {
		this.availableSlots = availableSlots;
	}

	public BigDecimal getTotalRevenue() {
		return totalRevenue;
	}

	public void setTotalRevenue(BigDecimal totalRevenue) {
		this.totalRevenue = totalRevenue;
	}

	public BigDecimal getTodayRevenue() {
		return todayRevenue;
	}

	public void setTodayRevenue(BigDecimal todayRevenue) {
		this.todayRevenue = todayRevenue;
	}

	public BigDecimal getMonthRevenue() {
		return monthRevenue;
	}

	public void setMonthRevenue(BigDecimal monthRevenue) {
		this.monthRevenue = monthRevenue;
	}

	public long getBookingsCount() {
		return bookingsCount;
	}

	public void setBookingsCount(long bookingsCount) {
		this.bookingsCount = bookingsCount;
	}

	public long getUsersCount() {
		return usersCount;
	}

	public void setUsersCount(long usersCount) {
		this.usersCount = usersCount;
	}

	public long getPaidCount() {
		return paidCount;
	}

	public void setPaidCount(long paidCount) {
		this.paidCount = paidCount;
	}

	public long getPendingCount() {
		return pendingCount;
	}

	public void setPendingCount(long pendingCount) {
		this.pendingCount = pendingCount;
	}

	public List<Map<String, Object>> getWeeklyRevenue() {
		return weeklyRevenue;
	}

	public void setWeeklyRevenue(List<Map<String, Object>> weeklyRevenue) {
		this.weeklyRevenue = weeklyRevenue;
	}

	public List<Map<String, Object>> getSlotColumns() {
		return slotColumns;
	}

	public void setSlotColumns(List<Map<String, Object>> slotColumns) {
		this.slotColumns = slotColumns;
	}

	public List<Map<String, Object>> getBookingsRows() {
		return bookingsRows;
	}

	public void setBookingsRows(List<Map<String, Object>> bookingsRows) {
		this.bookingsRows = bookingsRows;
	}

	public List<Map<String, Object>> getUsersRows() {
		return usersRows;
	}

	public void setUsersRows(List<Map<String, Object>> usersRows) {
		this.usersRows = usersRows;
	}

	public List<Map<String, Object>> getPaymentSplit() {
		return paymentSplit;
	}

	public void setPaymentSplit(List<Map<String, Object>> paymentSplit) {
		this.paymentSplit = paymentSplit;
	}
}
