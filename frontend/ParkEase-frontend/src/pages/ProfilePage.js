import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getMyPayments } from '../utils/api';
import { Navbar } from '../components';
import BottomNav from '../components/BottomNav';

const ProfilePage = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ paymentCount: 0, totalSpent: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getMyPayments();
      const payments = res.data || [];
      const successPayments = payments.filter((p) => p.status === 'SUCCESS');
      setStats({
        paymentCount: successPayments.length,
        totalSpent: successPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      });
    } catch {
      // Use defaults
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const initials = (user.fullName || user.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mobile-page-wrapper">
      <Navbar />
      <div className="mobile-content fade-in">
        <div className="container py-4">
          {/* Profile Header */}
          <div className="text-center mb-4">
            <div className="profile-avatar mx-auto mb-3">
              {initials}
            </div>
            <h5 className="fw-bold mb-1">{user.fullName || user.name || 'User'}</h5>
            <p className="text-muted small mb-0">{user.email || ''}</p>
            {user.phoneNumber && <p className="text-muted small">{user.phoneNumber}</p>}
          </div>

          {/* Stats */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="card text-center">
                <div className="card-body py-3">
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--primary-teal)' }}>{stats.paymentCount}</h4>
                  <small className="text-muted">Payments</small>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card text-center">
                <div className="card-body py-3">
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--primary-teal)' }}>₹{stats.totalSpent}</h4>
                  <small className="text-muted">Total Spent</small>
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="card">
            <div className="list-group list-group-flush">
              <button className="list-group-item list-group-item-action d-flex align-items-center" onClick={() => navigate('/my-bookings')}>
                <i className="bi bi-clock-history me-3 text-primary"></i>
                My Bookings
                <i className="bi bi-chevron-right ms-auto text-muted"></i>
              </button>
              <button className="list-group-item list-group-item-action d-flex align-items-center" onClick={() => navigate('/active-ticket')}>
                <i className="bi bi-geo-alt me-3 text-success"></i>
                Active Ticket
                <i className="bi bi-chevron-right ms-auto text-muted"></i>
              </button>
              <button className="list-group-item list-group-item-action d-flex align-items-center text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-3"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ProfilePage;
