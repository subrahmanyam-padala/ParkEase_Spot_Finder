import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  fetchAdminOverview,
  fetchAdminSlots,
  fetchAdminBookings,
  fetchAdminUsers,
  fetchAdminRevenue,
} from '../../utils/adminApi';
import './AdminReportsPage.css';

const formatCurrency = (value) => {
  const n = Number(value) || 0;
  return `Rs ${n.toLocaleString('en-IN')}`;
};

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const formatDateTime = (value) => {
  const d = parseDate(value);
  return d ? d.toLocaleString('en-IN') : 'N/A';
};

const statusText = (b) => b?.status || (b?.paid ? 'PAID' : 'PENDING');

const EMPTY_REPORT = {
  overview: null,
  slots: [],
  bookings: [],
  users: [],
  revenue: null,
};

const AdminReportsPage = () => {
  const [report, setReport] = useState(EMPTY_REPORT);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [overview, slots, bookings, users, revenue] = await Promise.all([
        fetchAdminOverview(),
        fetchAdminSlots(),
        fetchAdminBookings(),
        fetchAdminUsers(),
        fetchAdminRevenue(),
      ]);

      setReport({
        overview: overview || null,
        slots: Array.isArray(slots) ? slots : [],
        bookings: Array.isArray(bookings) ? bookings : [],
        users: Array.isArray(users) ? users : [],
        revenue: revenue || null,
      });
    } catch {
      setReport(EMPTY_REPORT);
    }
    finally { setLoading(false); }
  };

  const summary = useMemo(() => {
    const overview = report.overview || {};
    const revenue = report.revenue || {};
    return [
      { label: 'Total Parking Slots', value: overview.totalParkingSlots || 0 },
      { label: 'Occupied Slots', value: overview.occupiedSlots || 0 },
      { label: 'Available Slots', value: overview.availableSlots || 0 },
      { label: 'Active Bookings', value: overview.bookingsCount || 0 },
      { label: 'Registered Users', value: overview.usersCount || 0 },
      { label: 'Revenue Today', value: formatCurrency(overview.todayRevenue || 0) },
      { label: 'Revenue This Month', value: formatCurrency(overview.monthRevenue || 0) },
      { label: 'Total Revenue', value: formatCurrency(revenue.totalRevenue || overview.totalRevenue || 0) },
    ];
  }, [report]);

  const downloadPdf = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const generatedAt = new Date().toLocaleString('en-IN');

      doc.setFontSize(20);
      doc.text('ParkEase Admin Consolidated Report', 40, 50);
      doc.setFontSize(10);
      doc.setTextColor(90);
      doc.text(`Generated: ${generatedAt}`, 40, 70);
      doc.text('Includes: Dashboard, Slots, Bookings, Users, Revenue', 40, 85);

      autoTable(doc, {
        startY: 100,
        head: [['Metric', 'Value']],
        body: summary.map((s) => [s.label, String(s.value)]),
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 95] },
      });

      const slots = report.slots || [];
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [['Parking Slots', 'Floor/Zone', 'Status', 'Price/Hour']],
        body: slots.map((s) => [
          s.number || s.spotLabel || 'N/A',
          s.floor || s.zone || 'N/A',
          s.status || (s.isOccupied ? 'occupied' : 'available') || 'N/A',
          s.pricePerHour != null ? formatCurrency(s.pricePerHour) : 'N/A',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
      });

      const bookings = (report.bookings || [])
        .slice()
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [['Ticket', 'User', 'Vehicle', 'Slot', 'Amount', 'Status', 'Booked At']],
        body: bookings.map((b) => [
          b.ticketNumber || `#${b.id || 'N/A'}`,
          b.userName || 'N/A',
          b.vehicleNumber || 'N/A',
          b.slot || 'N/A',
          b.amount != null ? formatCurrency(b.amount) : 'N/A',
          statusText(b),
          formatDateTime(b.createdAt),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
      });

      const users = report.users || [];
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [['User ID', 'Name', 'Email', 'Phone']],
        body: users.map((u) => [
          u.userId || u.id || 'N/A',
          u.fullName || u.name || 'N/A',
          u.email || 'N/A',
          u.phoneNumber || u.mobile || 'N/A',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
      });

      const weeklyRevenue = (report.overview?.weeklyRevenue || []);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [['Revenue (Last 7 Days)', 'Amount']],
        body: weeklyRevenue.map((w) => [w.label || 'N/A', formatCurrency(w.value)]),
        theme: 'grid',
        headStyles: { fillColor: [217, 119, 6] },
      });

      const safeDate = new Date().toISOString().slice(0, 10);
      doc.save(`parkease-admin-report-${safeDate}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="admin-report-page"><div className="admin-report-card text-center py-5"><div className="spinner-border text-primary"></div></div></div>;
  }

  return (
    <div className="admin-report-page">
      <div className="admin-report-hero">
        <div>
          <h1>Admin Consolidated Report</h1>
          <p>One-click report generator for Dashboard, Slots, Bookings, Users, and Revenue.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={downloadPdf} disabled={generating}>
          {generating ? 'Generating PDF...' : 'Generate & Download Report PDF'}
        </button>
      </div>

      <div className="admin-report-card">
        <h2>Report Preview</h2>
        <div className="admin-report-grid">
          {summary.map((s) => (
            <div key={s.label} className="report-metric-card">
              <span>{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          ))}
        </div>

        <div className="report-section">
          <h3>Included Data Sections</h3>
          <div className="report-section-grid">
            <div className="section-chip">Dashboard Summary</div>
            <div className="section-chip">Parking Slots</div>
            <div className="section-chip">Bookings</div>
            <div className="section-chip">Users</div>
            <div className="section-chip">Revenue & Weekly Trend</div>
          </div>
        </div>

        <div className="report-mini-table-wrap">
          <table className="report-mini-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>User</th>
                <th>Slot</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(report.bookings || []).slice(0, 6).map((b) => (
                <tr key={`${b.ticketNumber || b.id}-${b.createdAt || ''}`}>
                  <td>{b.ticketNumber || `#${b.id || 'N/A'}`}</td>
                  <td>{b.userName || 'N/A'}</td>
                  <td>{b.slot || 'N/A'}</td>
                  <td>{statusText(b)}</td>
                  <td>{b.amount != null ? formatCurrency(b.amount) : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
