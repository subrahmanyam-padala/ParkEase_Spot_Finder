import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: '#ECF0F1' }}
    >
      <div className="text-center p-4">
        <i className="bi bi-emoji-frown text-muted" style={{ fontSize: '5rem' }}></i>
        <h2 className="mt-3" style={{ color: '#2C3E50' }}>
          404 - Page Not Found
        </h2>
        <p className="text-muted">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary mt-3">
          <i className="bi bi-house me-2"></i>
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
