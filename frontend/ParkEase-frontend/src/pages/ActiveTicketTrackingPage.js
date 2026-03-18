import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMyActiveBookings, getMyBookings } from '../utils/api';
import { Navbar, Footer } from '../components';
import BottomNav from '../components/BottomNav';

const formatDuration = (milliseconds) => {
  if (milliseconds <= 0) {
    return 'Expired';
  }

  const totalMinutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const ActiveTicketTrackingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [now, setNow] = useState(new Date());
  const [activeBooking, setActiveBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadActiveBooking();
  }, []);

  const loadActiveBooking = async () => {
    try {
      setLoading(true);
      const selectedBookingId = location.state?.bookingId;

      if (selectedBookingId) {
        const allRes = await getMyBookings();
        const allBookings = Array.isArray(allRes.data) ? allRes.data : [];
        const selected = allBookings.find((b) => String(b.bookingId || b.id) === String(selectedBookingId));
        if (selected) {
          setActiveBooking(selected);
          setError('');
          return;
        }
      }

      const res = await getMyActiveBookings();

      console.log('[ActiveTicket] raw response:', res);
      console.log('[ActiveTicket] res.data:', res.data);

      // Handle: array, { data: [...] }, or a single object
      let payload;
      if (Array.isArray(res.data)) {
        payload = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        payload = res.data.data;
      } else if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
        // Single booking object returned directly
        payload = [res.data];
      } else {
        payload = [];
      }

      console.log('[ActiveTicket] normalized payload:', payload);

      // Blacklist-based: show everything that is NOT finished/cancelled
      const inactiveStatuses = ['COMPLETED', 'CANCELLED', 'EXPIRED'];
      const activeOnes = payload.filter(
        (b) => b && !inactiveStatuses.includes((b.status || '').toUpperCase())
      );

      console.log('[ActiveTicket] activeOnes after filter:', activeOnes);

      // Sort by startTime ascending, pick last (most recent)
      const sorted = activeOnes.sort((a, b) => {
        const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
        const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
        return aTime - bTime;
      });

      if (sorted.length > 0) {
        console.log('[ActiveTicket] setting activeBooking:', sorted[sorted.length - 1]);
        setActiveBooking(sorted[sorted.length - 1]);
      } else {
        setActiveBooking(null);
      }
    } catch (err) {
      console.error('[ActiveTicket] fetch error:', err);
      setError('Could not load your active booking. Please try again.');
      setActiveBooking(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
        <Navbar />
        <div className="main-content flex-grow-1 d-flex align-items-center justify-content-center py-4">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="text-muted">Loading your active ticket...</p>
          </div>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (!activeBooking) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
        <Navbar />
        <div className="main-content flex-grow-1 d-flex align-items-center justify-content-center py-4">
          <div className="card p-4 text-center" style={{ maxWidth: '520px', width: '100%' }}>
            <i className="bi bi-ticket-perforated" style={{ fontSize: '3rem', color: '#00C4B4' }}></i>
            <h4 className="mt-3 mb-2" style={{ color: '#2C3E50' }}>
              {error ? 'Oops!' : 'No Active Ticket'}
            </h4>
            <p className="text-muted mb-4">
              {error || 'You don\'t have an active parking session right now. Book a spot to get started!'}
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/book')}>
              <i className="bi bi-calendar-plus me-2"></i>
              Book Parking Slot
            </button>
          </div>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  // Calculate times using API fields (startTime, endTime)
  const startTime = activeBooking.startTime ? new Date(activeBooking.startTime) : new Date();
  const endTime = activeBooking.endTime ? new Date(activeBooking.endTime) : new Date();
  const totalDurationMs = Math.max(endTime.getTime() - startTime.getTime(), 1);
  const elapsedMs = Math.max(now.getTime() - startTime.getTime(), 0);
  const remainingMs = Math.max(endTime.getTime() - now.getTime(), 0);
  const progress = Math.min((elapsedMs / totalDurationMs) * 100, 100);
  const isExpired = remainingMs <= 0;
  const isCheckedIn = activeBooking.status === 'CHECKED_IN';

  // Get status display
  const getStatusText = () => {
    if (activeBooking.status === 'CHECKED_IN') return 'Parked';
    if (activeBooking.status === 'PAID') return 'Ready to Enter';
    if (isExpired) return 'Time Up';
    return 'Active';
  };

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
                {activeBooking.ticketNumber || `Booking #${activeBooking.bookingId}`}
              </span>
              <span className={`status-badge ${isExpired ? 'status-pending' : 'status-active'}`}>
                {getStatusText()}
              </span>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <p className="text-muted small mb-1">Spot</p>
                  <p className="fw-bold fs-4 mb-0" style={{ color: '#00C4B4' }}>
                    {activeBooking.spotLabel || '--'}
                  </p>
                </div>
                <div className="col-6 col-md-3">
                  <p className="text-muted small mb-1">Amount Paid</p>
                  <p className="fw-bold fs-5 mb-0">₹{activeBooking.totalAmount || 0}</p>
                </div>
                <div className="col-6 col-md-3">
                  <p className="text-muted small mb-1">Entry Time</p>
                  <p className="fw-bold mb-0">
                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="col-6 col-md-3">
                  <p className="text-muted small mb-1">Exit By</p>
                  <p className="fw-bold mb-0">
                    {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
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
                        <p className="fw-bold mb-0">{activeBooking.durationHours || 1}h</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="tracking-metric">
                        <p className="text-muted small mb-1">Status</p>
                        <p className="fw-bold mb-0">
                          {isCheckedIn ? 'Inside Parking' : isExpired ? 'Time to Exit' : 'Ready to Enter'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="tracking-timeline mt-4">
                    <div className="timeline-step done">
                      <i className="bi bi-check-circle-fill"></i>
                      <div>
                        <p className="fw-bold mb-0">Booked</p>
                        <small className="text-muted">Spot reserved successfully</small>
                      </div>
                    </div>
                    <div className="timeline-step done">
                      <i className="bi bi-check-circle-fill"></i>
                      <div>
                        <p className="fw-bold mb-0">Payment Complete</p>
                        <small className="text-muted">Ready to enter parking</small>
                      </div>
                    </div>
                    <div className={`timeline-step ${isCheckedIn ? 'done' : activeBooking.status === 'PAID' ? 'live' : ''}`}>
                      <i className={`bi ${isCheckedIn ? 'bi-check-circle-fill' : activeBooking.status === 'PAID' ? 'bi-record-circle-fill' : 'bi-circle'}`}></i>
                      <div>
                        <p className="fw-bold mb-0">Entry Gate</p>
                        <small className="text-muted">{isCheckedIn ? 'Scanned and entered' : 'Show QR at gate to enter'}</small>
                      </div>
                    </div>
                    <div className={`timeline-step ${isCheckedIn ? 'live' : ''}`}>
                      <i className={`bi ${isCheckedIn ? 'bi-record-circle-fill' : 'bi-circle'}`}></i>
                      <div>
                        <p className="fw-bold mb-0">Vehicle Parked</p>
                        <small className="text-muted">{isCheckedIn ? 'Your car is parked' : 'Park at your spot'}</small>
                      </div>
                    </div>
                    <div className="timeline-step">
                      <i className="bi bi-circle"></i>
                      <div>
                        <p className="fw-bold mb-0">Exit Gate</p>
                        <small className="text-muted">Scan QR to exit when done</small>
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
                  Your Parking Spot
                </div>
                <div className="card-body">
                  <div className="tracking-map">
                    <div className="map-floor">{activeBooking.zone || 'Ground Floor'}</div>
                    <div className="map-slot">
                      <span className="slot-pill">{activeBooking.spotLabel || '--'}</span>
                    </div>
                    <div className="small mt-2" style={{ color: '#334155' }}>
                      <i className="bi bi-signpost-split me-1"></i>
                      {activeBooking.navigationPath || `Follow parking signs to ${activeBooking.spotLabel || 'your slot'}`}
                    </div>
                    <small className="text-muted">ParkEase Mall Parking</small>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2 fade-in">
                <button className="btn btn-primary" onClick={() => navigate(`/ticket/${activeBooking.bookingId}`)}>
                  <i className="bi bi-qr-code me-2"></i>
                  View QR Ticket
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
      <BottomNav />
    </div>
  );
};

export default ActiveTicketTrackingPage;
