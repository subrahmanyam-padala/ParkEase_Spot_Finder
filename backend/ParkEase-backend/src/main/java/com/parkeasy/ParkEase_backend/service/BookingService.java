package com.parkeasy.ParkEase_backend.service;

import com.parkeasy.ParkEase_backend.dto.BookingRequestDTO;
import com.parkeasy.ParkEase_backend.dto.BookingResponseDTO;

import java.util.List;

public interface BookingService {

  BookingResponseDTO createBooking(Integer userId, BookingRequestDTO requestDTO);

  BookingResponseDTO getBookingById(Long bookingId);

  BookingResponseDTO getBookingByTicketNumber(String ticketNumber);

  List<BookingResponseDTO> getBookingsByUserId(Integer userId);

  List<BookingResponseDTO> getActiveBookingsByUserId(Integer userId);

  List<BookingResponseDTO> getAllActiveBookings();

  BookingResponseDTO completeBooking(Long bookingId);

  BookingResponseDTO cancelBooking(Long bookingId);

  void autoCompleteExpiredBookings();
}
