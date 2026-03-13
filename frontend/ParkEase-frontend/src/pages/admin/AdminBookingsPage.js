import React, { useEffect, useMemo, useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import AdminTable from '../../components/admin/AdminTable';
import { formatINR } from '../../utils/adminMetrics';
import { fetchAdminBookings } from '../../utils/adminApi';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadBookings = async () => {
      try {
        const data = await fetchAdminBookings();
        if (mounted) {
          setBookings(data);
        }
      } catch {
        if (mounted) {
          setBookings([]);
        }
      }
    };

    loadBookings();
    return () => {
      mounted = false;
    };
  }, []);

  const headers = [
    { key: 'id', label: 'Booking ID' },
    { key: 'user', label: 'User' },
    { key: 'slot', label: 'Slot' },
    { key: 'duration', label: 'Duration' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
  ];

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = bookings.map((booking) => ({
      id: booking.id,
      user: booking.userName || 'Guest User',
      slot: booking.slot || '-',
      duration: `${booking.duration || 0}h`,
      amount: formatINR(booking.amount || 0),
      status: booking.paid ? 'Paid' : 'Pending',
      raw: booking,
    }));
    if (!q) return base;
    return base.filter((b) =>
      b.user.toLowerCase().includes(q) ||
      b.slot.toLowerCase().includes(q) ||
      b.status.toLowerCase().includes(q)
    );
  }, [bookings, search]);

  return (
    <PageWrapper title="Bookings">
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <input
          className="form-control"
          style={{ maxWidth: 260 }}
          placeholder="Search by user, slot, status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AdminTable
        headers={headers}
        rows={rows}
        actions={(booking) => (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setSelected(booking.raw || booking)}
          >
            View
          </button>
        )}
      />

      {selected && (
        <div className="card mt-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Booking #{selected.id}</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelected(null)}>Close</button>
          </div>
          <div className="card-body row g-3">
            <div className="col-md-4">
              <div className="text-muted small">User</div>
              <div className="fw-bold">{selected.userName || 'Guest User'}</div>
            </div>
            <div className="col-md-2">
              <div className="text-muted small">Slot</div>
              <div className="fw-bold">{selected.slot || '-'}</div>
            </div>
            <div className="col-md-2">
              <div className="text-muted small">Duration</div>
              <div className="fw-bold">{selected.duration || '--'}h</div>
            </div>
            <div className="col-md-2">
              <div className="text-muted small">Amount</div>
              <div className="fw-bold">{formatINR(selected.amount || 0)}</div>
            </div>
            <div className="col-md-2">
              <div className="text-muted small">Status</div>
              <span className={`badge ${selected.paid ? 'bg-success' : 'bg-warning text-dark'}`}>
                {selected.paid ? 'Paid' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default AdminBookingsPage;
