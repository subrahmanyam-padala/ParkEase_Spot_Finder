import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  fetchAdminOverview,
  fetchAdminSlots,
  fetchAdminBookings,
  fetchAdminUsers,
  fetchAdminUsersList,
  fetchAdminRevenue,
  fetchAdminRefunds,
  getAdminComplaints,
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

const addPdfSectionHeading = (doc, title, phrase, startY) => {
  const y = startY + 8;
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 95);
  doc.text(title, 40, y);
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(phrase, 40, y + 12);
  return y + 18;
};

const EMPTY_REPORT = {
  overview: null,
  slots: [],
  bookings: [],
  users: [],
  adminUsers: [],
  refunds: [],
  complaints: [],
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
      const [overview, slots, bookings, users, adminUsers, revenue, refunds, complaints] = await Promise.all([
        fetchAdminOverview(),
        fetchAdminSlots(),
        fetchAdminBookings(),
        fetchAdminUsers(),
        fetchAdminUsersList(),
        fetchAdminRevenue(),
        fetchAdminRefunds(),
        getAdminComplaints(),
      ]);

      setReport({
        overview: overview || null,
        slots: Array.isArray(slots) ? slots : [],
        bookings: Array.isArray(bookings) ? bookings : [],
        users: Array.isArray(users) ? users : [],
        adminUsers: Array.isArray(adminUsers) ? adminUsers : [],
        refunds: Array.isArray(refunds) ? refunds : [],
        complaints: Array.isArray(complaints) ? complaints : [],
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
      { label: 'Admin Users', value: (report.adminUsers || []).length },
      { label: 'Refund Requests', value: (report.refunds || []).length },
      { label: 'Complaints', value: (report.complaints || []).length },
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
      doc.text('Includes: Slots, Bookings till date, Revenue, Users, Admin Users, Refunds, Complaints', 40, 85);

      autoTable(doc, {
        startY: 100,
        head: [['Metric', 'Value']],
        body: summary.map((s) => [s.label, String(s.value)]),
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 95] },
      });

      const slots = report.slots || [];
      const slotsStartY = addPdfSectionHeading(
        doc,
        'Slots Report',
        'Parking slots managed by company with current availability and fee details.',
        doc.lastAutoTable.finalY
      );
      autoTable(doc, {
        startY: slotsStartY,
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
      const bookingsStartY = addPdfSectionHeading(
        doc,
        'Bookings Report',
        'All bookings till date with ticket, user, slot, payment value, and status.',
        doc.lastAutoTable.finalY
      );
      autoTable(doc, {
        startY: bookingsStartY,
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
      const usersStartY = addPdfSectionHeading(
        doc,
        'Users Report',
        'Registered users and their account contact details.',
        doc.lastAutoTable.finalY
      );
      autoTable(doc, {
        startY: usersStartY,
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

      const adminUsers = report.adminUsers || [];
      const adminUsersStartY = addPdfSectionHeading(
        doc,
        'Admin Users Report',
        'Administrative accounts created to operate and monitor parking operations.',
        doc.lastAutoTable.finalY
      );
      autoTable(doc, {
        startY: adminUsersStartY,
        head: [['Admin Name', 'Email', 'Mobile', 'Admin ID', 'Status', 'Created At']],
        body: adminUsers.map((a) => [
          a.name || 'N/A',
          a.email || 'N/A',
          a.mobile || 'N/A',
          a.adminId || 'N/A',
          a.status || 'Active',
          formatDateTime(a.createdAt),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [14, 116, 144] },
      });

      const refunds = (report.refunds || []).slice().sort((a, b) => new Date(b.cancellationRequestedAt || 0) - new Date(a.cancellationRequestedAt || 0));
      const refundsStartY = addPdfSectionHeading(
        doc,
        'Refund Management Report',
        'Cancellation refund requests and current processing status handled by company.',
        doc.lastAutoTable.finalY
      );
      autoTable(doc, {
        startY: refundsStartY,
        head: [['Booking ID', 'Ticket', 'User', 'Email', 'Slot', 'Amount', 'Refund Status', 'Requested At']],
        body: refunds.map((r) => [
          r.bookingId != null ? `#${r.bookingId}` : 'N/A',
          r.ticketNumber || 'N/A',
          r.userName || 'N/A',
          r.userEmail || 'N/A',
          r.slot || 'N/A',
          formatCurrency(r.amount),
          r.refundStatus || 'N/A',
          formatDateTime(r.cancellationRequestedAt),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [124, 58, 237] },
      });

      const complaints = (report.complaints || []).slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      const complaintsStartY = addPdfSectionHeading(
        doc,
        'Complaints Report',
        'Complaints made by users and handled by company with response status.',
        doc.lastAutoTable.finalY
      );
      autoTable(doc, {
        startY: complaintsStartY,
        head: [['Complaint ID', 'Subject', 'User', 'Email', 'Status', 'Admin Response', 'Created At']],
        body: complaints.map((c) => [
          c.id != null ? String(c.id) : 'N/A',
          c.subject || 'N/A',
          c.userName || 'N/A',
          c.userEmail || 'N/A',
          c.status || 'OPEN',
          c.adminResponse || 'Pending',
          formatDateTime(c.createdAt),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38] },
      });

      const weeklyRevenue = (report.overview?.weeklyRevenue || []);
      const revenueStartY = addPdfSectionHeading(
        doc,
        'Revenue Trend Report',
        'Revenue collected by company over the last 7 days.',
        doc.lastAutoTable.finalY
      );
      autoTable(doc, {
        startY: revenueStartY,
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
          <p>One-click report generator for all admin modules and records till date.</p>
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
            <div className="section-chip">All Bookings Till Date</div>
            <div className="section-chip">Users</div>
            <div className="section-chip">Admin Users</div>
            <div className="section-chip">Refunds</div>
            <div className="section-chip">Complaints</div>
            <div className="section-chip">Revenue & Weekly Trend</div>
          </div>
        </div>

        <div className="report-section">
          <h3>Section Phrases Used In Report</h3>
          <div className="small" style={{ color: '#475569', lineHeight: 1.8 }}>
            <div><strong>Slots Report:</strong> Parking slots managed by company with current availability and fee details.</div>
            <div><strong>Bookings Report:</strong> All bookings till date with ticket, user, slot, payment value, and status.</div>
            <div><strong>Users Report:</strong> Registered users and their account contact details.</div>
            <div><strong>Admin Users Report:</strong> Administrative accounts created to operate and monitor parking operations.</div>
            <div><strong>Refund Management Report:</strong> Cancellation refund requests and current processing status handled by company.</div>
            <div><strong>Complaints Report:</strong> Complaints made by users and handled by company with response status.</div>
            <div><strong>Revenue Trend Report:</strong> Revenue collected by company over the last 7 days.</div>
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
