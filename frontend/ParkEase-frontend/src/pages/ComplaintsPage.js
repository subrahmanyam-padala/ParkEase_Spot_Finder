import React, { useState, useEffect } from 'react';
import { createComplaint, getMyComplaints } from '../utils/api';
import { Navbar } from '../components';
import BottomNav from '../components/BottomNav';

const statusColor = (status) => {
  const map = { OPEN: '#f59e0b', IN_PROGRESS: '#3b82f6', RESOLVED: '#22c55e', CLOSED: '#6b7280' };
  return map[status] || '#94a3b8';
};

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadComplaints(); }, []);

  const loadComplaints = async () => {
    try {
      const res = await getMyComplaints();
      setComplaints(res.data || []);
    } catch { setComplaints([]); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) { setMsg('Please fill all fields'); return; }
    setSubmitting(true);
    try {
      await createComplaint({ subject: subject.trim(), description: description.trim() });
      setMsg('Complaint submitted successfully!');
      setSubject(''); setDescription(''); setShowForm(false);
      loadComplaints();
    } catch { setMsg('Failed to submit complaint'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="mobile-page-wrapper">
      <Navbar />
      <div className="mobile-content fade-in">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              <i className="bi bi-exclamation-triangle me-2"></i>My Complaints
            </h5>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              <i className={`bi ${showForm ? 'bi-x' : 'bi-plus'} me-1`}></i>
              {showForm ? 'Cancel' : 'New'}
            </button>
          </div>

          {msg && (
            <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show py-2`}>
              {msg}
              <button type="button" className="btn-close btn-sm" onClick={() => setMsg('')}></button>
            </div>
          )}

          {showForm && (
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="fw-bold mb-3">File a Complaint</h6>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Subject</label>
                    <input type="text" className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief subject of your complaint" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea className="form-control" rows="4" value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your issue in detail..." required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                    {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</> : 'Submit Complaint'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-chat-square-text" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2">No complaints yet</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {complaints.map((c) => (
                <div key={c.id} className="card">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0">{c.subject}</h6>
                      <span className="badge" style={{ backgroundColor: statusColor(c.status), color: '#fff' }}>
                        {c.status}
                      </span>
                    </div>
                    <p className="small text-muted mb-2">{c.description}</p>
                    {c.adminResponse && (
                      <div className="bg-light rounded p-2 mb-2">
                        <small className="fw-bold text-primary"><i className="bi bi-reply me-1"></i>Admin Response:</small>
                        <p className="small mb-0 mt-1">{c.adminResponse}</p>
                      </div>
                    )}
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ComplaintsPage;
