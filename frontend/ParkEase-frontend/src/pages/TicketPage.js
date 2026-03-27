import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { createExtensionPaymentOrder, createOverstayPaymentOrder, getBookingById, verifyPayment } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const TicketPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingOverstay, setPayingOverstay] = useState(false);
  const [extendingTicket, setExtendingTicket] = useState(false);
  const [extensionHours, setExtensionHours] = useState(1);
  const [paymentNotice, setPaymentNotice] = useState('');

  useEffect(() => {
    loadTicket();
  }, []);

  const loadTicket = async () => {
    try {
      // Supports both { booking: {...} } and direct booking object in navigation state.
      if (location.state?.bookingId) {
        setBooking(location.state);
      } else if (location.state?.booking) {
        setBooking(location.state.booking);
      } else if (bookingId) {
        const res = await getBookingById(bookingId);
        setBooking(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Could not load ticket details.');
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

  const handlePayOverstay = async () => {
    if (!booking?.bookingId) return;

    setPayingOverstay(true);
    setPaymentNotice('');
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay checkout. Please try again.');
      }

      const orderRes = await createOverstayPaymentOrder(booking.bookingId, 'UPI');
      const order = orderRes.data || {};
      const amountInPaise = Math.round((order.amount || booking.overstayFee || 0) * 100);

      await new Promise((resolve, reject) => {
        const options = {
          key: order.razorpayKeyId,
          amount: amountInPaise,
          currency: 'INR',
          name: 'ParkEase',
          description: `Overstay payment for ${booking.ticketNumber || 'ticket'}`,
          order_id: order.razorpayOrderId,
          handler: async (response) => {
            try {
              await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              await loadTicket();
              setPaymentNotice('Overstay payment successful. QR is now enabled for exit scan.');
              resolve();
            } catch (verifyErr) {
              reject(new Error(verifyErr.response?.data?.error || verifyErr.response?.data?.message || 'Payment verification failed.'));
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled by user.')),
          },
          theme: {
            color: '#00C4B4',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (response) => {
          reject(new Error(response.error?.description || 'Payment failed. Please try again.'));
        });
        razorpay.open();
      });
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to pay overstay fee');
    } finally {
      setPayingOverstay(false);
    }
  };

  const handleExtendTicket = async () => {
    if (!booking?.bookingId) return;

    setExtendingTicket(true);
    setPaymentNotice('');
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay checkout. Please try again.');
      }

      const orderRes = await createExtensionPaymentOrder(booking.bookingId, extensionHours, 'UPI');
      const order = orderRes.data || {};
      const amountInPaise = Math.round((order.amount || (booking.spotPricePerHour || 75) * extensionHours) * 100);

      await new Promise((resolve, reject) => {
        const options = {
          key: order.razorpayKeyId,
          amount: amountInPaise,
          currency: 'INR',
          name: 'ParkEase',
          description: `Ticket extension for ${booking.ticketNumber || 'ticket'} (${extensionHours}h)`,
          order_id: order.razorpayOrderId,
          handler: async (response) => {
            try {
              await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              await loadTicket();
              setPaymentNotice(`Ticket extended by ${extensionHours} hour(s). Expiration time updated on the same ticket.`);
              resolve();
            } catch (verifyErr) {
              reject(new Error(verifyErr.response?.data?.error || verifyErr.response?.data?.message || 'Payment verification failed.'));
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled by user.')),
          },
          theme: {
            color: '#00C4B4',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (response) => {
          reject(new Error(response.error?.description || 'Payment failed. Please try again.'));
        });
        razorpay.open();
      });
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to extend ticket');
    } finally {
      setExtendingTicket(false);
    }
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

  const normalizedStatus = (booking.status || '').toUpperCase();
  const endTimeMs = booking.endTime ? new Date(booking.endTime).getTime() : null;
  const isExpiredByTime = typeof endTimeMs === 'number' && Date.now() > endTimeMs;
  const isOverstayPending = normalizedStatus === 'OVERSTAY' || (normalizedStatus === 'CHECKED_IN' && isExpiredByTime);
  const isOverstayPaid = normalizedStatus === 'OVERSTAY_PAID';
  const canExtend = !isExpiredByTime && ['PAID', 'CHECKED_IN'].includes(normalizedStatus);
  const qrDisabledStatuses = ['ACTIVE', 'CANCELLED', 'COMPLETED'];
  const isQrDisabled = isOverstayPending || qrDisabledStatuses.includes(normalizedStatus);

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
      <Navbar />

      <div className="main-content flex-grow-1 py-4">
        <div className="container" style={{ maxWidth: '500px' }}>
          {/* Success Banner */}
          <div className="text-center mb-4 fade-in">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '80px', height: '80px', backgroundColor: isOverstayPending ? '#ef4444' : '#27AE60' }}
            >
              <i className={`bi ${isOverstayPending ? 'bi-exclamation-triangle-fill' : 'bi-check-lg'} text-white`} style={{ fontSize: '2.5rem' }}></i>
            </div>
            <h3 className="fw-bold" style={{ color: '#2C3E50' }}>
              {isOverstayPending ? 'Overstay Detected' : isOverstayPaid ? 'Overstay Cleared' : 'Payment Successful!'}
            </h3>
            <p className="text-muted">
              {isOverstayPending ? 'QR is disabled until overstay fee is paid' : 'Your parking spot is confirmed'}
            </p>
          </div>

          {isOverstayPending && (
            <div className="alert alert-danger fade-in" role="alert">
              <h6 className="fw-bold mb-2">⚠️ Overstay Detected!</h6>
              <div className="small mb-1">Ticket: {booking.ticketNumber || '--'}</div>
              <div className="small mb-1">Spot: {booking.spotLabel || '--'}</div>
              <div className="small mb-1">Your booking expired at {formatDateTime(booking.endTime)}.</div>
              <div className="small mb-1">
                Rate: ₹{booking.spotPricePerHour || 75}/hr x {booking.overstayMultiplier || 1.5}x
              </div>
              <div className="small mb-3">Please pay the overstay amount in app before scanning at exit gate.</div>
              <button className="btn btn-danger btn-sm" onClick={handlePayOverstay} disabled={payingOverstay}>
                {payingOverstay
                  ? <><span className="spinner-border spinner-border-sm me-1"></span>Processing...</>
                  : <>Pay Overstay ₹{booking.overstayFee || 0}</>}
              </button>
            </div>
          )}

          {paymentNotice && (
            <div className="alert alert-success fade-in" role="alert">
              {paymentNotice}
            </div>
          )}

          {canExtend && (
            <div className="alert alert-info fade-in" role="alert">
              <h6 className="fw-bold mb-2">⏱️ Extend Parking Time</h6>
              <div className="small mb-2">Extend before expiry to keep the same ticket and avoid overstay fees.</div>
              <div className="small mb-2">Rate: ₹{booking.spotPricePerHour || 75}/hour</div>
              <div className="d-flex align-items-end gap-2 flex-wrap">
                <div>
                  <label className="form-label form-label-sm mb-1">Additional Hours</label>
                  <select
                    className="form-select form-select-sm"
                    value={extensionHours}
                    onChange={(e) => setExtensionHours(Number(e.target.value))}
                    disabled={extendingTicket}
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={3}>3 hours</option>
                    <option value={4}>4 hours</option>
                  </select>
                </div>
                <button className="btn btn-sm btn-info text-white" onClick={handleExtendTicket} disabled={extendingTicket}>
                  {extendingTicket
                    ? <><span className="spinner-border spinner-border-sm me-1"></span>Processing...</>
                    : <>Extend & Pay ₹{(booking.spotPricePerHour || 75) * extensionHours}</>}
                </button>
              </div>
            </div>
          )}

          {!canExtend && !isOverstayPending && (
            <div className="alert alert-secondary fade-in" role="alert">
              Extension is available only before ticket expiry.
            </div>
          )}

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
                  {isQrDisabled ? (
                    <div
                      className="d-inline-flex flex-column align-items-center justify-content-center border rounded"
                      style={{ width: '180px', height: '180px', color: '#6b7280', backgroundColor: '#f3f4f6' }}
                    >
                      <i className="bi bi-qr-code-scan" style={{ fontSize: '2rem' }}></i>
                      <small className="mt-2 px-2 text-center">QR disabled for current status</small>
                    </div>
                  ) : booking.qrCodeUrl && !booking.qrCodeUrl.startsWith('LOCAL:') ? (
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
                  <p className="text-muted small mt-2">
                    {isQrDisabled ? 'Pay overstay to re-enable exit scan' : 'Scan at entry/exit gate'}
                  </p>
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
                {isOverstayPaid
                  ? 'Updated overstay exit ticket has been sent to your email'
                  : 'A copy has been sent to your email'}
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
