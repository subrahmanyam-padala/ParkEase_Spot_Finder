import React from 'react';
import './AdminTable.css';

/**
 * Generic admin table component.
 * headers: array of header labels
 * rows: array of objects; keys should match header keys
 * actions: optional render function receiving row object for action cells
 */
const AdminTable = ({ headers, rows, actions }) => {
  if (!rows || rows.length === 0) {
    return <div className="empty-state">No records to display</div>;
  }
  
  return (
    <div className="table-responsive">
      <table className="admin-table table table-striped">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h.key}>{h.label}</th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || JSON.stringify(row)}>
              {headers.map((h) => (
                <td key={h.key}>{row[h.key]}</td>
              ))}
              {actions && <td>{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;