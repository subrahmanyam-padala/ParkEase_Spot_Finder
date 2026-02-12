import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="spinner-overlay">
      <div className="text-center">
        <div className="custom-spinner mb-3"></div>
        <p className="text-muted">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
