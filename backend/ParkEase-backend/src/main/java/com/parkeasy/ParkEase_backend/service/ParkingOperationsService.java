package com.parkeasy.ParkEase_backend.service;

import com.parkeasy.ParkEase_backend.dto.ParkingBookingRequest;
import com.parkeasy.ParkEase_backend.entity.ParkingBooking;
import com.parkeasy.ParkEase_backend.entity.ParkingSlot;

import java.util.List;

public interface ParkingOperationsService {

	List<ParkingSlot> getSlots();

	List<ParkingBooking> getBookings();

	ParkingBooking createBooking(ParkingBookingRequest request);

	ParkingBooking markBookingPaid(Long bookingId, String paymentMethod);
}
