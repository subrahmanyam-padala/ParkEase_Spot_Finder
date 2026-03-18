import React, { useState, useEffect, useCallback } from 'react';
import { getAdminSlots, createAdminSlot, updateAdminSlot } from '../../utils/adminApi';
import './AdminDashboardPage.css';

const AdminSlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [form, setForm] = useState({ number: '', floor: 'Ground', status: 'available', pricePerHour: '75' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadSlots = useCallback(async () => {
    try {
      const data = await getAdminSlots();
      setSlots(data || []);
      setError('');
    } catch (err) {
      setSlots([]);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load slots';
      setError(msg);
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.number.trim()) { setError('Slot number is required'); return; }
    if (!form.floor.trim()) { setError('Floor is required'); return; }
    if (!form.status.trim()) { setError('Status is required'); return; }
    const price = parseFloat(form.pricePerHour);
    if (isNaN(price) || price < 0) { setError('Valid price is required'); return; }

    setSaving(true);
    try {
      const payload = {
        number: form.number.trim().toUpperCase(),
        floor: form.floor.trim(),
        status: form.status.trim().toLowerCase(),
        pricePerHour: price,
      };

      if (editSlot) {
        await updateAdminSlot(editSlot.id, payload);
      } else {
        await createAdminSlot(payload);
      }
      resetForm();
      loadSlots();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save';
      setError(msg);
    } finally { setSaving(false); }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditSlot(null);
    setForm({ number: '', floor: 'Ground', status: 'available', pricePerHour: '75' });
    setError('');
  };

  const startEdit = (slot) => {
    setEditSlot(slot);
    setForm({
      number: slot.number || '',
      floor: slot.floor || 'Ground',
      status: slot.status || 'available',
      pricePerHour: slot.pricePerHour?.toString() || '75',
    });
    setShowForm(true);
  };

  const filtered = slots.filter((s) => {
    const matchFilter = filter === 'ALL' || s.status?.toLowerCase() === filter.toLowerCase();
    const matchSearch = !search || s.number?.toLowerCase().includes(search.toLowerCase()) || s.floor?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="admin-dashboard-theme">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Parking Slots</h1>
          <p>Manage all parking slots ({slots.length} total)</p>
        </div>
        <div className="welcome-icon">🅿️</div>
      </div>

      {/* Actions Bar */}
      {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
      <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <i className={`bi ${showForm ? 'bi-x' : 'bi-plus'} me-1`}></i>
          {showForm ? 'Cancel' : 'Add New Slot'}
        </button>
        <input type="text" className="form-control" style={{ maxWidth: '200px' }} placeholder="Search slots..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="d-flex gap-2 ms-auto flex-wrap">
          {['ALL', 'available', 'occupied'].map((f) => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(f)}>
              {f === 'ALL' ? `All (${slots.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${slots.filter(s => s.status?.toLowerCase() === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="chart-panel mb-4">
          <h6 className="fw-bold mb-3">{editSlot ? 'Edit Slot' : 'Create New Slot'}</h6>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label small fw-bold">Slot Number *</label>
                <input type="text" className="form-control" value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  placeholder="e.g., A-01" required />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold">Floor *</label>
                <select className="form-select" value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })}>
                  <option value="Ground">Ground</option>
                  <option value="Floor 1">Floor 1</option>
                  <option value="Floor 2">Floor 2</option>
                  <option value="Floor 3">Floor 3</option>
                  <option value="Basement">Basement</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold">Status *</label>
                <select className="form-select" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold">Price/Hour (₹) *</label>
                <input type="number" className="form-control" min="0" step="0.01"
                  value={form.pricePerHour}
                  onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })} required />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary me-2" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : (editSlot ? 'Update Slot' : 'Create Slot')}
              </button>
              {editSlot && <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Cancel Edit</button>}
            </div>
          </form>
        </div>
      )}

      {/* Slots Table */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="chart-panel">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Floor</th>
                  <th>Status</th>
                  <th>Price/Hour</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="5" className="text-center text-muted py-4">No slots found</td></tr>
                ) : filtered.map((slot) => (
                  <tr key={slot.id}>
                    <td className="fw-bold">{slot.number}</td>
                    <td>{slot.floor}</td>
                    <td>
                      <span className="badge" style={{
                        backgroundColor: slot.status === 'available' ? '#22c55e' : '#ef4444', color: '#fff'
                      }}>
                        {slot.status}
                      </span>
                    </td>
                    <td>₹{slot.pricePerHour}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(slot)}>
                        <i className="bi bi-pencil"></i>
                      </button>
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

export default AdminSlotsPage;
