import React, { useState, useEffect } from 'react';
import { getAdminComplaints, respondAdminComplaint } from '../../utils/adminApi';
import './AdminDashboardPage.css';

const statusColor = (status) => {
  const map = { OPEN: '#f59e0b', IN_PROGRESS: '#3b82f6', RESOLVED: '#22c55e', CLOSED: '#6b7280' };
  return map[status] || '#94a3b8';
};

const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [responding, setResponding] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [responseStatus, setResponseStatus] = useState('RESOLVED');

  useEffect(() => { loadComplaints(); }, []);

  const loadComplaints = async () => {
    try {
      const data = await getAdminComplaints();
      setComplaints(data || []);
    } catch { setComplaints([]); }
    finally { setLoading(false); }
  };

  const handleRespond = async (id) => {
    if (!responseText.trim()) return;
    try {
      await respondAdminComplaint(id, { adminResponse: responseText.trim(), status: responseStatus });
      setResponding(null); setResponseText(''); setResponseStatus('RESOLVED');
      loadComplaints();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to respond';
      alert(message);
    }
  };

  const filtered = filter === 'ALL' ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div className="admin-dashboard-theme">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Complaints Management</h1>
          <p>View and respond to user complaints</p>
        </div>
        <div className="welcome-icon">📋</div>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 flex-wrap mb-4">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((tab) => (
          <button key={tab}
            className={`btn btn-sm ${filter === tab ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(tab)}>
            {tab.replace('_', ' ')} ({tab === 'ALL' ? complaints.length : complaints.filter(c => c.status === tab).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-activity">No complaints found</div>
      ) : (
        <div className="row g-3">
          {filtered.map((c) => (
            <div key={c.id} className="col-12 col-lg-6">
              <div className="chart-panel h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="fw-bold mb-1">{c.subject}</h6>
                    <small className="text-muted">
                      <i className="bi bi-person me-1"></i>{c.userName || 'Unknown'}
                      <span className="ms-2"><i className="bi bi-envelope me-1"></i>{c.userEmail || ''}</span>
                    </small>
                  </div>
                  <span className="badge" style={{ backgroundColor: statusColor(c.status), color: '#fff' }}>{c.status}</span>
                </div>

                <p className="small mb-2" style={{ color: '#475569' }}>{c.description}</p>

                {c.adminResponse && (
                  <div className="bg-light rounded p-2 mb-2">
                    <small className="fw-bold text-primary"><i className="bi bi-reply me-1"></i>Your Response:</small>
                    <p className="small mb-0 mt-1">{c.adminResponse}</p>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                  </small>
                  {c.status !== 'CLOSED' && (
                    <button className="btn btn-sm btn-outline-primary"
                      onClick={() => { setResponding(responding === c.id ? null : c.id); setResponseText(c.adminResponse || ''); }}>
                      <i className="bi bi-reply me-1"></i>Respond
                    </button>
                  )}
                </div>

                {responding === c.id && (
                  <div className="mt-3 border-top pt-3">
                    <textarea className="form-control mb-2" rows="3" value={responseText}
                      onChange={(e) => setResponseText(e.target.value)} placeholder="Type your response..."></textarea>
                    <div className="d-flex gap-2">
                      <select className="form-select form-select-sm" style={{ maxWidth: '160px' }}
                        value={responseStatus} onChange={(e) => setResponseStatus(e.target.value)}>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                      <button className="btn btn-sm btn-primary" onClick={() => handleRespond(c.id)}>
                        <i className="bi bi-send me-1"></i>Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComplaintsPage;
