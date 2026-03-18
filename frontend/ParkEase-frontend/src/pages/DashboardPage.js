import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getMyBookings, getMyActiveBookings, payOverstayByUser } from '../utils/api';
import { Navbar, LoadingSpinner } from '../components';
import BottomNav from '../components/BottomNav';

const statusColor = (status) => {
  const map = {
    ACTIVE: '#f59e0b', PAID: '#3b82f6', CHECKED_IN: '#8b5cf6',
    OVERSTAY: '#ef4444', OVERSTAY_PAID: '#f97316', COMPLETED: '#22c55e', CANCELLED: '#6b7280',
  };
  return map[status] || '#94a3b8';
};

const shouldShowQr = (status) => {
  const normalized = (status || '').toUpperCase();
  return ['ACTIVE', 'PAID', 'CHECKED_IN', 'OVERSTAY'].includes(normalized);
};

const DASHBOARD_VISIBLE_STATUSES = ['ACTIVE', 'PAID', 'CHECKED_IN', 'OVERSTAY'];

const isDashboardVisibleStatus = (status) => {
  const normalized = (status || '').toUpperCase();
  return DASHBOARD_VISIBLE_STATUSES.includes(normalized);
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [bookings, setBookings] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingOverstay, setPayingOverstay] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [allRes, activeRes] = await Promise.all([getMyBookings(), getMyActiveBookings()]);
      const all = (allRes.data || []).filter((b) => isDashboardVisibleStatus(b?.status));
      const active = (activeRes.data || []).filter((b) => isDashboardVisibleStatus(b?.status));
      setBookings(all);
      setActiveBookings(active);
    } catch {
      setBookings([]);
      setActiveBookings([]);
    } finally { setLoading(false); }
  };

  const handlePayOverstay = async (booking) => {
    if (!booking?.ticketNumber) return;
    if (!window.confirm(`Pay overstay fee of ₹${booking.overstayFee || 0}?`)) return;
    setPayingOverstay(true);
    try {
      await payOverstayByUser(booking.ticketNumber);
      alert('Overstay fee paid! A new ticket has been sent to your email.');
      loadData();
    } catch { alert('Failed to pay overstay fee'); }
    finally { setPayingOverstay(false); }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="mobile-page-wrapper">
      <Navbar />
      <div className="mobile-content fade-in">
        <div className="container py-3">
          {/* Welcome */}
          <div className="mb-4">
            <h5 className="fw-bold mb-1">
              👋 Welcome, {user?.fullName || user?.name || 'User'}!
            </h5>
            <p className="text-muted small mb-0">Here's your parking overview</p>
          </div>

          {/* Active Session Cards */}
          {activeBookings.map((activeBooking) => (
            <div
              key={activeBooking.bookingId || activeBooking.id}
              className="card mb-4"
              style={{ borderLeft: `4px solid ${statusColor(activeBooking.status)}` }}
            >
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-bold mb-0">
                    <i className="bi bi-ticket-perforated me-2"></i>Active Session
                  </h6>
                  <span className="badge" style={{ backgroundColor: statusColor(activeBooking.status), color: '#fff' }}>
                    {activeBooking.status}
                  </span>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <small className="text-muted d-block">Spot</small>
                    <span className="fw-bold">{activeBooking.spotLabel || activeBooking.slot || 'N/A'}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Vehicle</small>
                    <span className="fw-bold">{activeBooking.vehicleNumber || 'N/A'}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Duration</small>
                    <span className="fw-bold">{activeBooking.durationHours || activeBooking.duration || 0}h</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Amount</small>
                    <span className="fw-bold">₹{activeBooking.totalAmount || activeBooking.amount || 0}</span>
                  </div>
                </div>

                {activeBooking.endTime && (
                  <div className="small text-muted mb-2">
                    <i className="bi bi-clock me-1"></i>Valid until: {new Date(activeBooking.endTime).toLocaleString()}
                  </div>
                )}

                {/* Overstay Payment - User Side (Feature #8) */}
                {activeBooking.status === 'OVERSTAY' && (
                  <div className="alert alert-danger py-2 mb-2">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Overstay detected!</strong> Fee: ₹{activeBooking.overstayFee || 0}
                    <button className="btn btn-danger btn-sm d-block mt-2 w-100"
                      onClick={() => handlePayOverstay(activeBooking)} disabled={payingOverstay}>
                      {payingOverstay ? <><span className="spinner-border spinner-border-sm me-1"></span>Processing...</>
                        : <><i className="bi bi-credit-card me-1"></i>Pay Overstay Fee</>}
                    </button>
                  </div>
                )}

                <div className="d-flex gap-2">
                  {shouldShowQr(activeBooking.status) && (
                    <button className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => navigate(`/ticket/${activeBooking.bookingId}`)}>
                      <i className="bi bi-ticket-perforated me-1"></i>Show Ticket
                    </button>
                  )}
                  {(activeBooking.status === 'CHECKED_IN' || activeBooking.status === 'PAID') && (
                    <button className="btn btn-sm btn-primary flex-fill"
                      onClick={() => navigate('/active-ticket')}>
                      <i className="bi bi-geo-alt me-1"></i>Track
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          

          {/* Quick Actions */}
          <div className="row g-3">
            <div className="col-6">
              <button className="btn btn-primary w-100 py-3" onClick={() => navigate('/book')}>
                <i className="bi bi-plus-circle d-block mb-1" style={{ fontSize: '1.5rem' }}></i>
                Book Spot
              </button>
            </div>
            <div className="col-6">
              <button className="btn btn-outline-primary w-100 py-3" onClick={() => navigate('/chatbot')}>
                <i className="bi bi-chat-dots d-block mb-1" style={{ fontSize: '1.5rem' }}></i>
                ParkBot
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default DashboardPage;
