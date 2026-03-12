import React, { useEffect, useMemo, useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import AdminTable from '../../components/admin/AdminTable';
import { fetchAdminUsersList } from '../../utils/adminApi';

const AdminAdminUsersPage = () => {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadAdmins = async () => {
      try {
        const data = await fetchAdminUsersList();
        if (mounted) {
          setAdmins(data);
        }
      } catch {
        if (mounted) {
          setAdmins([]);
        }
      }
    };

    loadAdmins();
    return () => {
      mounted = false;
    };
  }, []);

  const headers = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'adminId', label: 'Admin ID' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'status', label: 'Status' },
  ];

  const rows = useMemo(
    () =>
      admins.map((admin) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        adminId: admin.adminId,
        createdAt: admin.createdAt
          ? new Date(admin.createdAt).toLocaleString('en-IN')
          : 'NA',
        status: admin.status || 'Active',
      })),
    [admins]
  );

  return (
    <PageWrapper title="Admin Users">
      <AdminTable headers={headers} rows={rows} />
    </PageWrapper>
  );
};

export default AdminAdminUsersPage;
