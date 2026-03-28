import React, { useState, useEffect } from 'react';
import { getAdminAlerts, dismissAdminAlert } from '../../utils/adminApi';
import './AdminDashboardPage.css';

const typeIcons = { Info: 'ℹ️', Warning: '⚠️', Error: '❌', Success: '✅' };
const typeColors = { Info: '#3b82f6', Warning: '#f59e0b', Error: '#ef4444', Success: '#22c55e' };

const AdminAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { loadAlerts(); }, []);

  const loadAlerts = async () => {
    try {
      const data = await getAdminAlerts();
      setAlerts(data || []);
    } catch { setAlerts([]); }
    finally { setLoading(false); }
  };

  const handleDismiss = async (id) => {
    try {
      await dismissAdminAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch { alert('Failed to dismiss alert'); }
  };

  const filtered = filter === 'ALL' ? alerts : alerts.filter((a) => a.type === filter);

  // Group by date
  const groupedByDate = filtered.reduce((acc, alert) => {
    const date = alert.createdAt ? new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(alert);
    return acc;
  }, {});

  return (
    <div className="admin-dashboard-theme">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>System Alerts</h1>
          <p>{alerts.length} alert{alerts.length !== 1 ? 's' : ''} — review and manage system notifications</p>
        </div>
        <div className="welcome-icon">🔔</div>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 flex-wrap mb-4">
        {['ALL', 'Info', 'Warning', 'Error', 'Success'].map((tab) => (
          <button key={tab}
            className={`btn btn-sm ${filter === tab ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(tab)}>
            {tab !== 'ALL' && <span className="me-1">{typeIcons[tab]}</span>}
            {tab} ({tab === 'ALL' ? alerts.length : alerts.filter(a => a.type === tab).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-activity">No alerts to display</div>
      ) : (
        Object.entries(groupedByDate).map(([date, dateAlerts]) => (
          <div key={date} className="mb-4">
            <h6 className="fw-bold text-muted mb-3">
              <i className="bi bi-calendar3 me-2"></i>{date}
              <span className="badge bg-secondary ms-2">{dateAlerts.length}</span>
            </h6>
            <div className="d-flex flex-column gap-2">
              {dateAlerts.map((a) => (
                <div key={a.id} className="chart-panel d-flex align-items-start gap-3"
                  style={{ borderLeft: `4px solid ${typeColors[a.type] || '#94a3b8'}` }}>
                  <div className="flex-shrink-0" style={{ fontSize: '1.5rem' }}>
                    {typeIcons[a.type] || '📌'}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span className="fw-bold">{a.title || a.type}</span>
                        <span className="badge ms-2" style={{ backgroundColor: typeColors[a.type], color: '#fff' }}>
                          {a.type}
                        </span>
                      </div>
                      <small className="text-muted">
                        {a.createdAt ? new Date(a.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </small>
                    </div>
                    <p className="small mb-1 mt-1" style={{ color: '#475569' }}>{a.message}</p>
                    {a.details && <small className="text-muted">{a.details}</small>}
                  </div>
                  <button className="btn btn-sm btn-outline-secondary flex-shrink-0" onClick={() => handleDismiss(a.id)}
                    title="Dismiss">
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminAlertsPage;
