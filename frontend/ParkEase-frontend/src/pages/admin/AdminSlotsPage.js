import React, { useEffect, useMemo, useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import AdminTable from '../../components/admin/AdminTable';
import { createAdminSlot, fetchAdminSlots, updateAdminSlot } from '../../utils/adminApi';

const AdminSlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formData, setFormData] = useState({ id: null, number: '', floor: 'Ground', status: 'available', pricePerHour: 0 });
  const [saving, setSaving] = useState(false);

  const loadSlots = async () => {
    try {
      const data = await fetchAdminSlots();
      setSlots(data);
    } catch {
      setSlots([]);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const headers = [
    { key: 'number', label: 'Slot #' },
    { key: 'floor', label: 'Floor' },
    { key: 'status', label: 'Status' },
    { key: 'price', label: 'Price / Hour' },
  ];

  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const baseRows = slots.map((slot) => ({
      id: slot.id,
      number: slot.number,
      floor: slot.floor || 'Ground',
      status: slot.status,
      price: `Rs ${Number(slot.pricePerHour) || 0}`,
    }));
    if (!q) return baseRows;
    return baseRows.filter(
      (r) =>
        r.number.toLowerCase().includes(q) ||
        r.floor.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [slots, filter]);

  const openForm = (mode, slot) => {
    setFormMode(mode);
    if (mode === 'edit' && slot) {
      setFormData({
        id: slot.id,
        number: slot.number,
        floor: slot.floor || 'Ground',
        status: slot.status || 'available',
        pricePerHour: Number(slot.pricePerHour) || 0,
      });
    } else {
      setFormData({ id: null, number: '', floor: 'Ground', status: 'available', pricePerHour: 0 });
    }
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { id, number, floor, status, pricePerHour } = formData;
    if (!number.trim()) {
      window.alert('Slot number is required');
      return;
    }
    if (Number.isNaN(Number(pricePerHour)) || Number(pricePerHour) < 0) {
      window.alert('Enter a valid price');
      return;
    }
    const payload = {
      number: number.trim().toUpperCase(),
      floor: floor.trim() || 'Ground',
      status: status.trim().toLowerCase() === 'occupied' ? 'occupied' : 'available',
      pricePerHour: Number(pricePerHour),
    };
    try {
      setSaving(true);
      if (formMode === 'edit' && id) {
        await updateAdminSlot(id, payload);
      } else {
        await createAdminSlot(payload);
      }
      await loadSlots();
      setShowForm(false);
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to save slot.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper title="Slots">
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <button className="btn btn-primary" onClick={() => openForm('create')}>
          + New Slot
        </button>
        <input
          className="form-control"
          style={{ maxWidth: 260 }}
          placeholder="Search by number, floor, status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {showForm && (
        <form className="card p-3 mb-3" onSubmit={handleSave}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">{formMode === 'edit' ? 'Edit Slot' : 'Add Slot'}</h5>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowForm(false)}>
              Close
            </button>
          </div>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Slot Number</label>
              <input
                className="form-control"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Floor</label>
              <input
                className="form-control"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Price / Hour (₹)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-success" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowForm(false)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <AdminTable
        headers={headers}
        rows={filteredRows}
        actions={(slot) => (
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => openForm('edit', slot)}
          >
            Edit
          </button>
        )}
      />
    </PageWrapper>
  );
};

export default AdminSlotsPage;
