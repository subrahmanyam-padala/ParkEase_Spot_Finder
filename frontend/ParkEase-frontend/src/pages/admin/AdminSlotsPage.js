import React, { useEffect, useMemo, useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import AdminTable from '../../components/admin/AdminTable';
import { createAdminSlot, fetchAdminSlots, updateAdminSlot } from '../../utils/adminApi';

const AdminSlotsPage = () => {
  const [slots, setSlots] = useState([]);

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

  const rows = useMemo(
    () =>
      slots.map((slot) => ({
        id: slot.id,
        number: slot.number,
        floor: slot.floor || 'Ground',
        status: slot.status,
        price: `Rs ${Number(slot.pricePerHour) || 0}`,
      })),
    [slots]
  );

  const handleEdit = async (slotRow) => {
    const slot = slots.find((item) => item.id === slotRow.id);
    if (!slot) return;

    const currentPrice = Number(slot.pricePerHour) || 0;
    const nextPriceRaw = window.prompt(
      `Edit price for slot ${slot.number} (Rs/hour):`,
      `${currentPrice}`
    );

    if (nextPriceRaw === null) return;
    const nextPrice = Number(nextPriceRaw);
    if (Number.isNaN(nextPrice) || nextPrice < 0) {
      window.alert('Please enter a valid price.');
      return;
    }

    const nextStatus = window.prompt(
      `Edit status for slot ${slot.number} (available or occupied):`,
      slot.status
    );

    if (nextStatus === null) return;
    const statusClean = nextStatus.trim().toLowerCase();
    if (statusClean !== 'available' && statusClean !== 'occupied') {
      window.alert("Status must be 'available' or 'occupied'.");
      return;
    }

    try {
      await updateAdminSlot(slot.id, {
        number: slot.number,
        floor: slot.floor || 'Ground',
        status: statusClean,
        pricePerHour: nextPrice,
      });
      await loadSlots();
      window.alert(`Slot ${slot.number} updated successfully.`);
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to update slot.');
    }
  };

  const handleAddSlot = async () => {
    const number = window.prompt('Enter slot number (example: D1):', '');
    if (!number) return;

    const floor = window.prompt('Enter floor (example: Ground / Level 1):', 'Ground');
    if (floor === null) return;

    const priceRaw = window.prompt('Enter slot price per hour:', '75');
    if (priceRaw === null) return;
    const pricePerHour = Number(priceRaw);
    if (Number.isNaN(pricePerHour) || pricePerHour < 0) {
      window.alert('Please enter a valid slot price.');
      return;
    }

    try {
      await createAdminSlot({
        number: number.trim().toUpperCase(),
        floor: floor.trim() || 'Ground',
        status: 'available',
        pricePerHour,
      });
      await loadSlots();
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to create slot.');
    }
  };

  return (
    <PageWrapper title="Slots">
      <div className="mb-3">
        <button className="btn btn-primary" onClick={handleAddSlot}>
          New Slot
        </button>
      </div>
      <AdminTable
        headers={headers}
        rows={rows}
        actions={(slot) => (
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handleEdit(slot)}
          >
            Edit
          </button>
        )}
      />
    </PageWrapper>
  );
};

export default AdminSlotsPage;
