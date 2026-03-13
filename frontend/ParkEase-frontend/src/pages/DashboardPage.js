import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar, Footer, LiveCounter, LoadingSpinner } from '../components';
import BottomNav from '../components/BottomNav';
import { getMyBookings } from '../utils/api';

const DashboardPage = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeBookings, setActiveBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      // Fetch all user bookings from API
      const res = await getMyBookings();
      const extractBookings = (payload) => {
        if (Array.isArray(payload)) return payload;
        if (!payload || typeof payload !== 'object') return [];

        if (Array.isArray(payload.data)) return payload.data;
        if (Array.isArray(payload.bookings)) return payload.bookings;
        if (Array.isArray(payload.content)) return payload.content;

        // Generic fallback for unexpected wrappers
        for (const key of Object.keys(payload)) {
          if (Array.isArray(payload[key])) return payload[key];
        }

        return [];
      };

      const allBookings = extractBookings(res.data);
      
      // Show only current booking for these statuses
      const activeStatuses = ['ACTIVE', 'PAID', 'CHECKED_IN'];
      const activeOnes = allBookings.filter(
        (b) => b && activeStatuses.includes((b.status || '').toString().trim().toUpperCase())
      );

      // Pick latest booking by the best available timestamp
      const sorted = [...activeOnes].sort((a, b) => {
        const aTime = new Date(
          a.startTime || a.createdAt || a.bookingTime || a.endTime || 0
        ).getTime();
        const bTime = new Date(
          b.startTime || b.createdAt || b.bookingTime || b.endTime || 0
        ).getTime();
        return aTime - bTime;
      });
      
      // Keep all active bookings and show newest first
      setActiveBookings(sorted.reverse());
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setActiveBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // Format date/time for display
  const formatTime = (dateStr) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === 'ACTIVE' || s === 'PAID' || s === 'CHECKED_IN') return 'status-active';
    if (s === 'COMPLETED') return 'status-completed';
    if (s === 'CANCELLED') return 'status-cancelled';
    return 'status-pending';
  };

  const getStatusLabel = (status) => {
    const s = status?.toUpperCase();
    if (s === 'ACTIVE') return 'Active';
    if (s === 'PAID') return 'Ready to Enter';
    if (s === 'CHECKED_IN') return 'Parked';
    if (s === 'COMPLETED') return 'Completed';
    if (s === 'CANCELLED') return 'Cancelled';
    return status || 'Pending';
  };

  return (
    <div className="mobile-page-wrapper">
      <Navbar />

      <div className="main-content mobile-content flex-grow-1 py-4">
        <div className="container">
          {/* Welcome Header */}
          <div className="mb-4 fade-in">
            <h2 className="fw-bold" style={{ color: '#2C3E50' }}>
              Welcome, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p className="text-muted"> City Mall Parking Dashboard</p>
          </div>

          {/* Live Counter Card */}
          <div className="mb-4 fade-in">
            <div className="live-counter">
              <LiveCounter available={325} total={500} compact />
            </div>
          </div>

          {/* Current Booking Cards - show all active user tickets */}
          {activeBookings.length > 0 ? (
            <>
              {activeBookings.map((activeBooking) => (
                <div key={activeBooking.bookingId || activeBooking.id} className="card mb-4 fade-in">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <span>
                      <i className="bi bi-ticket-perforated me-2"></i>
                      Current Booking
                    </span>
                    <span className={`status-badge ${getStatusBadge(activeBooking.status)}`}>
                      {getStatusLabel(activeBooking.status)}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-6">
                        <p className="text-muted small mb-1">Slot Number</p>
                        <p className="fw-bold mb-0 fs-4" style={{ color: '#00C4B4' }}>
                          {activeBooking.spotLabel || activeBooking.slot || 'N/A'}
                        </p>
                      </div>
                      <div className="col-6">
                        <p className="text-muted small mb-1">Duration</p>
                        <p className="fw-bold mb-0">{activeBooking.duration || '--'} Hours</p>
                      </div>
                      <div className="col-6">
                        <p className="text-muted small mb-1">Valid Until</p>
                        <p className="fw-bold mb-0">
                          {formatDate(activeBooking.endTime)} {formatTime(activeBooking.endTime)}
                        </p>
                      </div>
                      <div className="col-6">
                        <p className="text-muted small mb-1">Amount Paid</p>
                        <p className="fw-bold mb-0">₹{activeBooking.totalAmount || activeBooking.amount || 0}</p>
                      </div>
                    </div>
                    <hr />
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => navigate(`/ticket/${activeBooking.bookingId || activeBooking.id}`)}
                    >
                      <i className="bi bi-qr-code me-2"></i>
                      View Ticket
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="card mb-4 fade-in">
              <div className="card-body text-center py-4">
                <i className="bi bi-car-front text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 mb-2">No Active Booking</h5>
                <p className="text-muted mb-3">You don't have any active parking sessions</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/booking')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Book a Spot
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
                onClick={() => navigate('/active-ticket')}
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

        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default DashboardPage;
