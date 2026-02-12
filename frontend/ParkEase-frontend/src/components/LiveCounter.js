import React, { useState, useEffect } from 'react';

const LiveCounter = ({ available, total, compact = false }) => {
  const [count, setCount] = useState(available);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const variation = Math.floor(Math.random() * 5) - 2;
      setCount((prev) => Math.max(0, Math.min(total, prev + variation)));
    }, 5000);
    return () => clearInterval(interval);
  }, [total]);

  if (compact) {
    return (
      <div className="d-flex align-items-center justify-content-center">
        <span className="live-badge me-2">
          <i className="bi bi-record-fill me-1"></i>LIVE
        </span>
        <span className="fs-4 fw-bold text-white">{count}/{total}</span>
        <span className="ms-2 text-white-50">Available</span>
      </div>
    );
  }

  return (
    <div className="live-counter fade-in">
      <div className="mb-2">
        <span className="live-badge">
          <i className="bi bi-record-fill me-1"></i>LIVE
        </span>
      </div>
      <div className="live-counter-number">{count}/{total}</div>
      <p className="mb-0 mt-2 opacity-75">Slots Available Now</p>
    </div>
  );
};

export default LiveCounter;
