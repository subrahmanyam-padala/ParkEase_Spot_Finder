package com.parkeasy.ParkEase_backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class ParkingBookingRequest {

	@NotBlank(message = "User name is required")
	private String user;

	private String userEmail;

	@NotBlank(message = "Slot is required")
	private String slot;

	private Long slotId;

	@NotNull(message = "Duration is required")
	@Min(value = 1, message = "Duration must be at least 1 hour")
	private Integer duration;

	@NotNull(message = "Amount is required")
	@DecimalMin(value = "0.0", inclusive = true, message = "Amount must be 0 or more")
	private BigDecimal amount;

	@NotNull(message = "Price per hour is required")
	@DecimalMin(value = "0.0", inclusive = true, message = "Price per hour must be 0 or more")
	private BigDecimal pricePerHour;

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getUserEmail() {
		return userEmail;
	}

	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}

	public String getSlot() {
		return slot;
	}

	public void setSlot(String slot) {
		this.slot = slot;
	}

	public Long getSlotId() {
		return slotId;
	}

	public void setSlotId(Long slotId) {
		this.slotId = slotId;
	}

	public Integer getDuration() {
		return duration;
	}

	public void setDuration(Integer duration) {
		this.duration = duration;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	public BigDecimal getPricePerHour() {
		return pricePerHour;
	}

	public void setPricePerHour(BigDecimal pricePerHour) {
		this.pricePerHour = pricePerHour;
	}
}
