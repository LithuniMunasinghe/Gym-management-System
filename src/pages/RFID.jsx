import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordAttendance, registerRFID } from '../actions';
import Modal from '../components/Modal';
import './RFID.css';

export default function RFID() {
  const dispatch = useDispatch();
  const [rfidNo, setRfidNo] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ memberId: '', RFID_No: '' });
  const [regSaving, setRegSaving] = useState(false);

  const handleScan = async () => {
    if (!rfidNo.trim()) return;
    setScanning(true);
    setLastResult(null);
    const result = await dispatch(recordAttendance(rfidNo.trim()));
    setScanning(false);
    if (result) {
      setLastResult({ success: true, data: result, rfid: rfidNo });
    } else {
      setLastResult({ success: false, rfid: rfidNo });
    }
    setRfidNo('');
  };

  const handleRegChange = (e) => setRegForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleRegister = async () => {
    setRegSaving(true);
    const ok = await dispatch(registerRFID(regForm));
    setRegSaving(false);
    if (ok) { setShowRegister(false); setRegForm({ memberId: '', RFID_No: '' }); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">RFID Attendance</div>
          <div className="section-sub">Scan member cards to record attendance</div>
        </div>
        <button className="btn btn--primary" onClick={() => setShowRegister(true)}>+ Register Card</button>
      </div>

      <div className="rfid-layout">
        {/* Scanner panel */}
        <div className="rfid-scanner-card">
          <div className="rfid-scanner-icon">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8"  y="20" width="10" height="40" rx="4" fill="currentColor" opacity="0.7"/>
              <rect x="22" y="12" width="6"  height="56" rx="3" fill="currentColor" opacity="0.9"/>
              <rect x="32" y="20" width="4"  height="40" rx="2" fill="currentColor"/>
              <rect x="40" y="8"  width="8"  height="64" rx="4" fill="currentColor" opacity="0.8"/>
              <rect x="52" y="20" width="4"  height="40" rx="2" fill="currentColor"/>
              <rect x="60" y="12" width="6"  height="56" rx="3" fill="currentColor" opacity="0.9"/>
            </svg>
          </div>
          <div className="rfid-scanner-title">Scan RFID Card</div>
          <div className="rfid-scanner-sub">Enter or scan the RFID number to record attendance</div>

          <div className="rfid-input-row">
            <input
              className="rfid-input"
              value={rfidNo}
              onChange={(e) => setRfidNo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Enter RFID number..."
              autoFocus
            />
            <button className="btn btn--primary rfid-scan-btn" onClick={handleScan} disabled={scanning || !rfidNo.trim()}>
              {scanning ? <span className="login-spinner" style={{ width:18, height:18, borderColor:'rgba(0,0,0,.2)', borderTopColor:'#000' }} /> : '→ Scan'}
            </button>
          </div>

          {/* Result */}
          {lastResult && (
            <div className={`rfid-result ${lastResult.success ? 'rfid-result--success' : 'rfid-result--error'}`}>
              <div className="rfid-result-icon">{lastResult.success ? '✅' : '❌'}</div>
              <div>
                <div className="rfid-result-title">{lastResult.success ? 'Attendance Recorded!' : 'Card Not Recognised'}</div>
                <div className="rfid-result-sub">RFID: {lastResult.rfid}</div>
                {lastResult.success && lastResult.data?.memberName && (
                  <div className="rfid-result-member">{lastResult.data.memberName}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="rfid-info-panel">
          <div className="rfid-info-card">
            <div className="rfid-info-title">How It Works</div>
            <div className="rfid-steps">
              <div className="rfid-step">
                <div className="rfid-step-num">1</div>
                <div>
                  <strong>Register Card</strong>
                  <p>Link an RFID card to a member using their Member ID</p>
                </div>
              </div>
              <div className="rfid-step">
                <div className="rfid-step-num">2</div>
                <div>
                  <strong>Scan on Entry</strong>
                  <p>Enter the RFID number when the member arrives at the gym</p>
                </div>
              </div>
              <div className="rfid-step">
                <div className="rfid-step-num">3</div>
                <div>
                  <strong>Auto Log</strong>
                  <p>Check-in time is automatically recorded in the attendance log</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rfid-info-card">
            <div className="rfid-info-title">Quick Tips</div>
            <ul className="rfid-tips">
              <li>Press <kbd>Enter</kbd> after typing the RFID number</li>
              <li>Each tap records a check-in or check-out</li>
              <li>Only active members with valid subscriptions can enter</li>
              <li>RFID cards must be registered before first use</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="REGISTER RFID CARD">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Member ID *</label>
            <input className="form-input" name="memberId" type="number" value={regForm.memberId} onChange={handleRegChange} placeholder="Enter member ID" />
          </div>
          <div className="form-group">
            <label className="form-label">RFID Card Number *</label>
            <input className="form-input" name="RFID_No" value={regForm.RFID_No} onChange={handleRegChange} placeholder="e.g. CARD-001 or hex code" />
          </div>
          <div style={{ background:'rgba(71,200,255,.06)', border:'1px solid rgba(71,200,255,.15)', borderRadius:8, padding:'10px 14px', fontSize:'.78rem', color:'var(--muted)' }}>
            💡 The RFID number must match exactly what is read by your card scanner hardware.
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={() => setShowRegister(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleRegister} disabled={regSaving}>{regSaving ? 'Registering...' : 'Register Card'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
