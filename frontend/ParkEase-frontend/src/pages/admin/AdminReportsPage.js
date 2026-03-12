import React, { useEffect, useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import { fetchAdminReports } from '../../utils/adminApi';

const AdminReportsPage = () => {
  const [report, setReport] = useState({
    highlights: [],
    occupancyByFloor: [],
  });

  useEffect(() => {
    let mounted = true;

    const loadReports = async () => {
      try {
        const data = await fetchAdminReports();
        if (mounted) {
          setReport(data);
        }
      } catch {
        if (mounted) {
          setReport({ highlights: [], occupancyByFloor: [] });
        }
      }
    };

    loadReports();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageWrapper title="Reports">
      <div className="row g-3">
        {report.highlights.map((item) => (
          <div className="col-md-3" key={item.label}>
            <div className="glass-card p-3 h-100">
              <div className="text-muted small">{item.label}</div>
              <div className="fs-4 fw-bold mt-2">{`${item.value}`}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 mt-4">
        <h3 className="mb-3">Occupancy By Floor</h3>
        {report.occupancyByFloor.length === 0 && <p className="mb-0">No floor report data available.</p>}
        {report.occupancyByFloor.map((item) => (
          <div key={item.floor} className="d-flex justify-content-between py-2 border-bottom">
            <span>{item.floor}</span>
            <strong>{item.count}</strong>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
};

export default AdminReportsPage;
