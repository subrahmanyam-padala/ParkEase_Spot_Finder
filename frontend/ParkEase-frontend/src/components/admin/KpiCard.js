import React from 'react';
import './KpiCard.css';

const KpiCard = ({ title, value, icon }) => (
  <div className="kpi-card">
    {icon && <div className="kpi-icon">{icon}</div>}
    <div className="kpi-content">
      <div className="kpi-title">{title}</div>
      {value !== undefined && <div className="kpi-value">{value}</div>}
    </div>
  </div>
);

export default KpiCard;