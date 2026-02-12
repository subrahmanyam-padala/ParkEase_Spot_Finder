import React from 'react';

export const ErrorAlert = ({ message, onDismiss }) => (
  <div className="alert alert-danger alert-dismissible fade show m-3" role="alert">
    <i className="bi bi-exclamation-triangle-fill me-2"></i>
    {message}
    {onDismiss && (
      <button type="button" className="btn-close" onClick={onDismiss}></button>
    )}
  </div>
);

export const SuccessAlert = ({ message }) => (
  <div className="alert alert-success m-3" role="alert">
    <i className="bi bi-check-circle-fill me-2"></i>
    {message}
  </div>
);
