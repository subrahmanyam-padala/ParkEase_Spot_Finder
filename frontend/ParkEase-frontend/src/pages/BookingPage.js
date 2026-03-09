import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar, Footer, LoadingSpinner, ErrorAlert } from '../components';

// Sample parking slots data
const PARKING_SLOTS = [
  { id: 1, number: 'A1', status: 'available', floor: 'Ground' },
  { id: 2, number: 'A2', status: 'available', floor: 'Ground' },
  { id: 3, number: 'A3', status: 'occupied', floor: 'Ground' },
  { id: 4, number: 'A4', status: 'available', floor: 'Ground' },
  { id: 5, number: 'A5', status: 'available', floor: 'Ground' },
  { id: 6, number: 'A6', status: 'occupied', floor: 'Ground' },
  { id: 7, number: 'A7', status: 'available', floor: 'Ground' },
  { id: 8, number: 'A8', status: 'available', floor: 'Ground' },
  { id: 9, number: 'B1', status: 'available', floor: 'Ground' },
  { id: 10, number: 'B2', status: 'occupied', floor: 'Ground' },
  { id: 11, number: 'B3', status: 'available', floor: 'Ground' },
  { id: 12, number: 'B4', status: 'available', floor: 'Ground' },
  { id: 13, number: 'B5', status: 'occupied', floor: 'Ground' },
  { id: 14, number: 'B6', status: 'available', floor: 'Ground' },
  { id: 15, number: 'B7', status: 'available', floor: 'Ground' },
  { id: 16, number: 'B8', status: 'occupied', floor: 'Ground' },
  { id: 17, number: 'C1', status: 'available', floor: 'Level 1' },
  { id: 18, number: 'C2', status: 'available', floor: 'Level 1' },
  { id: 19, number: 'C3', status: 'available', floor: 'Level 1' },
  { id: 20, number: 'C4', status: 'occupied', floor: 'Level 1' },
];

// Duration options
const DURATION_OPTIONS = [
  { hours: 1, price: 75, label: '1 Hour' },
  { hours: 2, price: 150, label: '2 Hours' },
  { hours: 3, price: 200, label: '3 Hours' },
  { hours: 4, price: 250, label: '4 Hours' },
];

const BookingPage = () => {
  const navigate = useNavigate();
  const { createBooking } = useApp();
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[1]); // Default 2 hours
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setSlots(PARKING_SLOTS);
      setLoading(false);
    }, 800);
  }, []);

  const availableCount = slots.filter((s) => s.status === 'available').length;
  const totalCount = slots.length;

  const handleSlotSelect = (slot) => {
    if (slot.status === 'occupied') return;
    setSelectedSlot(selectedSlot?.id === slot.id ? null : slot);
  };

  const handleBooking = () => {
    if (!selectedSlot) {
      setError('Please select a parking slot');
      return;
    }

    const now = Date.now();
    const expiresAt = new Date(now + selectedDuration.hours * 60 * 60 * 1000);

    const booking = {
      id: now,
      slot: selectedSlot.number,
      slotId: selectedSlot.id,
      duration: selectedDuration.hours,
      amount: selectedDuration.price,
      validUntil: expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      expiresAt: expiresAt.toISOString(),
      paid: false,
      createdAt: new Date().toISOString(),
    };

    createBooking(booking);
    navigate(`/pay/${booking.id}`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading available slots..." />;
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
      <Navbar />

      <div className="main-content flex-grow-1 py-4">
        <div className="container">
          {/* Header */}
          <div className="mb-4 fade-in">
            <h2 className="fw-bold" style={{ color: '#2C3E50' }}>
              <i className="bi bi-building me-2"></i>
              ABC City Mall Parking
            </h2>
            <div className="d-flex align-items-center mt-2">
              <span
                className="badge me-2 px-3 py-2"
                style={{ backgroundColor: '#27AE60' }}
              >
                <i
                  className="bi bi-circle-fill me-1"
                  style={{ fontSize: '0.5rem' }}
                ></i>
                {availableCount}/{totalCount} Available
              </span>
              <span className="text-muted small">
                <i className="bi bi-geo-alt me-1"></i>
                Andheri East
              </span>
            </div>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

          {/* Slot Legend */}
          <div className="card mb-4 fade-in">
            <div className="card-body py-3">
              <div className="d-flex justify-content-center gap-4 flex-wrap">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded me-2"
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: 'rgba(39, 174, 96, 0.15)',
                      border: '2px solid #27AE60',
                    }}
                  ></div>
                  <span className="small">Available</span>
                </div>
                <div className="d-flex align-items-center">
                  <div
                    className="rounded me-2"
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: 'rgba(231, 76, 60, 0.15)',
                      border: '2px solid #E74C3C',
                    }}
                  ></div>
                  <span className="small">Occupied</span>
                </div>
                <div className="d-flex align-items-center">
                  <div
                    className="rounded me-2"
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#00C4B4',
                    }}
                  ></div>
                  <span className="small">Selected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Slot Grid */}
          <div className="card mb-4 fade-in">
            <div className="card-header">
              <i className="bi bi-grid-3x3-gap me-2"></i>
              Select Your Parking Slot
            </div>
            <div className="card-body">
              <div className="slot-grid">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`slot ${
                      slot.status === 'occupied'
                        ? 'slot-occupied'
                        : selectedSlot?.id === slot.id
                        ? 'slot-selected'
                        : 'slot-available'
                    }`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <span className="slot-icon">
                      {slot.status === 'occupied' ? (
                        <i className="bi bi-x-circle-fill"></i>
                      ) : selectedSlot?.id === slot.id ? (
                        <i className="bi bi-check-circle-fill"></i>
                      ) : (
                        <i className="bi bi-car-front"></i>
                      )}
                    </span>
                    <span className="slot-number">{slot.number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Duration Selection */}
          <div className="card mb-4 fade-in">
            <div className="card-header">
              <i className="bi bi-clock me-2"></i>
              Select Duration
            </div>
            <div className="card-body">
              <div className="row g-2">
                {DURATION_OPTIONS.map((option) => (
                  <div key={option.hours} className="col-6 col-md-3">
                    <button
                      className={`btn w-100 duration-btn ${
                        selectedDuration.hours === option.hours
                          ? 'active btn-primary'
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => setSelectedDuration(option)}
                    >
                      <div className="fw-bold">{option.label}</div>
                      <small>₹{option.price}</small>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="card mb-4 fade-in">
            <div className="card-header">
              <i className="bi bi-receipt me-2"></i>
              Booking Summary
            </div>
            <div className="card-body">
              <div className="summary-row">
                <span>Selected Slot</span>
                <span className="fw-bold">
                  {selectedSlot ? selectedSlot.number : '-- Select --'}
                </span>
              </div>
              <div className="summary-row">
                <span>Duration</span>
                <span className="fw-bold">{selectedDuration.label}</span>
              </div>
              <div className="summary-row">
                <span>Parking Fee</span>
                <span className="fw-bold">₹{selectedDuration.price}</span>
              </div>
              <div className="summary-row">
                <span>Total Amount</span>
                <span>₹{selectedDuration.price}</span>
              </div>
            </div>
          </div>

          {/* Book Now Button */}
          <button
            className="btn btn-primary w-100 py-3 fade-in"
            onClick={handleBooking}
            disabled={!selectedSlot}
          >
            <i className="bi bi-check-circle me-2"></i>
            BOOK NOW - ₹{selectedDuration.price}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;
