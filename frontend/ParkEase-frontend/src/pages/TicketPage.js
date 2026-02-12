import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar, Footer, LoadingSpinner } from '../components';

const TicketPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookings } = useApp();
  const [pageLoading, setPageLoading] = useState(true);

  const booking = bookings.find((b) => b.id === parseInt(bookingId));

  useEffect(() => {
    setTimeout(() => setPageLoading(false), 600);
  }, []);

  if (pageLoading) {
    return <LoadingSpinner message="Generating your ticket..." />;
  }

  if (!booking) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center p-4">
            <i
              className="bi bi-ticket-perforated text-muted"
              style={{ fontSize: '4rem' }}
            ></i>
            <h4 className="mt-3">Ticket Not Found</h4>
            <p className="text-muted">The booking you're looking for doesn't exist.</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleDownload = () => {
    alert('PDF Download functionality would be implemented here with a library like jsPDF');
  };

  const handleNavigate = () => {
    window.open('https://maps.google.com/?q=ABC+City+Mall+Andheri+East+Mumbai', '_blank');
  };

  const ticketDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
      <Navbar />

      <div className="main-content flex-grow-1 py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              {/* Success Message */}
              <div className="text-center mb-4 fade-in">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'rgba(39, 174, 96, 0.15)',
                  }}
                >
                  <i
                    className="bi bi-check-lg"
                    style={{ fontSize: '3rem', color: '#27AE60' }}
                  ></i>
                </div>
                <h3 className="fw-bold" style={{ color: '#27AE60' }}>
                  Booking Confirmed!
                </h3>
                <p className="text-muted">Your parking slot has been reserved</p>
              </div>

              {/* Ticket */}
              <div className="ticket fade-in">
                {/* Ticket Header */}
                <div className="ticket-header">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <i
                      className="bi bi-ticket-perforated-fill me-2"
                      style={{ fontSize: '1.5rem' }}
                    ></i>
                    <span className="fs-4 fw-bold">PARKING TICKET</span>
                  </div>
                  <p className="mb-0 opacity-75">
                    <i className="bi bi-building me-1"></i>
                    ABC City Mall
                  </p>
                </div>

                {/* Ticket Body */}
                <div className="ticket-body">
                  {/* Slot Info */}
                  <div className="text-center mb-4">
                    <p className="text-muted small mb-1">Slot Number</p>
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-3 px-4 py-3"
                      style={{ backgroundColor: 'rgba(0, 196, 180, 0.1)' }}
                    >
                      <span
                        className="fw-bold"
                        style={{ fontSize: '3rem', color: '#00C4B4' }}
                      >
                        {booking.slot}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="row g-3 mb-4">
                    <div className="col-6 text-center">
                      <p className="text-muted small mb-1">
                        <i className="bi bi-calendar me-1"></i> Date
                      </p>
                      <p className="fw-bold mb-0">{ticketDate}</p>
                    </div>
                    <div className="col-6 text-center">
                      <p className="text-muted small mb-1">
                        <i className="bi bi-clock me-1"></i> Duration
                      </p>
                      <p className="fw-bold mb-0">{booking.duration} Hours</p>
                    </div>
                    <div className="col-6 text-center">
                      <p className="text-muted small mb-1">
                        <i className="bi bi-hourglass-split me-1"></i> Valid Until
                      </p>
                      <p className="fw-bold mb-0">{booking.validUntil}</p>
                    </div>
                    <div className="col-6 text-center">
                      <p className="text-muted small mb-1">
                        <i className="bi bi-cash me-1"></i> Amount
                      </p>
                      <p className="fw-bold mb-0" style={{ color: '#27AE60' }}>
                        ₹{booking.amount} Paid
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="ticket-divider mb-4">
                    <div className="ticket-circle"></div>
                  </div>

                  {/* QR Code */}
                  <div className="text-center mb-4">
                    <p className="text-muted small mb-2">Scan for Entry/Exit</p>
                    <div
                      className="qr-container d-inline-block p-3"
                      style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}
                    >
                      {/* Simulated QR Code */}
                      <svg width="180" height="180" viewBox="0 0 180 180">
                        <rect fill="#ffffff" width="180" height="180" />
                        <g fill="#000000">
                          {/* QR Pattern - Simplified representation */}
                          <rect x="10" y="10" width="50" height="50" />
                          <rect x="120" y="10" width="50" height="50" />
                          <rect x="10" y="120" width="50" height="50" />
                          <rect x="20" y="20" width="30" height="30" fill="#ffffff" />
                          <rect x="130" y="20" width="30" height="30" fill="#ffffff" />
                          <rect x="20" y="130" width="30" height="30" fill="#ffffff" />
                          <rect x="30" y="30" width="10" height="10" />
                          <rect x="140" y="30" width="10" height="10" />
                          <rect x="30" y="140" width="10" height="10" />
                          {/* Data pattern */}
                          <rect x="70" y="10" width="10" height="10" />
                          <rect x="90" y="10" width="10" height="10" />
                          <rect x="70" y="30" width="10" height="10" />
                          <rect x="80" y="40" width="10" height="10" />
                          <rect x="100" y="30" width="10" height="10" />
                          <rect x="70" y="70" width="10" height="10" />
                          <rect x="80" y="80" width="10" height="10" />
                          <rect x="90" y="90" width="10" height="10" />
                          <rect x="100" y="70" width="10" height="10" />
                          <rect x="120" y="80" width="10" height="10" />
                          <rect x="140" y="90" width="10" height="10" />
                          <rect x="160" y="80" width="10" height="10" />
                          <rect x="70" y="120" width="10" height="10" />
                          <rect x="80" y="130" width="10" height="10" />
                          <rect x="100" y="140" width="10" height="10" />
                          <rect x="120" y="120" width="10" height="10" />
                          <rect x="130" y="140" width="10" height="10" />
                          <rect x="150" y="130" width="10" height="10" />
                          <rect x="160" y="160" width="10" height="10" />
                        </g>
                      </svg>
                    </div>
                    <p className="text-muted small mt-2">Ticket ID: #{booking.id}</p>
                  </div>

                  {/* Location */}
                  <div
                    className="text-center p-3 rounded"
                    style={{ backgroundColor: '#f8f9fa' }}
                  >
                    <p className="mb-1 fw-semibold" style={{ color: '#2C3E50' }}>
                      <i
                        className="bi bi-geo-alt-fill me-1"
                        style={{ color: '#00C4B4' }}
                      ></i>
                      ABC City Mall
                    </p>
                    <p className="text-muted small mb-0">
                      Andheri East, Mumbai, Maharashtra 400069
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="row g-3 mt-4 fade-in">
                <div className="col-6">
                  <button className="btn btn-primary w-100 py-3" onClick={handleDownload}>
                    <i className="bi bi-download me-2"></i>
                    Download PDF
                  </button>
                </div>
                <div className="col-6">
                  <button
                    className="btn btn-outline-primary w-100 py-3"
                    onClick={handleNavigate}
                  >
                    <i className="bi bi-map me-2"></i>
                    Navigate
                  </button>
                </div>
              </div>

              {/* Back to Dashboard */}
              <button
                className="btn btn-link w-100 mt-3 text-muted"
                onClick={() => navigate('/dashboard')}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TicketPage;
