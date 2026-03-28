import React, { useState, useEffect } from 'react';
import { getAdminUsersList, adminRegister } from '../../utils/adminApi';
import './AdminDashboardPage.css';

const AdminAdminUsersPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', adminId: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadAdmins(); }, []);

  const loadAdmins = async () => {
    try {
      const data = await getAdminUsersList();
      setAdmins(data || []);
    } catch { setAdmins([]); }
    finally { setLoading(false); }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.name || !form.email || !form.mobile || !form.adminId || !form.password) {
      setError('All fields are required'); return;
    }
    setSaving(true);
    try {
      await adminRegister(form);
      setSuccess('Admin created successfully!');
      setForm({ name: '', email: '', mobile: '', adminId: '', password: '' });
      setShowForm(false);
      loadAdmins();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create admin');
    } finally { setSaving(false); }
  };

  const filtered = admins.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (a.name || '').toLowerCase().includes(s) || (a.email || '').toLowerCase().includes(s) || (a.adminId || '').toLowerCase().includes(s);
  });

  return (
    <div className="admin-dashboard-theme">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Admin Users</h1>
          <p>Manage administrator accounts ({admins.length} total)</p>
        </div>
        <div className="welcome-icon">👥</div>
      </div>

      {/* Actions */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}>
          <i className={`bi ${showForm ? 'bi-x' : 'bi-plus'} me-1`}></i>
          {showForm ? 'Cancel' : 'Add Admin'}
        </button>
        <input type="text" className="form-control" style={{ maxWidth: '250px' }} placeholder="Search admins..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {success && <div className="alert alert-success py-2 mb-3">{success}</div>}

      {/* Add Admin Form */}
      {showForm && (
        <div className="chart-panel mb-4">
          <h6 className="fw-bold mb-3">Create New Admin</h6>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleAddAdmin}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-bold">Full Name *</label>
                <input type="text" className="form-control" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Email *</label>
                <input type="email" className="form-control" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Mobile *</label>
                <input type="text" className="form-control" value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Admin ID *</label>
                <input type="text" className="form-control" value={form.adminId}
                  onChange={(e) => setForm({ ...form, adminId: e.target.value })} placeholder="e.g., ADMIN001" required />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Password *</label>
                <input type="password" className="form-control" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-3" disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Creating...</> : 'Create Admin'}
            </button>
          </form>
        </div>
      )}

      {/* Admin Table */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="chart-panel">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Admin ID</th>
                  <th>Created</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-muted py-4">No admins found</td></tr>
                ) : filtered.map((a) => (
                  <tr key={a.id || a.adminId}>
                    <td className="fw-bold">{a.name}</td>
                    <td>{a.email}</td>
                    <td>{a.mobile}</td>
                    <td><code>{a.adminId}</code></td>
                    <td><small>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'}</small></td>
                    <td>
                      <span className="badge" style={{ backgroundColor: a.status === 'Active' ? '#22c55e' : '#6b7280', color: '#fff' }}>
                        {a.status || 'Active'}
                      </span>
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

export default AdminAdminUsersPage;
