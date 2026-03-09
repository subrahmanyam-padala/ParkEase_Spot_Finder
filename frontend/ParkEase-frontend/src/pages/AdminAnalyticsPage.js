import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar, Footer } from '../components';

const hourlyTraffic = [
  { hour: '08:00', occupancy: 42, entries: 36, exits: 12 },
  { hour: '10:00', occupancy: 58, entries: 64, exits: 27 },
  { hour: '12:00', occupancy: 79, entries: 83, exits: 40 },
  { hour: '14:00', occupancy: 88, entries: 71, exits: 36 },
  { hour: '16:00', occupancy: 72, entries: 58, exits: 51 },
  { hour: '18:00', occupancy: 64, entries: 49, exits: 62 },
  { hour: '20:00', occupancy: 51, entries: 31, exits: 57 },
];

const floorMetrics = [
  { floor: 'Ground', total: 200, used: 148 },
  { floor: 'Level 1', total: 180, used: 129 },
  { floor: 'Level 2', total: 120, used: 72 },
];

const paymentSplit = [
  { label: 'UPI', value: 56, color: '#00C4B4' },
  { label: 'Card', value: 28, color: '#2C3E50' },
  { label: 'Wallet', value: 16, color: '#27AE60' },
];

const AdminAnalyticsPage = () => {
  const { user, bookings } = useApp();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.paid ? booking.amount : 0), 0);
  const activeTickets = bookings.filter((booking) => booking.paid).length;
  const avgStay =
    bookings.length > 0
      ? (bookings.reduce((sum, booking) => sum + (booking.duration || 0), 0) / bookings.length).toFixed(1)
      : '0.0';

  if (!isAdmin) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
        <Navbar />
        <div className="main-content flex-grow-1 d-flex align-items-center justify-content-center py-4">
          <div className="card p-4 text-center" style={{ maxWidth: '520px', width: '100%' }}>
            <i className="bi bi-shield-lock" style={{ fontSize: '3rem', color: '#E74C3C' }}></i>
            <h4 className="mt-3 mb-2" style={{ color: '#2C3E50' }}>Admin Access Required</h4>
            <p className="text-muted mb-4">
              This dashboard is restricted to admin users only.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
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
        <div className="container">
          <div className="mb-4 fade-in">
            <h2 className="fw-bold" style={{ color: '#2C3E50' }}>
              <i className="bi bi-bar-chart-line-fill me-2" style={{ color: '#00C4B4' }}></i>
              Admin Analytics Dashboard
            </h2>
            <p className="text-muted mb-0">Operational metrics for parking traffic, utilization, and revenue.</p>
          </div>

          <div className="row g-3 mb-4 fade-in">
            <div className="col-6 col-md-3">
              <div className="analytics-kpi">
                <small className="text-muted d-block">Today Revenue</small>
                <h4 className="mb-0">Rs {totalRevenue}</h4>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="analytics-kpi">
                <small className="text-muted d-block">Active Tickets</small>
                <h4 className="mb-0">{activeTickets}</h4>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="analytics-kpi">
                <small className="text-muted d-block">Avg Stay (hrs)</small>
                <h4 className="mb-0">{avgStay}</h4>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="analytics-kpi">
                <small className="text-muted d-block">Peak Occupancy</small>
                <h4 className="mb-0">88%</h4>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-8">
              <div className="card fade-in">
                <div className="card-header">
                  <i className="bi bi-graph-up-arrow me-2"></i>
                  Hourly Occupancy Trend
                </div>
                <div className="card-body">
                  <div className="occupancy-bars">
                    {hourlyTraffic.map((point) => (
                      <div key={point.hour} className="bar-item">
                        <div className="bar-track">
                          <div className="bar-fill" style={{ height: `${point.occupancy}%` }}></div>
                        </div>
                        <small className="bar-label">{point.hour}</small>
                        <small className="bar-value">{point.occupancy}%</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card mt-4 fade-in">
                <div className="card-header">
                  <i className="bi bi-table me-2"></i>
                  Entry vs Exit Summary
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead>
                        <tr>
                          <th>Hour</th>
                          <th>Entries</th>
                          <th>Exits</th>
                          <th>Occupancy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hourlyTraffic.map((row) => (
                          <tr key={row.hour}>
                            <td>{row.hour}</td>
                            <td>{row.entries}</td>
                            <td>{row.exits}</td>
                            <td>{row.occupancy}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card mb-4 fade-in">
                <div className="card-header">
                  <i className="bi bi-pie-chart-fill me-2"></i>
                  Payment Distribution
                </div>
                <div className="card-body">
                  {paymentSplit.map((item) => (
                    <div key={item.label} className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <span
                          className="me-2 rounded-circle"
                          style={{ width: '12px', height: '12px', backgroundColor: item.color }}
                        ></span>
                        <span>{item.label}</span>
                      </div>
                      <span className="fw-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card fade-in">
                <div className="card-header">
                  <i className="bi bi-building me-2"></i>
                  Floor Utilization
                </div>
                <div className="card-body">
                  {floorMetrics.map((floor) => {
                    const usedPercent = Math.round((floor.used / floor.total) * 100);
                    return (
                      <div key={floor.floor} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small className="fw-semibold">{floor.floor}</small>
                          <small>{floor.used}/{floor.total}</small>
                        </div>
                        <div className="progress tracking-progress">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${usedPercent}%`, backgroundColor: '#2C3E50' }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminAnalyticsPage;
