import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar, Footer, LoadingSpinner } from '../components';

const TicketPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { getBooking, refreshBookings } = useApp();
  const [loading, setLoading] = useState(true);

  const booking = getBooking(bookingId);

  useEffect(() => {
    const bootstrap = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      if (!booking) {
        try {
          await refreshBookings();
        } catch {
          // no-op, fallback UI handles missing ticket
        }
      }

      setLoading(false);
    };

    bootstrap();
  }, [booking, bookingId, refreshBookings]);

  if (loading) {
    return <LoadingSpinner message="Generating your ticket..." />;
  }

  if (!booking) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
        <Navbar />
        <div className="main-content flex-grow-1 d-flex align-items-center justify-content-center py-4">
          <div className="card p-4 text-center" style={{ maxWidth: '520px', width: '100%' }}>
            <i className="bi bi-ticket-perforated" style={{ fontSize: '3rem', color: '#00C4B4' }}></i>
            <h4 className="mt-3">Ticket Not Found</h4>
            <p className="text-muted">The booking you are looking for does not exist.</p>
            <button className="btn btn-primary mt-2" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
      <Navbar />

      <div className="main-content flex-grow-1 py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="text-center mb-4 fade-in">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '80px', height: '80px', backgroundColor: 'rgba(39, 174, 96, 0.15)' }}
                >
                  <i className="bi bi-check-lg" style={{ fontSize: '3rem', color: '#27AE60' }}></i>
                </div>
                <h3 className="fw-bold" style={{ color: '#27AE60' }}>
                  Booking Confirmed!
                </h3>
                <p className="text-muted">Your payment and ticket are confirmed by backend.</p>
              </div>

              <div className="ticket fade-in">
                <div className="ticket-header">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <i className="bi bi-ticket-perforated-fill me-2" style={{ fontSize: '1.5rem' }}></i>
                    <span className="fs-4 fw-bold">PARKING TICKET</span>
                  </div>
                  <p className="mb-0 opacity-75">Ticket #{booking.ticketNumber || booking.id}</p>
                </div>

                <div className="ticket-body">
                  <div className="text-center mb-4">
                    <p className="text-muted small mb-1">Slot Number</p>
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-3 px-4 py-3"
                      style={{ backgroundColor: 'rgba(0, 196, 180, 0.1)' }}
                    >
                      <span className="fw-bold" style={{ fontSize: '3rem', color: '#00C4B4' }}>
                        {booking.slot}
                      </span>
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-6 text-center">
                      <p className="text-muted small mb-1">Duration</p>
                      <p className="fw-bold mb-0">{booking.duration} Hours</p>
                    </div>
                    <div className="col-6 text-center">
                      <p className="text-muted small mb-1">Valid Until</p>
                      <p className="fw-bold mb-0">{booking.validUntil}</p>
                    </div>
                    <div className="col-6 text-center">
                      <p className="text-muted small mb-1">Vehicle</p>
                      <p className="fw-bold mb-0">{booking.vehicleNumber || 'N/A'}</p>
                    </div>
                    <div className="col-6 text-center">
                      <p className="text-muted small mb-1">Amount</p>
                      <p className="fw-bold mb-0" style={{ color: '#27AE60' }}>
                        Rs {booking.amount} Paid
                      </p>
                    </div>
                  </div>

                  <div className="text-center p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                    <p className="mb-1 fw-semibold" style={{ color: '#2C3E50' }}>
                      <i className="bi bi-geo-alt-fill me-1" style={{ color: '#00C4B4' }}></i>
                      Zone {booking.zone || 'Main'}
                    </p>
                    <p className="text-muted small mb-0">
                      {booking.navigationPath || 'Follow signs to your assigned slot'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2 mt-4 fade-in">
                {booking.qrCodeUrl ? (
                  <a className="btn btn-primary" href={booking.qrCodeUrl} target="_blank" rel="noreferrer">
                    <i className="bi bi-qr-code me-2"></i>
                    Open QR Ticket
                  </a>
                ) : null}
                <button className="btn btn-outline-primary" onClick={() => navigate('/dashboard')}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TicketPage;
