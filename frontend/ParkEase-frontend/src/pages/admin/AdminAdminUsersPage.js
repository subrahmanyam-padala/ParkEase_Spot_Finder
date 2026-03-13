import React, { useEffect, useMemo, useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import AdminTable from '../../components/admin/AdminTable';
import { fetchAdminUsersList } from '../../utils/adminApi';

const AdminAdminUsersPage = () => {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState('');

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

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      adminId: admin.adminId,
      createdAt: admin.createdAt
        ? new Date(admin.createdAt).toLocaleString('en-IN')
        : 'NA',
      status: admin.status || 'Active',
    }));
    if (!q) return base;
    return base.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.adminId || '').toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
    );
  }, [admins, search]);

  return (
    <PageWrapper title="Admin Users">
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <input
          className="form-control"
          style={{ maxWidth: 240 }}
          placeholder="Search admin by name, email, ID, status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <AdminTable headers={headers} rows={rows} />
    </PageWrapper>
  );
};

export default AdminAdminUsersPage;
