import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoadingSpinner from './LoadingSpinner';
import { isAdminLoggedIn } from '../utils/adminAuth';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useApp();

  // ---------- ADMIN ROUTE GUARD ----------
  if (requireAdmin) {
    // Must have a valid admin session (logged in via Admin Login)
    if (!isAdminLoggedIn()) {
      return <Navigate to="/admin/login" replace />;
    }

    // If a regular user is logged in but NOT an admin, block access
    if (user && user.role && user.role !== 'ADMIN') {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  }

  // ---------- USER ROUTE GUARD ----------
  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

