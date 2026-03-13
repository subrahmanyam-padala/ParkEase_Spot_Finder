import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoadingSpinner from './LoadingSpinner';
import { isAdminLoggedIn } from '../utils/adminAuth';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useApp();

  if (requireAdmin) {
    if (!isAdminLoggedIn()) {
      return <Navigate to="/login" replace />;
    }

    return children;
  }

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
