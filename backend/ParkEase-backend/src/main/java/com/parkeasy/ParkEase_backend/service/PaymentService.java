package com.parkeasy.ParkEase_backend.service;

import com.parkeasy.ParkEase_backend.dto.PaymentRequestDTO;
import com.parkeasy.ParkEase_backend.dto.PaymentResponseDTO;
import com.parkeasy.ParkEase_backend.dto.PaymentVerifyDTO;

import java.util.List;

public interface PaymentService {

  PaymentResponseDTO createPaymentOrder(Integer userId, PaymentRequestDTO requestDTO);

  PaymentResponseDTO createOverstayPaymentOrder(Integer userId, PaymentRequestDTO requestDTO);

  PaymentResponseDTO createExtensionPaymentOrder(Integer userId, PaymentRequestDTO requestDTO);

  PaymentResponseDTO verifyPayment(PaymentVerifyDTO verifyDTO);

  List<PaymentResponseDTO> getPaymentsByUserId(Integer userId);

  List<PaymentResponseDTO> getPaymentsByBookingId(Long bookingId);

  PaymentResponseDTO getPaymentById(Long paymentId);
}
