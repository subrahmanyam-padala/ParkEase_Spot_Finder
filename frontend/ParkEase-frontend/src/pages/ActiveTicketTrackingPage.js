import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar, Footer } from '../components';

const formatDuration = (milliseconds) => {
  if (milliseconds <= 0) {
    return 'Expired';
  }

  const totalMinutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const getExpiryDate = (booking) => {
  if (booking.expiresAt) {
    return new Date(booking.expiresAt);
  }
  if (booking.createdAt && booking.duration) {
    return new Date(new Date(booking.createdAt).getTime() + booking.duration * 60 * 60 * 1000);
  }
  return new Date();
};

const ActiveTicketTrackingPage = () => {
  const { bookings } = useApp();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeBooking = useMemo(() => {
    const paidBookings = bookings.filter((booking) => booking.paid);
    const validPaidBookings = paidBookings.filter(
      (booking) => getExpiryDate(booking).getTime() > Date.now()
    );

    if (validPaidBookings.length > 0) {
      return validPaidBookings[validPaidBookings.length - 1];
    }

    return paidBookings.length > 0 ? paidBookings[paidBookings.length - 1] : null;
  }, [bookings]);

  if (!activeBooking) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
        <Navbar />
        <div className="main-content flex-grow-1 d-flex align-items-center justify-content-center py-4">
          <div className="card p-4 text-center" style={{ maxWidth: '520px', width: '100%' }}>
            <i className="bi bi-ticket-perforated" style={{ fontSize: '3rem', color: '#00C4B4' }}></i>
            <h4 className="mt-3 mb-2" style={{ color: '#2C3E50' }}>No Active Ticket</h4>
            <p className="text-muted mb-4">
              You do not have an active paid ticket right now. Book and complete payment first.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/book')}>
              <i className="bi bi-calendar-plus me-2"></i>
              Book Parking Slot
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const expiryDate = getExpiryDate(activeBooking);
  const createdAt = activeBooking.createdAt ? new Date(activeBooking.createdAt) : new Date();
  const totalDurationMs = Math.max(expiryDate.getTime() - createdAt.getTime(), 1);
  const elapsedMs = Math.max(now.getTime() - createdAt.getTime(), 0);
  const remainingMs = Math.max(expiryDate.getTime() - now.getTime(), 0);
  const progress = Math.min((elapsedMs / totalDurationMs) * 100, 100);
  const isExpired = remainingMs === 0;

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
      <Navbar />

      <div className="main-content flex-grow-1 py-4">
        <div className="container">
          <div className="mb-4 fade-in">
            <h2 className="fw-bold" style={{ color: '#2C3E50' }}>
              <i className="bi bi-geo-alt-fill me-2" style={{ color: '#00C4B4' }}></i>
              Active Ticket & Tracking
            </h2>
            <p className="text-muted mb-0">Monitor your current parking session in real time.</p>
          </div>

          <div className="card mb-4 fade-in">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span>
                <i className="bi bi-ticket-perforated me-2"></i>
                Ticket #{activeBooking.id}
              </span>
              <span className={`status-badge ${isExpired ? 'status-pending' : 'status-active'}`}>
                {isExpired ? 'Expired' : 'Active'}
              </span>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <p className="text-muted small mb-1">Slot</p>
                  <p className="fw-bold fs-4 mb-0" style={{ color: '#00C4B4' }}>{activeBooking.slot}</p>
                </div>
                <div className="col-6 col-md-3">
                  <p className="text-muted small mb-1">Amount</p>
                  <p className="fw-bold fs-5 mb-0">Rs {activeBooking.amount}</p>
                </div>
                <div className="col-6 col-md-3">
                  <p className="text-muted small mb-1">Entry Time</p>
                  <p className="fw-bold mb-0">{createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="col-6 col-md-3">
                  <p className="text-muted small mb-1">Exit By</p>
                  <p className="fw-bold mb-0">{expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-8">
              <div className="card h-100 fade-in">
                <div className="card-header">
                  <i className="bi bi-activity me-2"></i>
                  Session Tracking
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Usage Progress</span>
                    <span className="fw-bold">{Math.round(progress)}%</span>
                  </div>
                  <div className="progress tracking-progress mb-4">
                    <div
                      className={`progress-bar ${isExpired ? 'bg-warning' : ''}`}
                      role="progressbar"
                      style={{ width: `${progress}%`, backgroundColor: isExpired ? undefined : '#00C4B4' }}
                    ></div>
                  </div>

                  <div className="row g-3">
                    <div className="col-6 col-md-4">
                      <div className="tracking-metric">
                        <p className="text-muted small mb-1">Time Left</p>
                        <p className="fw-bold mb-0">{formatDuration(remainingMs)}</p>
                      </div>
                    </div>
                    <div className="col-6 col-md-4">
                      <div className="tracking-metric">
                        <p className="text-muted small mb-1">Duration</p>
                        <p className="fw-bold mb-0">{activeBooking.duration}h</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="tracking-metric">
                        <p className="text-muted small mb-1">Gate Status</p>
                        <p className="fw-bold mb-0">{isExpired ? 'Exit Required' : 'Inside Parking'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="tracking-timeline mt-4">
                    <div className="timeline-step done">
                      <i className="bi bi-check-circle-fill"></i>
                      <div>
                        <p className="fw-bold mb-0">Booked</p>
                        <small className="text-muted">Slot reserved successfully</small>
                      </div>
                    </div>
                    <div className="timeline-step done">
                      <i className="bi bi-check-circle-fill"></i>
                      <div>
                        <p className="fw-bold mb-0">Payment Complete</p>
                        <small className="text-muted">Ticket activated</small>
                      </div>
                    </div>
                    <div className={`timeline-step ${isExpired ? 'done' : 'live'}`}>
                      <i className={`bi ${isExpired ? 'bi-check-circle-fill' : 'bi-record-circle-fill'}`}></i>
                      <div>
                        <p className="fw-bold mb-0">Vehicle Parked</p>
                        <small className="text-muted">Real-time session running</small>
                      </div>
                    </div>
                    <div className={`timeline-step ${isExpired ? 'live' : ''}`}>
                      <i className={`bi ${isExpired ? 'bi-record-circle-fill' : 'bi-circle'}`}></i>
                      <div>
                        <p className="fw-bold mb-0">Exit Gate</p>
                        <small className="text-muted">Complete your parking cycle</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card mb-4 fade-in">
                <div className="card-header">
                  <i className="bi bi-pin-map me-2"></i>
                  Location
                </div>
                <div className="card-body">
                  <div className="tracking-map">
                    <div className="map-floor">Ground & Level 1</div>
                    <div className="map-slot">
                      <span className="slot-pill">{activeBooking.slot}</span>
                    </div>
                    <small className="text-muted">ABC City Mall, Andheri East</small>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2 fade-in">
                <button className="btn btn-primary" onClick={() => navigate(`/ticket/${activeBooking.id}`)}>
                  <i className="bi bi-qr-code me-2"></i>
                  View Full Ticket
                </button>
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

export default ActiveTicketTrackingPage;
