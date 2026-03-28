import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import PageWrapper from '../../components/admin/PageWrapper';
import { scanQrCode, getTicketStatus, payOverstay } from '../../utils/api';
import { getAdminBookings } from '../../utils/adminApi';
import './AdminScannerPage.css';

const parseBackendDate = (value) => {
  if (!value) return null;

  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = value;
    const ms = Math.floor(Number(nano) / 1000000);
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), ms);
  }

  if (typeof value === 'object') {
    const year = value.year;
    const month = value.monthValue ?? value.month;
    const day = value.dayOfMonth ?? value.day;
    if (year && month && day) {
      const hour = value.hour ?? 0;
      const minute = value.minute ?? 0;
      const second = value.second ?? 0;
      const nano = value.nano ?? 0;
      const ms = Math.floor(Number(nano) / 1000000);
      return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), ms);
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isSameLocalDate = (a, b) => (
  a.getFullYear() === b.getFullYear()
  && a.getMonth() === b.getMonth()
  && a.getDate() === b.getDate()
);

const AdminScannerPage = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualTicket, setManualTicket] = useState('');
  const [mode, setMode] = useState('scan'); // 'scan' | 'manual' | 'status'
  const [scanHistory, setScanHistory] = useState([]);
  const [scannerStats, setScannerStats] = useState({
    checkInsToday: 0,
    checkOutsToday: 0,
    overstaysToday: 0,
  });
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    loadScannerStats();

    const intervalId = setInterval(loadScannerStats, 10000);

    return () => {
      stopScanner();
      clearInterval(intervalId);
    };
  }, []);

  const loadScannerStats = async () => {
    try {
      const bookings = await getAdminBookings();
      const list = Array.isArray(bookings) ? bookings : [];
      const today = new Date();

      const getStatus = (b) => String(b?.status || '').toUpperCase();
      const getEventDate = (b) => parseBackendDate(b?.updatedAt) || parseBackendDate(b?.createdAt);

      const checkInsToday = list.filter((b) => {
        const status = getStatus(b);
        const date = getEventDate(b);
        return status === 'CHECKED_IN' && date && isSameLocalDate(date, today);
      }).length;

      const checkOutsToday = list.filter((b) => {
        const status = getStatus(b);
        const date = getEventDate(b);
        return status === 'COMPLETED' && date && isSameLocalDate(date, today);
      }).length;

      const overstaysToday = list.filter((b) => {
        const status = getStatus(b);
        const date = getEventDate(b);
        return ['OVERSTAY', 'OVERSTAY_PAID'].includes(status) && date && isSameLocalDate(date, today);
      }).length;

      setScannerStats({ checkInsToday, checkOutsToday, overstaysToday });
    } catch {
      setScannerStats({ checkInsToday: 0, checkOutsToday: 0, overstaysToday: 0 });
    }
  };

  const stopScanner = async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current.clear();
      } catch (e) {
        /* ignore */
      }
      scannerInstanceRef.current = null;
    }
    setScanning(false);
  };

  const startScanner = async () => {
    setError('');
    setResult(null);

    try {
      const html5QrCode = new Html5Qrcode('admin-qr-reader');
      scannerInstanceRef.current = html5QrCode;
      setScanning(true);

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 280 } },
        (decodedText) => {
          handleScanResult(decodedText);
          stopScanner();
        },
        () => {}
      );
    } catch (err) {
      setScanning(false);
      setError('Could not access camera. Please allow camera permission or use manual entry.');
    }
  };

  // Normalize QR data - backend expects JSON with ticket_no field
  const normalizeQrData = (rawData) => {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(rawData);
      // If it's valid JSON with ticket_no, return as-is
      if (parsed.ticket_no) {
        return rawData;
      }
      // If JSON but no ticket_no, try to find it
      return rawData;
    } catch {
      // Not JSON - treat raw data as ticket number
      // Backend QR codes often just contain the ticket number
      return JSON.stringify({ ticket_no: rawData.trim() });
    }
  };

  const handleScanResult = async (qrData) => {
    setLoading(true);
    setError('');
    try {
      const normalizedData = normalizeQrData(qrData);
      const res = await scanQrCode(normalizedData);
      setResult(res.data);
      loadScannerStats();
      // Add to history
      if (res.data?.data) {
        setScanHistory(prev => [{
          ...res.data.data,
          action: res.data.action,
          scannedAt: new Date().toISOString()
        }, ...prev].slice(0, 10));
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Scan failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLookup = async (e) => {
    e.preventDefault();
    if (!manualTicket.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await getTicketStatus(manualTicket.trim());
      setResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Ticket not found';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePayOverstay = async (ticketNumber) => {
    setLoading(true);
    setError('');
    try {
      const res = await payOverstay(ticketNumber);
      setResult(res.data);
      loadScannerStats();
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setError('');
    setManualTicket('');
  };

  const formatDateTime = (dt) => {
    if (!dt) return '--';
    return new Date(dt).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatTime = (dt) => {
    if (!dt) return '--';
    return new Date(dt).toLocaleTimeString('en-IN', { timeStyle: 'short' });
  };

  const getActionBadge = (action) => {
    const map = {
      ENTRY: { bg: '#27AE60', icon: '→', label: 'ENTRY' },
      EXIT: { bg: '#2C3E50', icon: '←', label: 'EXIT' },
      EXIT_OVERSTAY: { bg: '#E74C3C', icon: '⚠', label: 'OVERSTAY EXIT' },
      OVERSTAY_PENDING: { bg: '#E74C3C', icon: '⏰', label: 'OVERSTAY PENDING' },
      OVERSTAY_PAID: { bg: '#27AE60', icon: '✓', label: 'OVERSTAY PAID' },
      STATUS: { bg: '#3498DB', icon: 'ℹ', label: 'STATUS' },
    };
    const a = map[action] || { bg: '#95A5A6', icon: '?', label: action || 'UNKNOWN' };
    return (
      <span className="admin-scan-badge" style={{ backgroundColor: a.bg }}>
        {a.icon} {a.label}
      </span>
    );
  };

  const getStatusStyle = (status) => {
    const styles = {
      PAID: { bg: '#EBF5FB', border: '#3498DB', color: '#2980B9' },
      CHECKED_IN: { bg: '#EAFAF1', border: '#27AE60', color: '#1E8449' },
      COMPLETED: { bg: '#F4F6F7', border: '#7F8C8D', color: '#566573' },
      OVERSTAY: { bg: '#FDEDEC', border: '#E74C3C', color: '#C0392B' },
      OVERSTAY_PAID: { bg: '#FEF9E7', border: '#F39C12', color: '#D68910' },
    };
    return styles[status] || { bg: '#F8F9FA', border: '#CED4DA', color: '#495057' };
  };

  return (
    <PageWrapper title="Gate Scanner">
      <div className="admin-scanner-page">
        {/* Stats Bar */}
        <div className="scanner-stats-bar">
          <div className="stat-item">
            <span className="stat-value">{scannerStats.checkInsToday}</span>
            <span className="stat-label">Check-ins Today</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{scannerStats.checkOutsToday}</span>
            <span className="stat-label">Check-outs Today</span>
          </div>
          <div className="stat-item overstay">
            <span className="stat-value">{scannerStats.overstaysToday}</span>
            <span className="stat-label">Overstays</span>
          </div>
        </div>

        <div className="scanner-main-grid">
          {/* Scanner Panel */}
          <div className="scanner-panel">
            <div className="panel-header">
              <h3>🎯 QR Scanner</h3>
              <div className="mode-tabs">
                <button
                  className={`mode-tab ${mode === 'scan' ? 'active' : ''}`}
                  onClick={() => { setMode('scan'); resetScan(); }}
                >
                  📷 Camera
                </button>
                <button
                  className={`mode-tab ${mode === 'manual' ? 'active' : ''}`}
                  onClick={() => { setMode('manual'); stopScanner(); resetScan(); }}
                >
                  ⌨️ Manual
                </button>
                <button
                  className={`mode-tab ${mode === 'status' ? 'active' : ''}`}
                  onClick={() => { setMode('status'); stopScanner(); resetScan(); }}
                >
                  🔍 Lookup
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="scanner-error">
                ⚠️ {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="scanner-loading">
                <div className="spinner"></div>
                <span>Processing scan...</span>
              </div>
            )}

            {/* Camera Scan Mode */}
            {!result && !loading && mode === 'scan' && (
              <div className="scan-area">
                <div id="admin-qr-reader" className="qr-reader-box"></div>
                {!scanning ? (
                  <button className="scan-btn primary" onClick={startScanner}>
                    📷 Start Camera Scanner
                  </button>
                ) : (
                  <button className="scan-btn danger" onClick={stopScanner}>
                    ⬛ Stop Scanner
                  </button>
                )}
                <p className="scan-hint">Position the QR code within the frame</p>
              </div>
            )}

            {/* Manual Entry Mode */}
            {!result && !loading && mode === 'manual' && (
              <div className="manual-entry">
                <p className="mode-desc">Paste the complete QR code JSON data to process entry/exit</p>
                <form onSubmit={(e) => { e.preventDefault(); handleScanResult(manualTicket.trim()); }}>
                  <textarea
                    className="qr-textarea"
                    rows={5}
                    placeholder='{"ticket_no": "TKT-XXX", "vehicle": "...", ...}'
                    value={manualTicket}
                    onChange={(e) => setManualTicket(e.target.value)}
                    required
                  />
                  <button className="scan-btn primary" type="submit" disabled={!manualTicket.trim()}>
                    ▶️ Process Scan
                  </button>
                </form>
              </div>
            )}

            {/* Ticket Lookup Mode */}
            {!result && !loading && mode === 'status' && (
              <div className="ticket-lookup">
                <p className="mode-desc">Enter ticket number to check current status</p>
                <form onSubmit={handleManualLookup}>
                  <input
                    type="text"
                    className="ticket-input"
                    placeholder="Enter ticket number (e.g. TKT-ABC123)"
                    value={manualTicket}
                    onChange={(e) => setManualTicket(e.target.value)}
                    required
                  />
                  <button className="scan-btn primary" type="submit" disabled={!manualTicket.trim()}>
                    🔍 Check Status
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Result Panel */}
          <div className="result-panel">
            <div className="panel-header">
              <h3>📋 Verification Result</h3>
            </div>

            {!result && !loading && (
              <div className="no-result">
                <div className="no-result-icon">📱</div>
                <p>Scan a QR code to see verification details</p>
                <span className="hint">User details, vehicle number, and parking status will appear here</span>
              </div>
            )}

            {result && !loading && (
              <div className="verification-result">
                {/* Action Badge */}
                <div className="result-action">
                  {getActionBadge(result.action)}
                </div>

                {/* Message */}
                <div className="result-message">
                  {result.message}
                </div>

                {result.data && (
                  <>
                    {/* VERIFICATION BOX - Most Important */}
                    <div className="verification-box" style={{
                      backgroundColor: getStatusStyle(result.data.status).bg,
                      borderColor: getStatusStyle(result.data.status).border
                    }}>
                      <div className="verify-header">
                        <span className="verify-label">✓ VERIFY USER & VEHICLE</span>
                        <span className="status-badge" style={{
                          backgroundColor: getStatusStyle(result.data.status).color
                        }}>
                          {result.data.status}
                        </span>
                      </div>

                      <div className="verify-grid">
                        <div className="verify-item large">
                          <span className="verify-field-label">👤 User Name</span>
                          <span className="verify-field-value highlight">
                            {result.data.userName || 'N/A'}
                          </span>
                        </div>
                        <div className="verify-item large">
                          <span className="verify-field-label">🚗 Vehicle Number</span>
                          <span className="verify-field-value highlight vehicle">
                            {result.data.vehicleNumber || '--'}
                          </span>
                        </div>
                      </div>

                      <div className="verify-grid cols-2">
                        <div className="verify-item">
                          <span className="verify-field-label">🎫 Ticket</span>
                          <span className="verify-field-value">{result.data.ticketNumber || '--'}</span>
                        </div>
                        <div className="verify-item">
                          <span className="verify-field-label">📍 Spot</span>
                          <span className="verify-field-value">{result.data.spot || '--'}</span>
                        </div>
                      </div>

                      {result.data.userEmail && (
                        <div className="verify-item full">
                          <span className="verify-field-label">📧 Email</span>
                          <span className="verify-field-value small">{result.data.userEmail}</span>
                        </div>
                      )}
                    </div>

                    {/* Time Details */}
                    <div className="time-details">
                      <div className="time-row">
                        <span className="time-label">🕐 Start Time</span>
                        <span className="time-value">{formatDateTime(result.data.startTime)}</span>
                      </div>
                      <div className="time-row">
                        <span className="time-label">🕑 End Time</span>
                        <span className="time-value">{formatDateTime(result.data.endTime)}</span>
                      </div>
                      {result.data.checkedInAt && (
                        <div className="time-row success">
                          <span className="time-label">✅ Checked In</span>
                          <span className="time-value">{formatDateTime(result.data.checkedInAt)}</span>
                        </div>
                      )}
                      {result.data.exitTime && (
                        <div className="time-row">
                          <span className="time-label">🚪 Exit Time</span>
                          <span className="time-value">{formatDateTime(result.data.exitTime)}</span>
                        </div>
                      )}
                    </div>

                    {/* Overstay Alert */}
                    {result.data.overstay && result.action !== 'OVERSTAY_PAID' && (
                      <div className="overstay-alert">
                        <div className="overstay-header">OVERSTAY DETECTED</div>
                        <div className="overstay-details">
                          <div className="overstay-row">
                            <span>⏱️ Overstay Duration</span>
                            <span className="overstay-value">{result.data.overstayHours} hour(s)</span>
                          </div>
                          <div className="overstay-row">
                            <span>💰 Base Rate per Hour</span>
                            <span className="overstay-value">₹{result.data.basePricePerHour || 50}</span>
                          </div>
                          <div className="overstay-row">
                            <span>⚡ Overstay Fee (2× rate)</span>
                            <span className="overstay-value fee">₹{result.data.overstayFee}</span>
                          </div>
                        </div>
                        {(result.action === 'OVERSTAY_PENDING' || result.action === 'EXIT_OVERSTAY') && result.data.ticketNumber && (
                          <button
                            className="pay-overstay-btn"
                            onClick={() => handlePayOverstay(result.data.ticketNumber)}
                          >
                            💳 Collect Payment — ₹{result.data.overstayFee}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Overstay Paid Success */}
                    {result.action === 'OVERSTAY_PAID' && (
                      <div className="overstay-paid-success">
                        <div className="overstay-paid-icon">✅</div>
                        <div className="overstay-paid-title">Payment Collected!</div>
                        <div className="overstay-paid-message">
                          Overstay fee of ₹{result.data.overstayFee} received. Vehicle can now exit.
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Action Buttons */}
                <div className="result-actions">
                  <button className="scan-btn primary" onClick={resetScan}>
                    🔄 New Scan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Scans History */}
        {scanHistory.length > 0 && (
          <div className="scan-history">
            <h4>📜 Recent Scans</h4>
            <div className="history-list">
              {scanHistory.map((scan, idx) => (
                <div key={idx} className="history-item">
                  <span className="history-action">{getActionBadge(scan.action)}</span>
                  <span className="history-vehicle">{scan.vehicleNumber}</span>
                  <span className="history-user">{scan.userName}</span>
                  <span className="history-spot">{scan.spot}</span>
                  <span className="history-time">{formatTime(scan.scannedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AdminScannerPage;
