import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Footer, LiveCounter, LoadingSpinner } from '../components';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Welcome to ParkEase..." />;
  }

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          {/* Mall Logo */}
          <div className="mall-logo">
            <i className="bi bi-building"></i>
          </div>

          <h1 className="hero-title">City Mall</h1>
          <p className="lead mb-4 opacity-75">Smart Parking System</p>

          {/* Live Counter */}
          <div className="mb-4">
            <LiveCounter available={325} total={500} />
          </div>

          {/* Location */}
          <p className="mb-4">
            <i className="bi bi-geo-alt-fill me-2" style={{ color: '#00C4B4' }}></i>
            Koramangala, Banglore
          </p>

          {/* CTA Button */}
          <button
            className="btn btn-primary btn-lg px-5 py-3 mobile-full-width"
            onClick={() => navigate(user ? '/book' : '/login')}
          >
            <i className="bi bi-car-front-fill me-2"></i>
            BOOK NOW
          </button>

          {!user && (
            <p className="mt-3 text-white-50 small">
              Already have an account?
              <Link to="/login" className="ms-1" style={{ color: '#00C4B4' }}>
                Login here
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="text-center mb-4 fw-bold" style={{ color: '#2C3E50' }}>
            Why Choose ParkEase?
          </h2>

          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-broadcast"></i>
                </div>
                <h5 className="fw-bold" style={{ color: '#2C3E50' }}>
                  Real-time Availability
                </h5>
                <p className="text-muted mb-0">
                  Live slot updates every second. Never waste time searching for parking.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-phone"></i>
                </div>
                <h5 className="fw-bold" style={{ color: '#2C3E50' }}>
                  UPI Payments
                </h5>
                <p className="text-muted mb-0">
                  Pay instantly with UPI, cards, or digital wallets. No cash hassle.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-qr-code"></i>
                </div>
                <h5 className="fw-bold" style={{ color: '#2C3E50' }}>
                  QR Code Entry
                </h5>
                <p className="text-muted mb-0">
                  Scan & Go! Quick entry and exit with your digital parking ticket.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5" style={{ backgroundColor: '#ECF0F1' }}>
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-4">
              <h3 className="fw-bold" style={{ color: '#00C4B4' }}>
                500+
              </h3>
              <p className="text-muted mb-0 small">Parking Slots</p>
            </div>
            <div className="col-4">
              <h3 className="fw-bold" style={{ color: '#00C4B4' }}>
                24/7
              </h3>
              <p className="text-muted mb-0 small">Available</p>
            </div>
            <div className="col-4">
              <h3 className="fw-bold" style={{ color: '#00C4B4' }}>
                ₹75
              </h3>
              <p className="text-muted mb-0 small">Per Hour</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
