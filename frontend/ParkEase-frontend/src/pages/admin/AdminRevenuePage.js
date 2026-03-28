import React, { useState, useEffect } from 'react';
import { getAdminRevenue } from '../../utils/adminApi';
import './AdminDashboardPage.css';
import './AdminRevenuePage.css';

const AdminRevenuePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRevenue(); }, []);

  const loadRevenue = async () => {
    try {
      const res = await getAdminRevenue();
      setData(res || {});
    } catch { setData(null); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="admin-dashboard-theme"><div className="text-center py-5"><div className="spinner-border text-primary"></div></div></div>;
  if (!data) return <div className="admin-dashboard-theme"><div className="empty-activity">Failed to load revenue data</div></div>;

  const totalRevenue = parseFloat(data.totalRevenue) || 0;
  const todayRevenue = parseFloat(data.todayRevenue) || 0;
  const monthRevenue = parseFloat(data.monthRevenue) || 0;
  const paidCount = data.paidCount || 0;
  const pendingCount = data.pendingCount || 0;
  const bookingsCount = data.bookingsCount || 0;
  const weekly = data.weeklyRevenue || [];

  return (
    <div className="admin-dashboard-theme admin-revenue-page">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Revenue Dashboard</h1>
          <p>Financial overview and payment analytics</p>
        </div>
        <div className="welcome-icon">💰</div>
      </div>

      {/* Revenue KPIs */}
      <div className="kpi-cards">
        <div className="kpi-card">
          
          <div className="kpi-title">Total Revenue</div>
          <div className="kpi-value">₹{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          
          <div className="kpi-title">Today's Revenue</div>
          <div className="kpi-value">₹{todayRevenue.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          
          <div className="kpi-title">Monthly Revenue</div>
          <div className="kpi-value">₹{monthRevenue.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          
          <div className="kpi-title">Total Bookings</div>
          <div className="kpi-value">{bookingsCount}</div>
        </div>
      </div>

      <div className="split-section mt-4">
        {/* Weekly Chart */}
        <div className="chart-panel">
          <h6 className="fw-bold mb-3">Last 7 Days Revenue</h6>
          {weekly.length === 0 ? (
            <div className="empty-activity">No daily data available</div>
          ) : (
            <div className="column-grid">
              {weekly.map((d, i) => {
                const max = Math.max(...weekly.map((w) => parseFloat(w.value) || 0), 1);
                const val = parseFloat(d.value) || 0;
                const height = Math.max((val / max) * 150, 4);
                return (
                  <div key={i} className="column-item">
                    <div className="column-value">₹{val.toLocaleString()}</div>
                    <div className="column-bar" style={{ height: `${height}px` }}></div>
                    <div className="column-label">{d.label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Split */}
        <div className="chart-panel">
          <h6 className="fw-bold mb-3">Payment Split</h6>
          <div className="pie-row">
            <div className="payment-pie" style={{
              background: `conic-gradient(#10b981 0deg ${(paidCount / Math.max(paidCount + pendingCount, 1)) * 360}deg, #f59e0b ${(paidCount / Math.max(paidCount + pendingCount, 1)) * 360}deg 360deg)`
            }}></div>
            <div className="payment-legend">
              <p><span className="dot paid-dot"></span> Paid: <strong>{paidCount}</strong></p>
              <p><span className="dot pending-dot"></span> Pending: <strong>{pendingCount}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenuePage;
