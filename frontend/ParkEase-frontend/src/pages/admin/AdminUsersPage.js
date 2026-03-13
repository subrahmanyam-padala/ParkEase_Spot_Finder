import React, { useEffect, useMemo, useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import AdminTable from '../../components/admin/AdminTable';
import { fetchAdminUsers } from '../../utils/adminApi';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      try {
        const data = await fetchAdminUsers();
        if (mounted) {
          setUsers(data);
        }
      } catch {
        if (mounted) {
          setUsers([]);
        }
      }
    };

    loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  const headers = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'registered', label: 'Registered' },
    { key: 'status', label: 'Status' },
  ];

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = users.map((user) => ({
      id: user.userId,
      name: user.fullName,
      email: user.email,
      registered: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—',
      status: user.status || 'Active',
    }));
    if (!q) return base;
    return base.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.status.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleEdit = (user) => window.alert(`User: ${user.email}`);

  return (
    <PageWrapper title="Users">
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <input
          className="form-control"
          style={{ maxWidth: 240 }}
          placeholder="Search name, email, status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <AdminTable
        headers={headers}
        rows={rows}
        actions={(user) => (
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handleEdit(user)}
          >
            View
          </button>
        )}
      />
    </PageWrapper>
  );
};

export default AdminUsersPage;
