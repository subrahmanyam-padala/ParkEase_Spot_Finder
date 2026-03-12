import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar, Footer, LoadingSpinner } from '../components';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookings, updateBooking } = useApp();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const booking = bookings.find((item) => item.id === parseInt(bookingId, 10));

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (pageLoading) {
    return <LoadingSpinner message="Loading payment details..." />;
  }

  if (!booking) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <i
              className="bi bi-exclamation-triangle text-danger"
              style={{ fontSize: '4rem' }}
            ></i>
            <h4 className="mt-3">Booking Not Found</h4>
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

    setTimeout(async () => {
      await updateBooking(booking.id, { paid: true, paymentMethod });
      navigate(`/ticket/${booking.id}`);
    }, 2000);
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
                  <i className="bi bi-building me-1"></i>
                  ABC City Mall, Andheri East
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

          {paymentMethod === 'upi' && (
            <div className="card mb-4 fade-in">
              <div className="card-body">
                <label className="form-label fw-semibold">
                  <i className="bi bi-phone me-1"></i> Enter UPI ID
                </label>
                <input type="text" className="form-control" placeholder="yourname@upi" />
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="card mb-4 fade-in">
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Card Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold">Expiry</label>
                    <input type="text" className="form-control" placeholder="MM/YY" />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold">CVV</label>
                    <input type="text" className="form-control" placeholder="123" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'wallet' && (
            <div className="card mb-4 fade-in">
              <div className="card-body">
                <label className="form-label fw-semibold">Select Wallet</label>
                <select className="form-select">
                  <option value="">Choose wallet...</option>
                  <option value="paytm">Paytm Wallet</option>
                  <option value="amazon">Amazon Pay</option>
                  <option value="mobikwik">MobiKwik</option>
                </select>
              </div>
            </div>
          )}

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
