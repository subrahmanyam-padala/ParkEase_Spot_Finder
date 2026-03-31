import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/admin/PageWrapper';
import KpiCard from '../../components/admin/KpiCard';
import { formatINR } from '../../utils/adminMetrics';
import { dismissAdminAlert, fetchAdminAlerts, fetchAdminOverview } from '../../utils/adminApi';
import '../admin/AdminDashboardPage.css';

const EMPTY_DATA = {
  totalParkingSlots: 0,
  occupiedSlots: 0,
  availableSlots: 0,
  todayRevenue: 0,
  bookingsCount: 0,
  usersCount: 0,
  paidCount: 0,
  pendingCount: 0,
  weeklyRevenue: [],
  slotColumns: [],
};

const AdminDashboardPage = () => {
  const [overview, setOverview] = useState(EMPTY_DATA);
  const [refundAlerts, setRefundAlerts] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadOverview = async () => {
      try {
        const [response, alerts] = await Promise.all([fetchAdminOverview(), fetchAdminAlerts()]);
        if (mounted) {
          setOverview(response);
          const refundOnly = (Array.isArray(alerts) ? alerts : []).filter(
            (a) => (a?.type || '').toLowerCase() === 'refund'
          );
          setRefundAlerts(refundOnly);
        }
      } catch {
        if (mounted) {
          setOverview(EMPTY_DATA);
          setRefundAlerts([]);
        }
      }
    };

    loadOverview();

    // Keep dashboard metrics in sync after payments happen elsewhere.
    const intervalId = setInterval(loadOverview, 8000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadOverview();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const weeklyRevenue = Array.isArray(overview.weeklyRevenue) ? overview.weeklyRevenue : [];
  const slotColumns = Array.isArray(overview.slotColumns) ? overview.slotColumns : [];
  const paidCount = Number(overview.paidCount) || 0;
  const pendingCount = Number(overview.pendingCount) || 0;
  const totalPayments = Math.max(paidCount + pendingCount, 1);
  const paidDegrees = (paidCount / totalPayments) * 360;
  const paidPercent = Math.round((paidCount / totalPayments) * 100);
  const pendingPercent = Math.round((pendingCount / totalPayments) * 100);
  const totalParkingSlots = Number(overview.totalParkingSlots) || 0;
  const occupiedSlots = Number(overview.occupiedSlots) || 0;
  const availableSlots = Number(overview.availableSlots) || 0;
  const occupiedPercent = Math.round((occupiedSlots / Math.max(totalParkingSlots, 1)) * 100);
  const availablePercent = Math.round((availableSlots / Math.max(totalParkingSlots, 1)) * 100);

  const maxRevenue = Math.max(...weeklyRevenue.map((item) => Number(item.value) || 0), 1);
  const maxSlotCount = Math.max(...slotColumns.map((d) => Number(d.value) || 0), 1);
  const linePoints = weeklyRevenue
    .map((item, index) => {
      const x = (index / Math.max(weeklyRevenue.length - 1, 1)) * 100;
      const y = 100 - ((Number(item.value) || 0) / maxRevenue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDismissRefundAlert = async (alertId) => {
    try {
      await dismissAdminAlert(alertId);
      setRefundAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch {
      // keep UX non-blocking
    }
  };

  return (
    <PageWrapper title="Dashboard">
      <div className="admin-dashboard-theme">
        {/* Welcome Header */}
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <h1>Welcome back, Admin! 👋</h1>
            <p>{currentDate}</p>
          </div>
          <div className="welcome-icon">🅿️</div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-grid">
          <Link to="/admin/scanner" className="quick-action-btn">
            <div className="action-icon scan">📷</div>
            <span className="action-label">Scan QR</span>
          </Link>
          <Link to="/admin/bookings" className="quick-action-btn">
            <div className="action-icon bookings">📋</div>
            <span className="action-label">Bookings</span>
          </Link>
          <Link to="/admin/parking-spots" className="quick-action-btn">
            <div className="action-icon spots">🚗</div>
            <span className="action-label">Manage Spots</span>
          </Link>
          <Link to="/admin/revenue" className="quick-action-btn">
            <div className="action-icon revenue">💰</div>
            <span className="action-label">Revenue</span>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="kpi-cards">
          <KpiCard title="Total Parking Slots" value={overview.totalParkingSlots} icon="🅿️" />
          <KpiCard title="Occupied Slots" value={overview.occupiedSlots} icon="🔴" />
          <KpiCard title="Available Slots" value={overview.availableSlots} icon="🟢" />
          <KpiCard title="Revenue Today" value={formatINR(overview.todayRevenue)} icon="💵" />
          <KpiCard title="Active Bookings" value={overview.bookingsCount} icon="📑" />
          <KpiCard title="Registered Users" value={overview.usersCount} icon="👥" />
        </div>

        <section className="dashboard-section">
          <h2>Line Chart: Revenue Trend (Last 7 Days)</h2>
          <div className="chart-panel">
            <svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline points={linePoints} />
            </svg>
            <div className="line-chart-labels">
              {weeklyRevenue.map((item) => (
                <div key={item.label} className="line-label-item">
                  <span>{item.label}</span>
                  <strong>{formatINR(item.value)}</strong>
                </div>
              ))}
            </div>

            <div className="chart-table-wrap">
              <table className="chart-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyRevenue.length === 0 && (
                    <tr>
                      <td colSpan="2" className="empty-cell">No revenue data available</td>
                    </tr>
                  )}
                  {weeklyRevenue.map((item) => (
                    <tr key={`revenue-${item.label}`}>
                      <td>{item.label}</td>
                      <td>{formatINR(item.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Column Chart: Top Used Slots</h2>
          <div className="chart-panel">
            {slotColumns.length === 0 && (
              <span className="empty-activity">No slot usage data available</span>
            )}
            {slotColumns.length > 0 && (
              <div className="column-grid">
                {slotColumns.map((item) => {
                  const h = Math.max(12, ((Number(item.value) || 0) / maxSlotCount) * 140);
                  return (
                    <div key={item.label} className="column-item">
                      <div className="column-value">{item.value}</div>
                      <div className="column-bar" style={{ height: `${h}px` }} />
                      <div className="column-label">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="chart-table-wrap">
              <table className="chart-table">
                <thead>
                  <tr>
                    <th>Slot</th>
                    <th>Usage Count</th>
                  </tr>
                </thead>
                <tbody>
                  {slotColumns.length === 0 && (
                    <tr>
                      <td colSpan="2" className="empty-cell">No slot usage data available</td>
                    </tr>
                  )}
                  {slotColumns.map((item) => (
                    <tr key={`slot-${item.label}`}>
                      <td>{item.label}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="dashboard-section split-section">
          <div>
            <h2>Pie Chart: Payment Status</h2>
            <div className="chart-panel pie-row">
              <div
                className="payment-pie"
                style={{
                  background: `conic-gradient(
                    #198f65 0 ${paidDegrees}deg,
                    #d97706 ${paidDegrees}deg 360deg
                  )`,
                }}
              />
              <div className="payment-legend">
                <p><span className="dot paid-dot" /> Paid: {paidCount}</p>
                <p><span className="dot pending-dot" /> Pending: {pendingCount}</p>
              </div>
            </div>

            <div className="chart-table-wrap">
              <table className="chart-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Paid</td>
                    <td>{paidCount}</td>
                    <td>{paidPercent}%</td>
                  </tr>
                  <tr>
                    <td>Pending</td>
                    <td>{pendingCount}</td>
                    <td>{pendingPercent}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2>Bar Chart: Occupancy Overview</h2>
            <div className="chart-panel occupancy-panel">
              <div className="bar-item">
                <div className="bar-header">
                  <span>Occupied</span>
                  <strong>{occupiedSlots}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${occupiedPercent}%`,
                      background: '#d62839',
                    }}
                  />
                </div>
              </div>
              <div className="bar-item">
                <div className="bar-header">
                  <span>Available</span>
                  <strong>{availableSlots}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${availablePercent}%`,
                      background: '#2f855a',
                    }}
                  />
                </div>
              </div>

              <div className="chart-table-wrap">
                <table className="chart-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Count</th>
                      <th>Percent</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Occupied</td>
                      <td>{occupiedSlots}</td>
                      <td>{occupiedPercent}%</td>
                    </tr>
                    <tr>
                      <td>Available</td>
                      <td>{availableSlots}</td>
                      <td>{availablePercent}%</td>
                    </tr>
                    <tr>
                      <td>Total Slots</td>
                      <td>{totalParkingSlots}</td>
                      <td>100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Cancellation Refund Requests</h2>
          <div className="chart-panel">
            {refundAlerts.length === 0 ? (
              <span className="empty-activity">No pending cancellation refund requests</span>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Message</th>
                      <th>Requested At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refundAlerts.map((alert) => (
                      <tr key={alert.id}>
                        <td className="fw-semibold">{alert.title || 'Refund Request'}</td>
                        <td>
                          <div>{alert.message}</div>
                          {alert.details ? <small className="text-muted" style={{ whiteSpace: 'pre-line' }}>{alert.details}</small> : null}
                        </td>
                        <td>
                          {alert.createdAt ? new Date(alert.createdAt).toLocaleString('en-IN') : 'N/A'}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleDismissRefundAlert(alert.id)}
                          >
                            Mark Reviewed
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default AdminDashboardPage;
