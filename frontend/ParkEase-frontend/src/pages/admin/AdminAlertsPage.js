import React, { useEffect, useMemo, useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import AdminTable from '../../components/admin/AdminTable';
import { dismissAdminAlert, fetchAdminAlerts } from '../../utils/adminApi';

const AdminAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [filterType, setFilterType] = useState('ALL');

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

  const rows = useMemo(() => {
    if (filterType === 'ALL') return alerts;
    return alerts.filter((a) => a.type?.toUpperCase() === filterType);
  }, [alerts, filterType]);

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
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="ALL">All Types</option>
          <option value="INFO">Info</option>
          <option value="WARNING">Warning</option>
          <option value="ERROR">Error</option>
          <option value="SUCCESS">Success</option>
        </select>
      </div>
      <AdminTable
        headers={headers}
        rows={rows}
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
