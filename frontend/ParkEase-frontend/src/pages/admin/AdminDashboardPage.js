import React, { useEffect, useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import KpiCard from '../../components/admin/KpiCard';
import { formatINR } from '../../utils/adminMetrics';
import { fetchAdminOverview } from '../../utils/adminApi';
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

  useEffect(() => {
    let mounted = true;

    const loadOverview = async () => {
      try {
        const response = await fetchAdminOverview();
        if (mounted) {
          setOverview(response);
        }
      } catch {
        if (mounted) {
          setOverview(EMPTY_DATA);
        }
      }
    };

    loadOverview();
    return () => {
      mounted = false;
    };
  }, []);

  const maxRevenue = Math.max(...overview.weeklyRevenue.map((item) => Number(item.value) || 0), 1);
  const linePoints = overview.weeklyRevenue
    .map((item, index) => {
      const x = (index / Math.max(overview.weeklyRevenue.length - 1, 1)) * 100;
      const y = 100 - ((Number(item.value) || 0) / maxRevenue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <PageWrapper title="Dashboard">
      <div className="admin-dashboard-theme">
        <div className="kpi-cards">
          <KpiCard title="Total Parking Slots" value={overview.totalParkingSlots} />
          <KpiCard title="Occupied Slots" value={overview.occupiedSlots} />
          <KpiCard title="Available Slots" value={overview.availableSlots} />
          <KpiCard title="Revenue Today" value={formatINR(overview.todayRevenue)} />
          <KpiCard title="Active Bookings" value={overview.bookingsCount} />
          <KpiCard title="Registered Users" value={overview.usersCount} />
        </div>

        <section className="dashboard-section">
          <h2>Line Chart: Revenue Trend (Last 7 Days)</h2>
          <div className="chart-panel">
            <svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline points={linePoints} />
            </svg>
            <div className="line-chart-labels">
              {overview.weeklyRevenue.map((item) => (
                <div key={item.label} className="line-label-item">
                  <span>{item.label}</span>
                  <strong>{formatINR(item.value)}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Column Chart: Top Used Slots</h2>
          <div className="chart-panel">
            {overview.slotColumns.length === 0 && (
              <span className="empty-activity">No slot usage data available</span>
            )}
            {overview.slotColumns.length > 0 && (
              <div className="column-grid">
                {overview.slotColumns.map((item) => {
                  const maxSlotCount = Math.max(...overview.slotColumns.map((d) => Number(d.value) || 0), 1);
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
                    #198f65 0 ${(overview.paidCount / Math.max(overview.bookingsCount, 1)) * 360}deg,
                    #d97706 ${(overview.paidCount / Math.max(overview.bookingsCount, 1)) * 360}deg 360deg
                  )`,
                }}
              />
              <div className="payment-legend">
                <p><span className="dot paid-dot" /> Paid: {overview.paidCount}</p>
                <p><span className="dot pending-dot" /> Pending: {overview.pendingCount}</p>
              </div>
            </div>
          </div>

          <div>
            <h2>Bar Chart: Occupancy Overview</h2>
            <div className="chart-panel occupancy-panel">
              <div className="bar-item">
                <div className="bar-header">
                  <span>Occupied</span>
                  <strong>{overview.occupiedSlots}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(overview.occupiedSlots / Math.max(overview.totalParkingSlots, 1)) * 100}%`,
                      background: '#d62839',
                    }}
                  />
                </div>
              </div>
              <div className="bar-item">
                <div className="bar-header">
                  <span>Available</span>
                  <strong>{overview.availableSlots}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(overview.availableSlots / Math.max(overview.totalParkingSlots, 1)) * 100}%`,
                      background: '#2f855a',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default AdminDashboardPage;
