import React from 'react';
import './PlaceholderBox.css';

const PlaceholderBox = ({ title, children }) => (
  <div className="placeholder-section">
    {title && <h2>{title}</h2>}
    <div className="placeholder-box">
      {children || <span>Coming soon</span>}
    </div>
  </div>
);

export default PlaceholderBox;