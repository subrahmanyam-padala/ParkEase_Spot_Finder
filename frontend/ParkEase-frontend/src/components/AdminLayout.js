import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { formatINR } from '../utils/adminMetrics';
import { clearAdminSession, getAdminSession } from '../utils/adminAuth';
import { fetchAdminOverview, fetchAdminProfile } from '../utils/adminApi';
import './AdminLayout.css';
import './admin/AdminCommon.css';

const EMPTY_OVERVIEW = {
  bookingsCount: 0,
  usersCount: 0,
  totalRevenue: 0,
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminSession, setAdminSession] = useState(getAdminSession());
  const [currentAdmin, setCurrentAdmin] = useState(getAdminSession());
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileRef = React.useRef(null);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const handler = (event) => setSidebarOpen(!event.matches);
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const handleOutside = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setShowProfileCard(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    const syncAdminState = () => {
      const session = getAdminSession();
      setAdminSession(session);
      setCurrentAdmin((prev) => session || prev);
    };

    syncAdminState();
    window.addEventListener('focus', syncAdminState);
    window.addEventListener('storage', syncAdminState);

    return () => {
      window.removeEventListener('focus', syncAdminState);
      window.removeEventListener('storage', syncAdminState);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadAdminShell = async () => {
      try {
        const [profile, nextOverview] = await Promise.all([
          fetchAdminProfile(),
          fetchAdminOverview(),
        ]);

        if (!mounted) return;
        setCurrentAdmin(profile);
        setOverview(nextOverview);
      } catch {
        clearAdminSession();
        if (mounted) {
          navigate('/admin/login');
        }
      }
    };

    if (adminSession?.token) {
      loadAdminShell();
    }

    return () => {
      mounted = false;
    };
  }, [adminSession?.token, navigate]);

  const adminInitials = useMemo(() => {
    const name = currentAdmin?.name || adminSession?.name || 'Admin User';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }, [adminSession?.name, currentAdmin?.name]);

  const toggleSidebar = () => setSidebarOpen((open) => !open);

  const handleAdminAuthAction = () => {
    clearAdminSession();
    setAdminSession(null);
    navigate('/admin/login');
  };

  return (
    <div className="admin-container">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          ParkEase Admin
        </div>

        <div className="admin-topbar-right">
          <div className="admin-profile-wrap" ref={profileRef}>
            <button
              className="admin-avatar admin-avatar-btn"
              onClick={() => setShowProfileCard((prev) => !prev)}
            >
              {adminInitials || 'AD'}
            </button>
            {showProfileCard && (
              <div className="admin-profile-popover">
                <span className="admin-name">{currentAdmin?.name || 'Admin User'}</span>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Email</span>
                  <span className="admin-meta">{currentAdmin?.email || 'No email'}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Mobile</span>
                  <span className="admin-meta">{currentAdmin?.mobile || 'NA'}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Admin ID</span>
                  <span className="admin-meta">{currentAdmin?.adminId || 'NA'}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Created</span>
                  <span className="admin-meta">
                    {currentAdmin?.createdAt
                      ? new Date(currentAdmin.createdAt).toLocaleString('en-IN')
                      : 'NA'}
                  </span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Status</span>
                  <span className="admin-meta">{currentAdmin?.status || 'Active'}</span>
                </div>
              </div>
            )}
          </div>
          <button className="admin-auth-btn" onClick={handleAdminAuthAction}>
            Admin Logout
          </button>
        </div>
      </header>

      <div className="admin-body">
        <nav className={`admin-sidebar${sidebarOpen ? '' : ' closed'}`}>
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/scanner">Gate Scanner</NavLink>
          <NavLink to="/admin/slots">Slots</NavLink>
          <NavLink to="/admin/bookings" className="sidebar-link-with-badge">
            <span>Bookings</span>
            <span className="sidebar-badge">{overview.bookingsCount || 0}</span>
          </NavLink>
          <NavLink to="/admin/revenue" className="sidebar-link-with-badge">
            <span>Revenue</span>
            <span className="sidebar-badge revenue-badge">
              {formatINR(overview.totalRevenue || 0)}
            </span>
          </NavLink>
          <NavLink to="/admin/users" className="sidebar-link-with-badge">
            <span>Users</span>
            <span className="sidebar-badge">{overview.usersCount || 0}</span>
          </NavLink>
          <NavLink to="/admin/admin-users">Admin Users</NavLink>
          <NavLink to="/admin/reports">Reports</NavLink>
          <NavLink to="/admin/complaints">Complaints</NavLink>
        </nav>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
