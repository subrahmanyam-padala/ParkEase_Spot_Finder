import React, { useEffect, useState } from 'react';
import { fetchAdminRefunds, updateAdminRefundStatus } from '../../utils/adminApi';
import './AdminDashboardPage.css';

const statusColor = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'REQUESTED') return '#f59e0b';
  if (s === 'ACCEPTED') return '#3b82f6';
  if (s === 'IN_PROGRESS') return '#8b5cf6';
  if (s === 'COMPLETED') return '#22c55e';
  return '#6b7280';
};

const AdminRefundsPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadRefunds = async () => {
    try {
      const data = await fetchAdminRefunds();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const handleStatusUpdate = async (bookingId, nextStatus) => {
    setUpdatingId(bookingId);
    try {
      await updateAdminRefundStatus(bookingId, nextStatus);
      await loadRefunds();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to update refund status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-dashboard-theme">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Refund Management</h1>
          <p>Dedicated workflow for cancellation refund requests</p>
        </div>
        <div className="welcome-icon">💸</div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="chart-panel">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Ticket</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Slot</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Requested At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">No cancellation refund requests</td>
                  </tr>
                ) : rows.map((r) => (
                  <tr key={r.bookingId}>
                    <td>#{r.bookingId}</td>
                    <td className="fw-semibold">{r.ticketNumber || 'N/A'}</td>
                    <td>{r.userName || 'N/A'}</td>
                    <td><small>{r.userEmail || 'N/A'}</small></td>
                    <td>{r.slot || 'N/A'}</td>
                    <td>₹{r.amount || 0}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: statusColor(r.refundStatus), color: '#fff' }}>
                        {r.refundStatus || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <small>
                        {r.cancellationRequestedAt ? new Date(r.cancellationRequestedAt).toLocaleString('en-IN') : 'N/A'}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          disabled={updatingId === r.bookingId || r.refundStatus === 'ACCEPTED'}
                          onClick={() => handleStatusUpdate(r.bookingId, 'ACCEPTED')}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          disabled={updatingId === r.bookingId || r.refundStatus === 'IN_PROGRESS'}
                          onClick={() => handleStatusUpdate(r.bookingId, 'IN_PROGRESS')}
                        >
                          Progress
                        </button>
                        <button
                          className="btn btn-sm btn-outline-success"
                          disabled={updatingId === r.bookingId || r.refundStatus === 'COMPLETED'}
                          onClick={() => handleStatusUpdate(r.bookingId, 'COMPLETED')}
                        >
                          Completed
                        </button>
                      </div>
                    </td>
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

export default AdminRefundsPage;
