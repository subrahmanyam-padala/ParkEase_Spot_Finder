import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Footer, LiveCounter, LoadingSpinner } from '../components';
import { getSpotStats } from '../utils/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, slots } = useApp();
  const [loading, setLoading] = useState(true);
  const [spotData, setSpotData] = useState({ available: 0, total: 0 });

  useEffect(() => {
    const getCountsFromSlots = () => {
      if (!Array.isArray(slots) || slots.length === 0) {
        return { available: 0, total: 0 };
      }
      const total = slots.length;
      const available = slots.filter((s) =>
        s?.status ? s.status === 'available' : !s?.isOccupied
      ).length;
      return { available, total };
    };

    const loadData = async () => {
      try {
        const res = await getSpotStats();
        const stats = res.data || {};
        const apiAvailable = Number(
          stats.availableSpots ?? stats.available ?? stats.slots_available ?? 0
        );
        const apiTotal = Number(
          stats.totalSpots ?? stats.total ?? stats.total_slots ?? 0
        );

        // If backend stats are empty/zero, fallback to locally available slot snapshot.
        if (apiTotal === 0) {
          setSpotData(getCountsFromSlots());
        } else {
          setSpotData({ available: apiAvailable, total: apiTotal });
        }
      } catch {
        setSpotData(getCountsFromSlots());
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Keep live counter fresh on landing page.
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [slots]);

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

          {/* Live Counter from Backend */}
          <div className="mb-4">
            <LiveCounter available={spotData.available} total={spotData.total} />
          </div>

          {/* Location */}
          <p className="mb-4">
            <i className="bi bi-geo-alt-fill me-2" style={{ color: '#00C4B4' }}></i>
            Mumbai, Maharashtra
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
                {spotData.total || '500+'}
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
                ₹50
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
