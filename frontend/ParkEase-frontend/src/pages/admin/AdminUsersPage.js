import React, { useEffect, useMemo, useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import AdminTable from '../../components/admin/AdminTable';
import { fetchAdminUsers } from '../../utils/adminApi';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);

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

  const rows = useMemo(
    () =>
      users.map((user) => ({
        id: user.userId,
        name: user.fullName,
        email: user.email,
        registered: 'Active account',
        status: 'Active',
      })),
    [users]
  );

  const handleEdit = (user) => window.alert(`User: ${user.email}`);

  return (
    <PageWrapper title="Users">
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
