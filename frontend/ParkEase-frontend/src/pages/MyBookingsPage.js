import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking, payOverstayByUser } from '../utils/api';
import { Navbar } from '../components';
import BottomNav from '../components/BottomNav';

const STATUS_TABS = ['ALL', 'ACTIVE', 'PAID', 'CHECKED_IN', 'OVERSTAY', 'COMPLETED', 'CANCELLED'];

const statusColor = (status) => {
  const map = {
    ACTIVE: '#f59e0b',
    PAID: '#3b82f6',
    CHECKED_IN: '#8b5cf6',
    OVERSTAY: '#ef4444',
    OVERSTAY_PAID: '#f97316',
    COMPLETED: '#22c55e',
    CANCELLED: '#6b7280',
  };
  return map[status] || '#94a3b8';
};

const shouldShowQr = (status) => {
  const normalized = (status || '').toUpperCase();
  return ['ACTIVE', 'PAID', 'CHECKED_IN', 'OVERSTAY'].includes(normalized);
};

const canTrack = (status) => {
  const normalized = (status || '').toUpperCase();
  return ['ACTIVE', 'PAID', 'CHECKED_IN', 'OVERSTAY'].includes(normalized);
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [payingOverstay, setPayingOverstay] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(bookingId);
      loadBookings();
    } catch {
      alert('Failed to cancel booking');
    }
  };

  const handlePayOverstay = async (booking) => {
    if (!booking.ticketNumber) return;
    if (!window.confirm(`Pay overstay fee of ₹${booking.overstayFee || 0}?`)) return;
    setPayingOverstay(booking.bookingId || booking.id);
    try {
      await payOverstayByUser(booking.ticketNumber);
      alert('Overstay fee paid! A new ticket has been sent to your email.');
      loadBookings();
    } catch {
      alert('Failed to pay overstay fee');
    } finally {
      setPayingOverstay(null);
    }
  };

  const filtered = activeTab === 'ALL' ? bookings : bookings.filter((b) => b.status === activeTab);

  return (
    <div className="mobile-page-wrapper">
      <Navbar />
      <div className="mobile-content fade-in">
        <div className="container py-3">
          <h5 className="fw-bold mb-3">
            <i className="bi bi-clock-history me-2"></i>My Bookings
          </h5>

          {/* Status Tabs */}
          <div className="status-tabs mb-3">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                className={`status-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2">No bookings found</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filtered.map((booking) => (
                <div key={booking.bookingId || booking.id} className="card booking-card"
                  style={{ borderLeft: `4px solid ${statusColor(booking.status)}` }}>
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="fw-bold">{booking.ticketNumber || `#${booking.bookingId || booking.id}`}</span>
                        <span
                          className="badge ms-2"
                          style={{ backgroundColor: statusColor(booking.status), color: '#fff' }}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    <div className="small text-muted mb-1">
                      <i className="bi bi-geo-alt me-1"></i>
                      {booking.spotLabel || booking.slot || 'N/A'} {booking.zone ? `- ${booking.zone}` : ''}
                    </div>
                    <div className="small text-muted mb-1">
                      <i className="bi bi-car-front me-1"></i>
                      {booking.vehicleNumber || 'N/A'}
                    </div>
                    <div className="small text-muted mb-1">
                      <i className="bi bi-currency-rupee me-1"></i>
                      ₹{booking.totalAmount || booking.amount || 0}
                    </div>
                    {booking.endTime && (
                      <div className="small text-muted mb-2">
                        <i className="bi bi-clock me-1"></i>
                        Valid until: {new Date(booking.endTime).toLocaleString()}
                      </div>
                    )}

                    {/* Overstay Alert + Payment (Feature #8) */}
                    {booking.status === 'OVERSTAY' && (
                      <div className="alert alert-danger py-2 mb-2">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                        <strong>Overstay!</strong> Fee: ₹{booking.overstayFee || 0}
                        <button className="btn btn-danger btn-sm d-block mt-2 w-100"
                          onClick={() => handlePayOverstay(booking)}
                          disabled={payingOverstay === (booking.bookingId || booking.id)}>
                          {payingOverstay === (booking.bookingId || booking.id)
                            ? <><span className="spinner-border spinner-border-sm me-1"></span>Processing...</>
                            : <><i className="bi bi-credit-card me-1"></i>Pay Overstay Fee</>}
                        </button>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      {shouldShowQr(booking.status) && (
                        <button
                          className="btn btn-sm btn-outline-primary flex-fill"
                          onClick={() => navigate(`/ticket/${booking.bookingId || booking.id}`)}
                        >
                          <i className="bi bi-ticket-perforated me-1"></i>Show Ticket
                        </button>
                      )}
                      {booking.status === 'ACTIVE' && (
                        <>
                          <button
                            className="btn btn-sm btn-primary flex-fill"
                            onClick={() => navigate(`/payment/${booking.bookingId || booking.id}`)}
                          >
                            <i className="bi bi-credit-card me-1"></i>Pay
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger flex-fill"
                            onClick={() => handleCancel(booking.bookingId || booking.id)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {canTrack(booking.status) && (
                        <button className="btn btn-sm btn-outline-primary flex-fill"
                          onClick={() => navigate('/active-ticket', { state: { bookingId: booking.bookingId || booking.id } })}>
                          <i className="bi bi-geo-alt me-1"></i>Track
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default MyBookingsPage;
