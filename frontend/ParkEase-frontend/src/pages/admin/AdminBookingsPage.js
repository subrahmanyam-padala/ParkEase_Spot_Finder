import React, { useEffect, useMemo, useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import AdminTable from '../../components/admin/AdminTable';
import { formatINR } from '../../utils/adminMetrics';
import { fetchAdminBookings } from '../../utils/adminApi';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);

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

  const rows = useMemo(
    () =>
      bookings.map((booking) => ({
        id: booking.id,
        user: booking.userName || 'Guest User',
        slot: booking.slot || '-',
        duration: `${booking.duration || 0}h`,
        amount: formatINR(booking.amount || 0),
        status: booking.paid ? 'Paid' : 'Pending',
      })),
    [bookings]
  );

  const handleView = (booking) => window.alert(`Booking ${booking.id} for ${booking.user}`);

  return (
    <PageWrapper title="Bookings">
      <AdminTable
        headers={headers}
        rows={rows}
        actions={(booking) => (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleView(booking)}
          >
            View
          </button>
        )}
      />
    </PageWrapper>
  );
};

export default AdminBookingsPage;
