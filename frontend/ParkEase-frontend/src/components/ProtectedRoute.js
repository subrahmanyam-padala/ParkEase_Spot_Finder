import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useApp();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
