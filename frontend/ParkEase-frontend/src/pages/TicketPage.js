import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getBookingById } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';

const TicketPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTicket();
  }, []);

  const loadTicket = async () => {
    try {
      if (location.state?.booking) {
        setBooking(location.state.booking);
      } else if (bookingId) {
        const res = await getBookingById(bookingId);
        setBooking(res.data);
      }
    } catch (err) {
      setError('Could not load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dt) => {
    if (!dt) return '--';
    return new Date(dt).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#ECF0F1' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
            <h4 className="mt-3">{error || 'No ticket data found.'}</h4>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/dashboard')}>
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
        <div className="container" style={{ maxWidth: '500px' }}>
          {/* Success Banner */}
          <div className="text-center mb-4 fade-in">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '80px', height: '80px', backgroundColor: '#27AE60' }}
            >
              <i className="bi bi-check-lg text-white" style={{ fontSize: '2.5rem' }}></i>
            </div>
            <h3 className="fw-bold" style={{ color: '#2C3E50' }}>
              Payment Successful!
            </h3>
            <p className="text-muted">Your parking spot is confirmed</p>
          </div>

          {/* Ticket Card */}
          <div className="card shadow-sm mb-4 fade-in" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            {/* Header strip */}
            <div className="text-center py-3" style={{ backgroundColor: '#2C3E50', color: 'white' }}>
              <h5 className="mb-1 fw-bold">PARKING TICKET</h5>
              <span className="badge bg-success px-3 py-1">
                {booking.status || 'CONFIRMED'}
              </span>
            </div>

            <div className="card-body p-4">
              {/* Ticket Number */}
              <div className="text-center mb-3">
                <small className="text-muted">Ticket Number</small>
                <h4 className="fw-bold mb-0" style={{ color: '#00C4B4', letterSpacing: '2px' }}>
                  {booking.ticketNumber || '--'}
                </h4>
              </div>

              <hr />

              {/* QR Code */}
              {
                <div className="text-center my-3">
                  {booking.qrCodeUrl && !booking.qrCodeUrl.startsWith('LOCAL:') ? (
                    <img
                      src={booking.qrCodeUrl}
                      alt="QR Code"
                      style={{ width: '180px', height: '180px', borderRadius: '8px' }}
                    />
                  ) : (
                    <QRCodeSVG
                      value={JSON.stringify({
                        ticket_no: booking.ticketNumber,
                        spot: `${booking.spotLabel} - ${booking.zone}`,
                        vehicle: booking.vehicleNumber,
                        start_time: booking.startTime || '',
                        end_time: booking.endTime || '',
                        amount: booking.totalAmount,
                      })}
                      size={180}
                      level="H"
                    />
                  )}
                  <p className="text-muted small mt-2">Scan at entry/exit gate</p>
                </div>
              }

              <hr />

              {/* Details */}
              <div className="row g-3">
                <div className="col-6">
                  <small className="text-muted d-block">Spot</small>
                  <span className="fw-bold">{booking.spotLabel}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Zone</small>
                  <span className="fw-bold">{booking.zone}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Vehicle</small>
                  <span className="fw-bold">{booking.vehicleNumber}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Amount Paid</small>
                  <span className="fw-bold text-success">Rs {booking.totalAmount}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Start Time</small>
                  <span className="fw-bold small">{formatDateTime(booking.startTime)}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">End Time</small>
                  <span className="fw-bold small">{formatDateTime(booking.endTime)}</span>
                </div>
              </div>

              {booking.userName && (
                <>
                  <hr />
                  <div className="text-center text-muted small">
                    Booked by: {booking.userName} ({booking.userEmail})
                  </div>
                </>
              )}
            </div>

            {/* Footer strip */}
            <div className="text-center py-2" style={{ backgroundColor: '#f8f9fa', borderTop: '2px dashed #dee2e6' }}>
              <small className="text-muted">
                <i className="bi bi-envelope me-1"></i>
                A copy has been sent to your email
              </small>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-grid gap-2 fade-in">
            <button
              className="btn btn-primary py-2"
              onClick={() => navigate('/my-bookings')}
            >
              <i className="bi bi-list-ul me-2"></i>
              View My Bookings
            </button>
            <button
              className="btn btn-outline-secondary py-2"
              onClick={() => navigate('/dashboard')}
            >
              <i className="bi bi-house me-2"></i>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default TicketPage;
