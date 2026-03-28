package com.parkeasy.ParkEase_backend.dto;

import jakarta.validation.constraints.NotBlank;

public class PaymentUpdateRequest {

	@NotBlank(message = "Payment method is required")
	private String paymentMethod;

	public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}
}
