import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { scanQrCode, getTicketStatus, payOverstay } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';

const ScannerPage = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualTicket, setManualTicket] = useState('');
  const [mode, setMode] = useState('scan'); // 'scan' | 'manual' | 'status'
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

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
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerInstanceRef.current = html5QrCode;
      setScanning(true);

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
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

  const handleScanResult = async (qrData) => {
    setLoading(true);
    setError('');
    try {
      const res = await scanQrCode(qrData);
      setResult(res.data);
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

  const getStatusBadge = (status) => {
    const map = {
      PAID: { bg: '#3498DB', icon: 'bi-credit-card', label: 'Paid — Ready for Entry' },
      CHECKED_IN: { bg: '#27AE60', icon: 'bi-box-arrow-in-right', label: 'Checked In' },
      COMPLETED: { bg: '#2C3E50', icon: 'bi-check-circle', label: 'Completed — Exited' },
      OVERSTAY: { bg: '#E74C3C', icon: 'bi-exclamation-triangle', label: 'Overstay — Payment Due' },
      OVERSTAY_PAID: { bg: '#F39C12', icon: 'bi-cash-coin', label: 'Overstay Paid — Ready to Exit' },
    };
    const s = map[status] || { bg: '#95A5A6', icon: 'bi-question-circle', label: status || 'Unknown' };
    return (
      <span className="badge px-3 py-2" style={{ backgroundColor: s.bg, fontSize: '0.85rem' }}>
        <i className={`bi ${s.icon} me-1`}></i>{s.label}
      </span>
    );
  };

  const getActionBadge = (action) => {
    const map = {
      ENTRY: { bg: '#27AE60', icon: 'bi-box-arrow-in-right', label: 'ENTRY — Checked In' },
      EXIT: { bg: '#2C3E50', icon: 'bi-box-arrow-right', label: 'EXIT — Checked Out' },
      EXIT_OVERSTAY: { bg: '#E74C3C', icon: 'bi-exclamation-triangle', label: 'EXIT — Overstay Detected' },
      OVERSTAY_PENDING: { bg: '#E74C3C', icon: 'bi-clock-history', label: 'Overstay — Payment Pending' },
      OVERSTAY_EXIT: { bg: '#F39C12', icon: 'bi-box-arrow-right', label: 'EXIT — Overstay Cleared' },
      STATUS: { bg: '#3498DB', icon: 'bi-info-circle', label: 'Ticket Status' },
    };
    const a = map[action] || { bg: '#95A5A6', icon: 'bi-info-circle', label: action || '' };
    return (
      <div className="text-center mb-3">
        <span className="badge px-4 py-2" style={{ backgroundColor: a.bg, fontSize: '1rem' }}>
          <i className={`bi ${a.icon} me-2`}></i>{a.label}
        </span>
      </div>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
      <Navbar />

      <div className="main-content flex-grow-1 py-4">
        <div className="container" style={{ maxWidth: '540px' }}>

          {/* Page Header */}
          <div className="text-center mb-4">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '70px', height: '70px', backgroundColor: '#00C4B4' }}
            >
              <i className="bi bi-qr-code-scan text-white" style={{ fontSize: '2rem' }}></i>
            </div>
            <h3 className="fw-bold" style={{ color: '#2C3E50' }}>QR Scanner</h3>
            <p className="text-muted">Scan your parking QR code at entry/exit</p>
          </div>

          {/* Mode Tabs */}
          {!result && (
            <div className="d-flex gap-2 mb-4 justify-content-center">
              <button
                className={`btn btn-sm px-3 ${mode === 'scan' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => { setMode('scan'); resetScan(); }}
              >
                <i className="bi bi-camera me-1"></i>Scan QR
              </button>
              <button
                className={`btn btn-sm px-3 ${mode === 'manual' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => { setMode('manual'); stopScanner(); resetScan(); }}
              >
                <i className="bi bi-keyboard me-1"></i>Enter Ticket
              </button>
              <button
                className={`btn btn-sm px-3 ${mode === 'status' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => { setMode('status'); stopScanner(); resetScan(); }}
              >
                <i className="bi bi-search me-1"></i>Check Status
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <p className="text-muted">Processing...</p>
            </div>
          )}

          {/* ─── SCAN MODE ─── */}
          {!result && !loading && mode === 'scan' && (
            <div className="card shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4 text-center">
                <div id="qr-reader" style={{ width: '100%' }} ref={scannerRef}></div>
                {!scanning ? (
                  <button className="btn btn-primary btn-lg w-100 mt-3" onClick={startScanner}>
                    <i className="bi bi-camera-fill me-2"></i>Open Camera &amp; Scan
                  </button>
                ) : (
                  <button className="btn btn-outline-danger w-100 mt-3" onClick={stopScanner}>
                    <i className="bi bi-stop-fill me-2"></i>Stop Scanner
                  </button>
                )}
                <p className="text-muted small mt-2 mb-0">
                  Point your camera at the QR code on your parking ticket
                </p>
              </div>
            </div>
          )}

          {/* ─── MANUAL SCAN MODE ─── */}
          {!result && !loading && mode === 'manual' && (
            <div className="card shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3" style={{ color: '#2C3E50' }}>
                  <i className="bi bi-keyboard me-2"></i>Manual Check-In / Check-Out
                </h6>
                <p className="text-muted small">
                  Paste the full QR code JSON data to process entry or exit scan.
                </p>
                <form onSubmit={(e) => { e.preventDefault(); handleScanResult(manualTicket.trim()); }}>
                  <textarea
                    className="form-control mb-3"
                    rows={4}
                    placeholder='Paste QR JSON data here...'
                    value={manualTicket}
                    onChange={(e) => setManualTicket(e.target.value)}
                    required
                  />
                  <button className="btn btn-primary w-100" type="submit" disabled={!manualTicket.trim()}>
                    <i className="bi bi-qr-code me-2"></i>Process Scan
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ─── STATUS CHECK MODE ─── */}
          {!result && !loading && mode === 'status' && (
            <div className="card shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3" style={{ color: '#2C3E50' }}>
                  <i className="bi bi-search me-2"></i>Check Ticket Status
                </h6>
                <p className="text-muted small">
                  Enter your ticket number to see your current parking status and location.
                </p>
                <form onSubmit={handleManualLookup}>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Enter ticket number (e.g. TKT-ABC123)"
                    value={manualTicket}
                    onChange={(e) => setManualTicket(e.target.value)}
                    required
                  />
                  <button className="btn btn-primary w-100" type="submit" disabled={!manualTicket.trim()}>
                    <i className="bi bi-search me-2"></i>Check Status
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ─── RESULT CARD ─── */}
          {result && !loading && (
            <div className="card shadow-sm mb-4 fade-in" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              {/* Action Header */}
              {result.action && (
                <div
                  className="py-3 text-center"
                  style={{
                    backgroundColor:
                      result.action === 'ENTRY' ? '#27AE60' :
                      result.action === 'EXIT' ? '#2C3E50' :
                      result.action === 'EXIT_OVERSTAY' || result.action === 'OVERSTAY_PENDING' ? '#E74C3C' :
                      '#3498DB',
                    color: 'white',
                  }}
                >
                  {getActionBadge(result.action)}
                </div>
              )}

              <div className="card-body p-4">
                {/* Message */}
                <div className="alert alert-info mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  {result.message}
                </div>

                {/* Data Details */}
                {result.data && (
                  <>
                    {/* Status Badge */}
                    <div className="text-center mb-3">
                      {getStatusBadge(result.data.status)}
                    </div>

                    {/* Vehicle & Ticket */}
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#F8F9FA' }}>
                          <small className="text-muted d-block">Ticket #</small>
                          <span className="fw-bold" style={{ color: '#00C4B4', letterSpacing: '1px' }}>
                            {result.data.ticketNumber || '--'}
                          </span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#F8F9FA' }}>
                          <small className="text-muted d-block">Vehicle</small>
                          <span className="fw-bold">{result.data.vehicleNumber || '--'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Spot & Location */}
                    {result.data.spot && (
                      <div className="p-3 rounded mb-3" style={{ backgroundColor: '#EBF5FB', border: '1px solid #AED6F1' }}>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-geo-alt-fill me-2" style={{ fontSize: '1.5rem', color: '#3498DB' }}></i>
                          <div>
                            <small className="text-muted d-block">Your Parking Spot</small>
                            <span className="fw-bold" style={{ fontSize: '1.1rem' }}>{result.data.spot}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Times */}
                    <div className="row g-3 mb-3">
                      {result.data.startTime && (
                        <div className="col-6">
                          <div className="p-3 rounded" style={{ backgroundColor: '#F8F9FA' }}>
                            <small className="text-muted d-block"><i className="bi bi-clock me-1"></i>Start Time</small>
                            <span className="fw-bold small">{formatDateTime(result.data.startTime)}</span>
                          </div>
                        </div>
                      )}
                      {result.data.endTime && (
                        <div className="col-6">
                          <div className="p-3 rounded" style={{ backgroundColor: '#F8F9FA' }}>
                            <small className="text-muted d-block"><i className="bi bi-clock-history me-1"></i>End Time</small>
                            <span className="fw-bold small">{formatDateTime(result.data.endTime)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Check-in / Exit Time */}
                    {result.data.checkedInAt && (
                      <div className="p-3 rounded mb-3" style={{ backgroundColor: '#EAFAF1', border: '1px solid #A9DFBF' }}>
                        <i className="bi bi-box-arrow-in-right me-2 text-success"></i>
                        <small className="text-muted">Checked In:</small>{' '}
                        <span className="fw-bold">{formatDateTime(result.data.checkedInAt)}</span>
                      </div>
                    )}
                    {result.data.exitTime && (
                      <div className="p-3 rounded mb-3" style={{ backgroundColor: '#F8F9FA' }}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        <small className="text-muted">Exit Time:</small>{' '}
                        <span className="fw-bold">{formatDateTime(result.data.exitTime)}</span>
                      </div>
                    )}

                    {/* Overstay Info */}
                    {result.data.overstay && (
                      <div className="p-3 rounded mb-3" style={{ backgroundColor: '#FDEDEC', border: '1px solid #F5B7B1' }}>
                        <h6 className="text-danger mb-2">
                          <i className="bi bi-exclamation-triangle me-1"></i>Overstay Details
                        </h6>
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="text-muted">Overstay Hours</span>
                          <span className="fw-bold">{result.data.overstayHours}h</span>
                        </div>
                        <div className="d-flex justify-content-between small">
                          <span className="text-muted">Overstay Fee (2x rate)</span>
                          <span className="fw-bold text-danger">₹{result.data.overstayFee}</span>
                        </div>
                      </div>
                    )}

                    {/* Pay Overstay Button */}
                    {result.action === 'OVERSTAY_PENDING' && result.data.ticketNumber && (
                      <button
                        className="btn btn-danger w-100 mb-3"
                        onClick={() => handlePayOverstay(result.data.ticketNumber)}
                      >
                        <i className="bi bi-cash-coin me-2"></i>
                        Pay Overstay Fee — ₹{result.data.overstayFee}
                      </button>
                    )}

                    {/* User Info */}
                    {result.data.userName && result.data.userName !== 'N/A' && (
                      <div className="p-3 rounded mb-3" style={{ backgroundColor: '#F8F9FA' }}>
                        <small className="text-muted d-block">Driver</small>
                        <span className="fw-bold">{result.data.userName}</span>
                        {result.data.userEmail && (
                          <small className="text-muted d-block">{result.data.userEmail}</small>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Actions */}
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-primary flex-grow-1" onClick={resetScan}>
                    <i className="bi bi-arrow-repeat me-1"></i>New Scan
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                    <i className="bi bi-house me-1"></i>Home
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info Card */}
          {!result && !loading && (
            <div className="card shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3" style={{ color: '#2C3E50' }}>
                  <i className="bi bi-info-circle me-2"></i>How it works
                </h6>
                <div className="d-flex align-items-start mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ minWidth: '32px', height: '32px', backgroundColor: '#EBF5FB', color: '#3498DB' }}>
                    <strong>1</strong>
                  </div>
                  <div>
                    <strong>Entry Scan</strong>
                    <p className="text-muted small mb-0">Scan your QR at the entry gate to check in</p>
                  </div>
                </div>
                <div className="d-flex align-items-start mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ minWidth: '32px', height: '32px', backgroundColor: '#EAFAF1', color: '#27AE60' }}>
                    <strong>2</strong>
                  </div>
                  <div>
                    <strong>Track Status</strong>
                    <p className="text-muted small mb-0">View your spot, time remaining, and status</p>
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ minWidth: '32px', height: '32px', backgroundColor: '#FEF9E7', color: '#F39C12' }}>
                    <strong>3</strong>
                  </div>
                  <div>
                    <strong>Exit Scan</strong>
                    <p className="text-muted small mb-0">Scan again at exit — overstay fees calculated automatically</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default ScannerPage;
