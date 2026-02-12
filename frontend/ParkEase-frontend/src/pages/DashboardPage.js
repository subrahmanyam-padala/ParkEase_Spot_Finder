import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar, Footer, LiveCounter, LoadingSpinner } from '../components';

const DashboardPage = () => {
  const { user, bookings } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const currentBooking = bookings.length > 0 ? bookings[bookings.length - 1] : null;

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
      <Navbar />

      <div className="main-content flex-grow-1 py-4">
        <div className="container">
          {/* Welcome Header */}
          <div className="mb-4 fade-in">
            <h2 className="fw-bold" style={{ color: '#2C3E50' }}>
              Welcome, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p className="text-muted">ABC City Mall Parking Dashboard</p>
          </div>

          {/* Live Counter Card */}
          <div className="mb-4 fade-in">
            <div className="live-counter">
              <LiveCounter available={325} total={500} compact />
            </div>
          </div>

          {/* Current Booking Card */}
          {currentBooking && (
            <div className="card mb-4 fade-in">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>
                  <i className="bi bi-ticket-perforated me-2"></i>
                  Current Booking
                </span>
                <span className="status-badge status-active">Active</span>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <p className="text-muted small mb-1">Slot Number</p>
                    <p className="fw-bold mb-0 fs-4" style={{ color: '#00C4B4' }}>
                      {currentBooking.slot}
                    </p>
                  </div>
                  <div className="col-6">
                    <p className="text-muted small mb-1">Duration</p>
                    <p className="fw-bold mb-0">{currentBooking.duration} Hours</p>
                  </div>
                  <div className="col-6">
                    <p className="text-muted small mb-1">Valid Until</p>
                    <p className="fw-bold mb-0">{currentBooking.validUntil}</p>
                  </div>
                  <div className="col-6">
                    <p className="text-muted small mb-1">Amount Paid</p>
                    <p className="fw-bold mb-0">₹{currentBooking.amount}</p>
                  </div>
                </div>
                <hr />
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate(`/ticket/${currentBooking.id}`)}
                >
                  <i className="bi bi-qr-code me-2"></i>
                  View Ticket
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="row g-3 fade-in">
            <div className="col-12 col-md-6">
              <div
                className="card h-100 quick-action-card"
                onClick={() => navigate('/book')}
              >
                <div className="card-body text-center py-4">
                  <div
                    className="quick-action-icon"
                    style={{ backgroundColor: 'rgba(0, 196, 180, 0.15)' }}
                  >
                    <i
                      className="bi bi-plus-circle"
                      style={{ fontSize: '2rem', color: '#00C4B4' }}
                    ></i>
                  </div>
                  <h5 className="fw-bold mb-1" style={{ color: '#2C3E50' }}>
                    Book New Slot
                  </h5>
                  <p className="text-muted small mb-0">Reserve parking space</p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div
                className="card h-100 quick-action-card"
                onClick={() =>
                  currentBooking && navigate(`/ticket/${currentBooking.id}`)
                }
              >
                <div className="card-body text-center py-4">
                  <div
                    className="quick-action-icon"
                    style={{ backgroundColor: 'rgba(39, 174, 96, 0.15)' }}
                  >
                    <i
                      className="bi bi-ticket-perforated"
                      style={{ fontSize: '2rem', color: '#27AE60' }}
                    ></i>
                  </div>
                  <h5 className="fw-bold mb-1" style={{ color: '#2C3E50' }}>
                    My Tickets
                  </h5>
                  <p className="text-muted small mb-0">View all parking tickets</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking History */}
          {bookings.length > 0 && (
            <div className="mt-4 fade-in">
              <h5 className="fw-bold mb-3" style={{ color: '#2C3E50' }}>
                <i className="bi bi-clock-history me-2"></i>
                Recent Bookings
              </h5>
              {bookings
                .slice()
                .reverse()
                .map((booking) => (
                  <div key={booking.id} className="card mb-2 booking-history-item">
                    <div className="card-body py-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-bold" style={{ color: '#00C4B4' }}>
                            Slot {booking.slot}
                          </span>
                          <span className="text-muted ms-2">
                            • {booking.duration}h • ₹{booking.amount}
                          </span>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/ticket/${booking.id}`)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;
