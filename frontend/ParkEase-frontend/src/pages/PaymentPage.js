import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar, Footer, LoadingSpinner, ErrorAlert } from '../components';
import { getApiErrorMessage } from '../services/apiClient';

const PaymentPage = () => {
  const { bookingId: bookingIdParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getBooking, processPayment, refreshBookings, loading: appLoading } = useApp();

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const resolvedBookingId = useMemo(() => {
    if (bookingIdParam) {
      return Number(bookingIdParam);
    }

    const fromState = location?.state?.bookingId || location?.state?.id;
    return fromState ? Number(fromState) : null;
  }, [bookingIdParam, location]);

  const booking = resolvedBookingId ? getBooking(resolvedBookingId) : null;

  useEffect(() => {
    const bootstrap = async () => {
      if (!resolvedBookingId) {
        setPageLoading(false);
        return;
      }

      if (!booking && !appLoading) {
        try {
          await refreshBookings();
        } catch {
          // no-op; handled via UI fallback
        }
      }

      setPageLoading(false);
    };

    bootstrap();
  }, [resolvedBookingId, booking, appLoading, refreshBookings]);

  const handlePayment = async () => {
    if (!resolvedBookingId) {
      setError('Booking ID is missing');
      return;
    }

    try {
      setError('');
      setProcessing(true);
      await processPayment(resolvedBookingId, paymentMethod);
      navigate(`/ticket/${resolvedBookingId}`);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Payment could not be completed'));
    } finally {
      setProcessing(false);
    }
  };

  if (pageLoading) {
    return <LoadingSpinner message="Loading payment details..." />;
  }

  if (!resolvedBookingId) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
        <Navbar />
        <div className="main-content flex-grow-1 d-flex align-items-center justify-content-center py-4">
          <div className="card p-4 text-center" style={{ maxWidth: '520px', width: '100%' }}>
            <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: '#E74C3C' }}></i>
            <h4 className="mt-3">No payment data found</h4>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/book')}>
              Book New Slot
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
        <Navbar />
        <div className="main-content flex-grow-1 d-flex align-items-center justify-content-center py-4">
          <div className="card p-4 text-center" style={{ maxWidth: '520px', width: '100%' }}>
            <i className="bi bi-ticket-perforated" style={{ fontSize: '3rem', color: '#00C4B4' }}></i>
            <h4 className="mt-3">Booking not found</h4>
            <p className="text-muted">Try refreshing bookings from dashboard or create a new booking.</p>
            <button className="btn btn-primary mt-2" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const paymentMethods = [
    { id: 'UPI', icon: 'bi-phone', label: 'UPI', desc: 'GPay, PhonePe, Paytm' },
    { id: 'CARD', icon: 'bi-credit-card', label: 'Card', desc: 'Credit/Debit Card' },
    { id: 'WALLET', icon: 'bi-wallet2', label: 'Wallet', desc: 'Digital Wallet' },
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
            <p className="text-muted">Backend mock payment flow (create-order + verify)</p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

          <div className="card mb-4 fade-in">
            <div className="card-header">
              <i className="bi bi-receipt me-2"></i>
              Booking Summary
            </div>
            <div className="card-body">
              <div className="row text-center g-3">
                <div className="col-4">
                  <p className="text-muted small mb-1">Slot</p>
                  <p className="fw-bold fs-4 mb-0" style={{ color: '#00C4B4' }}>
                    {booking.slot}
                  </p>
                </div>
                <div className="col-4">
                  <p className="text-muted small mb-1">Duration</p>
                  <p className="fw-bold fs-4 mb-0">{booking.duration}h</p>
                </div>
                <div className="col-4">
                  <p className="text-muted small mb-1">Amount</p>
                  <p className="fw-bold fs-4 mb-0">Rs {booking.amount}</p>
                </div>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <span className="text-muted">
                  <i className="bi bi-ticket-perforated me-1"></i>
                  Ticket #{booking.ticketNumber || booking.id}
                </span>
                <span className="text-muted small">Valid until {booking.validUntil}</span>
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
                      className={`payment-method ${paymentMethod === method.id ? 'selected' : ''}`}
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

          <button
            className="btn btn-success w-100 py-3 fade-in"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing Payment...
              </>
            ) : (
              <>
                <i className="bi bi-lock me-2"></i>
                Pay Rs {booking.amount} Now
              </>
            )}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentPage;
