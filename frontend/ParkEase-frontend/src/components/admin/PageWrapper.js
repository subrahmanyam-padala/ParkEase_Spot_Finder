import React from 'react';
import './AdminCommon.css';
import './PageWrapper.css';

const PageWrapper = ({ title, children }) => {
  return (
    <div className="page-wrapper">
      {title && <h2 className="page-heading">{title}</h2>}
      <div className="page-content">{children}</div>
    </div>
  );
};

export default PageWrapper;