package com.parkeasy.ParkEase_backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class ParkingSlotRequest {

	@NotBlank(message = "Slot number is required")
	private String number;

	@NotBlank(message = "Floor is required")
	private String floor;

	@NotBlank(message = "Status is required")
	private String status;

	@NotNull(message = "Price per hour is required")
	@DecimalMin(value = "0.0", inclusive = true, message = "Price must be 0 or more")
	private BigDecimal pricePerHour;

	public String getNumber() {
		return number;
	}

	public void setNumber(String number) {
		this.number = number;
	}

	public String getFloor() {
		return floor;
	}

	public void setFloor(String floor) {
		this.floor = floor;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public BigDecimal getPricePerHour() {
		return pricePerHour;
	}

	public void setPricePerHour(BigDecimal pricePerHour) {
		this.pricePerHour = pricePerHour;
	}
}
