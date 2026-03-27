package com.parkeasy.ParkEase_backend.repository;

import com.parkeasy.ParkEase_backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

  Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

  Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

  Optional<Payment> findByTransactionId(String transactionId);

  List<Payment> findByBookingBookingId(Long bookingId);

  List<Payment> findByBookingBookingIdAndStatus(Long bookingId, String status);

  List<Payment> findByUserUserId(Integer userId);

  List<Payment> findByStatus(String status);
}
