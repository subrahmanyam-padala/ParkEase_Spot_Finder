import React from 'react';
import './KpiCard.css';

const KpiCard = ({ title, value }) => (
  <div className="kpi-card">
    <div className="kpi-title">{title}</div>
    {value !== undefined && <div className="kpi-value">{value}</div>}
  </div>
);

export default KpiCard;