import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createPaymentOrder, verifyPayment, getBookingById } from '../utils/api';
import { Navbar, Footer, LoadingSpinner } from '../components';
import BottomNav from '../components/BottomNav';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBooking();
  }, []);

  const loadBooking = async () => {
    try {
      if (location.state?.booking) {
        setBooking(location.state.booking);
      } else {
        const res = await getBookingById(bookingId);
        setBooking(res.data);
      }
    } catch (err) {
      setError('Could not load booking details.');
    } finally {
      setPageLoading(false);
    }
  };

  if (pageLoading) {
    return <LoadingSpinner message="Loading payment details..." />;
  }

  if (!booking) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
            <h4 className="mt-3">{error || 'Booking Not Found'}</h4>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/book')}>
              Book New Slot
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      // Step 1: Create payment order
      const orderRes = await createPaymentOrder(booking.bookingId, paymentMethod);
      const { razorpayOrderId } = orderRes.data;

      // Step 2: Verify payment (mock - backend auto-approves and sends email)
      const verifyRes = await verifyPayment({
        razorpayOrderId,
        razorpayPaymentId: 'mock_pay_' + Date.now(),
        razorpaySignature: 'mock_sig_' + Date.now(),
      });

      // Step 3: Navigate to ticket page with booking data
      navigate(`/ticket/${booking.bookingId}`, {
        state: { booking, payment: verifyRes.data },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'upi', icon: 'bi-phone', label: 'UPI', desc: 'GPay, PhonePe, Paytm' },
    { id: 'card', icon: 'bi-credit-card', label: 'Card', desc: 'Credit/Debit Card' },
    { id: 'wallet', icon: 'bi-wallet2', label: 'Wallet', desc: 'Digital Wallet' },
  ];

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
      <Navbar />

      <div className="main-content flex-grow-1 py-4">
        <div className="container">
          <div className="mb-4 fade-in">
            <h2 className="fw-bold" style={{ color: '#2C3E50' }}>
              <i className="bi bi-credit-card me-2"></i>
              Complete Payment
            </h2>
            <p className="text-muted">Secure payment powered by ParkEase</p>
          </div>

          {error && (
            <div className="alert alert-danger fade-in">
              <i className="bi bi-exclamation-circle me-2"></i>{error}
            </div>
          )}

          <div className="card mb-4 fade-in">
            <div className="card-header">
              <i className="bi bi-receipt me-2"></i>
              Booking Summary
            </div>
            <div className="card-body">
              <div className="row text-center g-3">
                <div className="col-4">
                  <p className="text-muted small mb-1">Spot</p>
                  <p className="fw-bold fs-4 mb-0" style={{ color: '#00C4B4' }}>
                    {booking.spotLabel}
                  </p>
                </div>
                <div className="col-4">
                  <p className="text-muted small mb-1">Vehicle</p>
                  <p className="fw-bold mb-0">{booking.vehicleNumber}</p>
                </div>
                <div className="col-4">
                  <p className="text-muted small mb-1">Amount</p>
                  <p className="fw-bold fs-4 mb-0">Rs {booking.totalAmount}</p>
                </div>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <span className="text-muted">
                  <i className="bi bi-ticket-perforated me-1"></i>
                  Ticket: {booking.ticketNumber}
                </span>
                <span className="text-muted small">
                  {booking.zone}
                </span>
              </div>
            </div>
          </div>

          <div className="card mb-4 fade-in">
            <div className="card-header">
              <i className="bi bi-wallet me-2"></i>
              Select Payment Method
            </div>
            <div className="card-body">
              <div className="row g-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="col-12 col-md-4">
                    <div
                      className={`payment-method ${
                        paymentMethod === method.id ? 'selected' : ''
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <i className={`bi ${method.icon}`}></i>
                      <span className="fw-bold mt-2">{method.label}</span>
                      <small className="text-muted">{method.desc}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mb-4 fade-in">
            <p className="text-muted small">
              <i className="bi bi-shield-lock me-1"></i>
              Your payment is secured with 256-bit SSL encryption
            </p>
          </div>

          <button
            className="btn btn-success w-100 py-3 fade-in"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing Payment...
              </>
            ) : (
              <>
                <i className="bi bi-lock me-2"></i>
                Pay Rs {booking.totalAmount} Now
              </>
            )}
          </button>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default PaymentPage;
