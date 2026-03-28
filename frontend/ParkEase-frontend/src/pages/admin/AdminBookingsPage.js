import React, { useState, useEffect } from 'react';
import { getAdminBookings } from '../../utils/adminApi';
import './AdminDashboardPage.css';

const statusColor = (status) => {
  const normalized = (status || '').toUpperCase();
  if (['PAID', 'CHECKED_IN', 'COMPLETED', 'OVERSTAY_PAID'].includes(normalized)) return '#22c55e';
  if (normalized === 'OVERSTAY') return '#ef4444';
  if (normalized === 'CANCELLED') return '#6b7280';
  return '#f59e0b';
};

const parseBackendDate = (value) => {
  if (!value) return null;

  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = value;
    const ms = Math.floor(Number(nano) / 1000000);
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), ms);
  }

  if (typeof value === 'object') {
    const year = value.year;
    const month = value.monthValue ?? value.month;
    const day = value.dayOfMonth ?? value.day;
    if (year && month && day) {
      const hour = value.hour ?? 0;
      const minute = value.minute ?? 0;
      const second = value.second ?? 0;
      const nano = value.nano ?? 0;
      const ms = Math.floor(Number(nano) / 1000000);
      return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), ms);
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await getAdminBookings();
      const raw = Array.isArray(res) ? res : [];

      // Local-date window: today + previous 2 days.
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const fromDate = new Date(todayStart);
      fromDate.setDate(fromDate.getDate() - 2);

      const data = raw
        .filter((b) => {
          const created = parseBackendDate(b?.createdAt) || parseBackendDate(b?.updatedAt);
          if (!created) return false;
          const createdLocalDate = new Date(created);
          createdLocalDate.setHours(0, 0, 0, 0);
          return createdLocalDate >= fromDate;
        })
        .sort((a, b) => {
          const aDate = parseBackendDate(a?.createdAt) || parseBackendDate(a?.updatedAt) || new Date(0);
          const bDate = parseBackendDate(b?.createdAt) || parseBackendDate(b?.updatedAt) || new Date(0);
          return bDate - aDate;
        });
      setBookings(data);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (b.userName || '').toLowerCase().includes(s) ||
      (b.userEmail || '').toLowerCase().includes(s) ||
      (b.ticketNumber || '').toLowerCase().includes(s) ||
      (b.vehicleNumber || '').toLowerCase().includes(s) ||
      (b.slot || '').toLowerCase().includes(s) ||
      String(b.id || '').includes(s)
    );
  });

  return (
    <div className="admin-dashboard-theme">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Bookings</h1>
          <p>Last 3 days parking bookings — most recent first ({bookings.length} total)</p>
        </div>
        <div className="welcome-icon">📋</div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input type="text" className="form-control" placeholder="Search by ticket, user, email, vehicle, slot, or booking ID..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="chart-panel">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ticket</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Vehicle</th>
                  <th>Slot</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                  <th>Valid Until</th>
                  <th>Booked At</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="12" className="text-center text-muted py-4">No bookings found in last 3 days</td></tr>
                ) : filtered.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td className="fw-semibold">{b.ticketNumber || 'N/A'}</td>
                    <td className="fw-bold">{b.userName || 'N/A'}</td>
                    <td><small>{b.userEmail || 'N/A'}</small></td>
                    <td>{b.vehicleNumber || 'N/A'}</td>
                    <td>{b.slot || 'N/A'}</td>
                    <td>{b.duration || 0}h</td>
                    <td>₹{b.amount}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: statusColor(b.status), color: '#fff' }}>
                        {b.status || (b.paid ? 'PAID' : 'PENDING')}
                      </span>
                    </td>
                    <td>{b.paymentMethod || 'N/A'}</td>
                    <td><small>{parseBackendDate(b.validUntil) ? parseBackendDate(b.validUntil).toLocaleString() : 'N/A'}</small></td>
                    <td><small>{parseBackendDate(b.createdAt) ? parseBackendDate(b.createdAt).toLocaleString() : 'N/A'}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
