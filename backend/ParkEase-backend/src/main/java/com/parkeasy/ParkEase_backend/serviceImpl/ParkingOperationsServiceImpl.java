package com.parkeasy.ParkEase_backend.serviceImpl;

import com.parkeasy.ParkEase_backend.dto.ParkingBookingRequest;
import com.parkeasy.ParkEase_backend.entity.ParkingBooking;
import com.parkeasy.ParkEase_backend.entity.ParkingSlot;
import com.parkeasy.ParkEase_backend.repository.ParkingBookingRepository;
import com.parkeasy.ParkEase_backend.repository.ParkingSlotRepository;
import com.parkeasy.ParkEase_backend.service.ParkingOperationsService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class ParkingOperationsServiceImpl implements ParkingOperationsService {

	private final ParkingSlotRepository parkingSlotRepository;
	private final ParkingBookingRepository parkingBookingRepository;

	public ParkingOperationsServiceImpl(ParkingSlotRepository parkingSlotRepository,
			ParkingBookingRepository parkingBookingRepository) {
		this.parkingSlotRepository = parkingSlotRepository;
		this.parkingBookingRepository = parkingBookingRepository;
	}

	@Override
	public List<ParkingSlot> getSlots() {
		return parkingSlotRepository.findAll().stream().sorted(Comparator.comparing(ParkingSlot::getNumber)).toList();
	}

	@Override
	public List<ParkingBooking> getBookings() {
		return parkingBookingRepository.findAll().stream()
				.sorted(Comparator.comparing(ParkingBooking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
				.toList();
	}

	@Override
	public ParkingBooking createBooking(ParkingBookingRequest request) {
		ParkingSlot slot = parkingSlotRepository.findById(request.getSlotId())
				.orElseThrow(() -> new RuntimeException("Parking slot not found"));

		if ("occupied".equalsIgnoreCase(slot.getStatus())) {
			throw new RuntimeException("Selected slot is already occupied");
		}

		ParkingBooking booking = new ParkingBooking();
		booking.setUserName(request.getUser().trim());
		booking.setUserEmail(request.getUserEmail() == null ? "" : request.getUserEmail().trim());
		booking.setSlot(request.getSlot().trim().toUpperCase());
		booking.setSlotId(request.getSlotId());
		booking.setDuration(request.getDuration());
		booking.setAmount(request.getAmount());
		booking.setPricePerHour(request.getPricePerHour());
		booking.setPaid(Boolean.FALSE);
		booking.setValidUntil(LocalDateTime.now().plusHours(request.getDuration()));

		slot.setStatus("occupied");
		parkingSlotRepository.save(slot);

		return parkingBookingRepository.save(booking);
	}

	@Override
	public ParkingBooking markBookingPaid(Long bookingId, String paymentMethod) {
		ParkingBooking booking = parkingBookingRepository.findById(bookingId)
				.orElseThrow(() -> new RuntimeException("Booking not found"));
		booking.setPaid(Boolean.TRUE);
		booking.setPaymentMethod(paymentMethod);
		return parkingBookingRepository.save(booking);
	}
}
