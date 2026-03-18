import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar, Footer, LoadingSpinner, ErrorAlert } from '../components';
import BottomNav from '../components/BottomNav';
import { getAvailableSpots, createBooking as createBookingApi } from '../utils/api';

const DURATION_OPTIONS = [
  { hours: 1, label: '1 Hour' },
  { hours: 2, label: '2 Hours' },
  { hours: 3, label: '3 Hours' },
  { hours: 4, label: '4 Hours' },
];

const BookingPage = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[1]);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedRate = Number(selectedSpot?.pricePerHour) || 0;
  const estimatedAmount = selectedRate * selectedDuration.hours;

  useEffect(() => {
    loadSpots();
  }, []);

  const loadSpots = async () => {
    try {
      const res = await getAvailableSpots();
      setSpots(res.data || []);
    } catch {
      setSpots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpotSelect = (spot) => {
    setSelectedSpot(selectedSpot?.spotId === spot.spotId ? null : spot);
  };

  const handleBooking = async () => {
    if (!selectedSpot) {
      setError('Please select a parking spot');
      return;
    }
    if (!vehicleNumber.trim()) {
      setError('Please enter your vehicle number');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await createBookingApi({
        spotId: selectedSpot.spotId,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        durationHours: selectedDuration.hours,
      });
      const booking = res.data;
      navigate(`/payment/${booking.bookingId}`, { state: booking });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading available slots..." />;
  }

  return (
    <div className="mobile-page-wrapper">
      <Navbar />

      <div className="main-content mobile-content flex-grow-1 py-4">
        <div className="container">
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
                {spots.length} Available
              </span>
              <span className="text-muted small">
                <i className="bi bi-geo-alt me-1"></i>
                Andheri East
              </span>
            </div>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

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
                      backgroundColor: '#00C4B4',
                    }}
                  ></div>
                  <span className="small">Selected</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4 fade-in">
            <div className="card-header">
              <i className="bi bi-grid-3x3-gap me-2"></i>
              Select Your Parking Spot
            </div>
            <div className="card-body">
              <div className="slot-grid">
                {spots.map((spot) => (
                  <div
                    key={spot.spotId}
                    className={`slot ${
                      selectedSpot?.spotId === spot.spotId
                        ? 'slot-selected'
                        : 'slot-available'
                    }`}
                    onClick={() => handleSpotSelect(spot)}
                  >
                    <span className="slot-icon">
                      {selectedSpot?.spotId === spot.spotId ? (
                        <i className="bi bi-check-circle-fill"></i>
                      ) : (
                        <i className="bi bi-car-front"></i>
                      )}
                    </span>
                    <span className="slot-number">{spot.spotLabel}</span>
                    <small>{spot.zone}</small>
                  </div>
                ))}
              </div>
              {spots.length === 0 && !loading && (
                <p className="text-center text-muted py-3">No available spots right now</p>
              )}
            </div>
          </div>

          {/* Vehicle Number */}
          <div className="card mb-4 fade-in">
            <div className="card-header">
              <i className="bi bi-car-front me-2"></i>
              Vehicle Details
            </div>
            <div className="card-body">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Vehicle Number (e.g., MH01AB1234)"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

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
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card mb-4 fade-in">
            <div className="card-header">
              <i className="bi bi-receipt me-2"></i>
              Booking Summary
            </div>
            <div className="card-body">
              <div className="summary-row">
                <span>Selected Spot</span>
                <span className="fw-bold">
                  {selectedSpot ? `${selectedSpot.spotLabel} (${selectedSpot.zone})` : '-- Select --'}
                </span>
              </div>
              <div className="summary-row">
                <span>Vehicle Number</span>
                <span className="fw-bold">
                  {vehicleNumber || '-- Enter --'}
                </span>
              </div>
              <div className="summary-row">
                <span>Duration</span>
                <span className="fw-bold">{selectedDuration.label}</span>
              </div>
              <div className="summary-row">
                <span>Rate / Hour</span>
                <span className="fw-bold">₹{selectedSpot ? selectedRate : 0}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Amount</span>
                <span className="fw-bold">₹{selectedSpot ? estimatedAmount : 0}</span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary w-100 py-3 fade-in"
            onClick={handleBooking}
            disabled={!selectedSpot || !vehicleNumber.trim() || submitting}
          >
            {submitting ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Booking...</>
            ) : (
              <><i className="bi bi-check-circle me-2"></i>BOOK NOW</>
            )}
          </button>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default BookingPage;
