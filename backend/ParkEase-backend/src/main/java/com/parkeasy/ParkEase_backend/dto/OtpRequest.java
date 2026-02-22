package com.parkeasy.ParkEase_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class OtpRequest {

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Must be a valid email format")
    private String email;

    public OtpRequest() {
    }

    public OtpRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
