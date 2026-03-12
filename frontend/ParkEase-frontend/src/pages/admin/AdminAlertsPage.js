import React, { useEffect, useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import AdminTable from '../../components/admin/AdminTable';
import { dismissAdminAlert, fetchAdminAlerts } from '../../utils/adminApi';

const AdminAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);

  const loadAlerts = async () => {
    try {
      const data = await fetchAdminAlerts();
      setAlerts(
        data.map((alert) => ({
          id: alert.id,
          message: alert.message,
          type: alert.type,
          date: alert.createdAt ? new Date(alert.createdAt).toLocaleString('en-IN') : 'NA',
        }))
      );
    } catch {
      setAlerts([]);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const headers = [
    { key: 'message', label: 'Message' },
    { key: 'type', label: 'Type' },
    { key: 'date', label: 'Date' },
  ];

  const handleDismiss = async (alert) => {
    try {
      await dismissAdminAlert(alert.id);
      await loadAlerts();
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to dismiss alert.');
    }
  };

  return (
    <PageWrapper title="Alerts">
      <AdminTable
        headers={headers}
        rows={alerts}
        actions={(alert) => (
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDismiss(alert)}
          >
            Dismiss
          </button>
        )}
      />
    </PageWrapper>
  );
};

export default AdminAlertsPage;
