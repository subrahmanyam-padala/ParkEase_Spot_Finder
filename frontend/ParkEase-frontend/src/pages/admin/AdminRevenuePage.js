import React, { useEffect, useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import KpiCard from '../../components/admin/KpiCard';
import { formatINR } from '../../utils/adminMetrics';
import { fetchAdminRevenue } from '../../utils/adminApi';
import './AdminRevenuePage.css';

const EMPTY_REVENUE = {
  totalRevenue: 0,
  todayRevenue: 0,
  monthRevenue: 0,
  weeklyRevenue: [],
  paidCount: 0,
  pendingCount: 0,
  bookingsCount: 0,
};

const AdminRevenuePage = () => {
  const [revenue, setRevenue] = useState(EMPTY_REVENUE);

  useEffect(() => {
    let mounted = true;

    const loadRevenue = async () => {
      try {
        const data = await fetchAdminRevenue();
        if (mounted) {
          setRevenue(data);
        }
      } catch {
        if (mounted) {
          setRevenue(EMPTY_REVENUE);
        }
      }
    };

    loadRevenue();
    return () => {
      mounted = false;
    };
  }, []);

  const maxWeekRevenue = Math.max(...revenue.weeklyRevenue.map((d) => Number(d.value) || 0), 1);

  return (
    <PageWrapper title="Revenue">
      <div className="kpi-cards mb-4">
        <KpiCard title="Total Revenue" value={formatINR(revenue.totalRevenue)} />
        <KpiCard title="Today's Revenue" value={formatINR(revenue.todayRevenue)} />
        <KpiCard title="Monthly Revenue" value={formatINR(revenue.monthRevenue)} />
      </div>

      <section className="revenue-section">
        <h3>Revenue Column Chart (7 Days)</h3>
        <div className="revenue-card">
          <div className="revenue-column-grid">
            {revenue.weeklyRevenue.map((item) => {
              const h = Math.max(8, ((Number(item.value) || 0) / maxWeekRevenue) * 160);
              return (
                <div key={item.label} className="revenue-column-item">
                  <div className="revenue-column-value">{formatINR(item.value)}</div>
                  <div className="revenue-column-bar" style={{ height: `${h}px` }} />
                  <div className="revenue-column-label">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="revenue-section">
        <h3>Payment Split (Pie Style)</h3>
        <div className="revenue-card pie-row">
          <div
            className="payment-pie"
            style={{
              background: `conic-gradient(
                #10b981 0 ${(revenue.paidCount / Math.max(revenue.bookingsCount, 1)) * 360}deg,
                #f59e0b ${(revenue.paidCount / Math.max(revenue.bookingsCount, 1)) * 360}deg 360deg
              )`,
            }}
          />
          <div className="payment-legend">
            <p><span className="dot paid-dot" /> Paid: {revenue.paidCount}</p>
            <p><span className="dot pending-dot" /> Pending: {revenue.pendingCount}</p>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default AdminRevenuePage;
