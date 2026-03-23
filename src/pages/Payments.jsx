import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments, refundPayment, updatePaymentStatus } from '../actions';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { formatDate, formatCurrency, sumBy } from '../utils';

export default function Payments() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.payments);
  const adminId = useSelector((s) => s.ui.currentUserId);

  const [showStripe,   setShowStripe]   = useState(false);
  const [showReceipt,  setShowReceipt]  = useState(false);
  const [receiptData,  setReceiptData]  = useState(null);
  const [payMethod,    setPayMethod]    = useState('cash'); // 'cash' | 'card'
  const [stripeForm,   setStripeForm]   = useState({ amount: '', subscriptionId: '', cardNumber: '', expiry: '', cvv: '', name: '' });
  const [cashForm,     setCashForm]     = useState({ amount: '', subscriptionId: '', receivedBy: '' });
  const [processing,   setProcessing]   = useState(false);
  const [paySuccess,   setPaySuccess]   = useState(false);
  const receiptRef = useRef();

  useEffect(() => { dispatch(fetchPayments()); }, [dispatch]);

  const totalRevenue  = sumBy(data, 'paymentAmount');
  const completedOnly = data.filter((p) => p.payment_Status === 'Completed');
  const refundedOnly  = data.filter((p) => p.payment_Status === 'Refunded');

  const handleRefund = (id) => {
    if (window.confirm(`Refund payment #${id}?`)) dispatch(refundPayment(id, adminId));
  };

  const handleStripeChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') value = value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().substring(0,19);
    if (name === 'expiry')     value = value.replace(/\D/g,'').replace(/(\d{2})(\d)/,'$1/$2').substring(0,5);
    if (name === 'cvv')        value = value.replace(/\D/g,'').substring(0,4);
    setStripeForm((f) => ({ ...f, [name]: value }));
  };

  const handlePaymentSubmit = async () => {
    if (payMethod === 'card' && (!stripeForm.cardNumber || !stripeForm.expiry || !stripeForm.cvv)) return;
    if (payMethod === 'cash' && !cashForm.amount) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setProcessing(false);
    setPaySuccess(true);

    if (payMethod === 'cash') {
      // Generate cash receipt
      setReceiptData({
        paymentId: `CASH-${Date.now()}`,
        method: 'Cash',
        amount: cashForm.amount,
        subscriptionId: cashForm.subscriptionId,
        receivedBy: cashForm.receivedBy || 'Admin',
        date: new Date().toLocaleString(),
        gym: 'DTS GYM',
      });
    }
    setTimeout(() => {
      setPaySuccess(false);
      setShowStripe(false);
      setStripeForm({ amount:'', subscriptionId:'', cardNumber:'', expiry:'', cvv:'', name:'' });
      setCashForm({ amount:'', subscriptionId:'', receivedBy:'' });
      dispatch(fetchPayments());
    }, 1800);
  };

  const printReceipt = () => {
    const content = receiptRef.current?.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Cash Receipt</title>
      <style>body{font-family:monospace;max-width:380px;margin:20px auto;padding:20px}
      .r-logo{text-align:center;font-size:1.6rem;font-weight:900;letter-spacing:4px;margin-bottom:4px}
      .r-sub{text-align:center;font-size:.75rem;letter-spacing:2px;margin-bottom:16px;border-bottom:2px dashed #333;padding-bottom:12px}
      .r-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee;font-size:.85rem}
      .r-total{font-weight:700;font-size:1rem;border-top:2px solid #333;margin-top:8px;padding-top:8px}
      .r-footer{text-align:center;margin-top:16px;font-size:.7rem;color:#666}
      </style></head><body>${content}</body></html>`);
    win.document.close(); win.print();
  };

  const openReceipt = (row) => {
    setReceiptData({
      paymentId: row.paymentId,
      method: row.payment_type || 'Cash',
      amount: row.paymentAmount,
      subscriptionId: row.subscriptionId,
      date: formatDate(row.payment_date),
      gym: 'DTS GYM',
    });
    setShowReceipt(true);
  };

  const columns = [
    { key: 'paymentId',      label: 'ID',      width:60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'subscriptionId', label: 'Sub',     render: (v) => <span>Sub <span className="id-chip">#{v}</span></span> },
    { key: 'paymentAmount',  label: 'Amount',  render: (v) => <span style={{ fontFamily:'Space Mono,monospace', color:'var(--success)', fontWeight:600 }}>{formatCurrency(v)}</span> },
    { key: 'payment_date',   label: 'Date',    render: (v) => <span className="muted">{formatDate(v)}</span> },
    { key: 'payment_type',   label: 'Method',  render: (v) => (
      <span style={{ background: v === 'Cash' ? 'rgba(255,179,71,.1)' : 'rgba(71,200,255,.1)', color: v === 'Cash' ? 'var(--warning)' : 'var(--accent3)', borderRadius:4, padding:'2px 8px', fontSize:'.72rem' }}>
        {v === 'Cash' ? '💵 Cash' : v === 'Card' ? '💳 Card' : v || '—'}
      </span>
    )},
    { key: 'payment_Status', label: 'Status',  render: (v) => {
      const map = { Completed:'active', Refunded:'refunded', Pending:'pending' };
      return <Badge variant={map[v] || 'inactive'}>{v || '—'}</Badge>;
    }},
    { key: '_actions', label: 'Actions', render: (_, row) => (
      <div style={{ display:'flex', gap:6 }}>
        <button className="btn btn--sm btn--secondary" onClick={() => openReceipt(row)}>🧾 Receipt</button>
        {row.payment_Status === 'Completed' && (
          <button className="btn btn--sm btn--danger" onClick={() => handleRefund(row.paymentId)}>Refund</button>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">Payments</div>
          <div className="section-sub">
            Total: {formatCurrency(totalRevenue)} · {completedOnly.length} completed · {refundedOnly.length} refunded
          </div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn--secondary" onClick={() => dispatch(fetchPayments())}>↺ Refresh</button>
          <button className="btn btn--primary" onClick={() => setShowStripe(true)}>+ New Payment</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom:20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value stat-value--green" style={{ fontSize:'1.4rem' }}>{formatCurrency(totalRevenue)}</div>
          <div className="stat-change">All payments</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value stat-value--blue">{completedOnly.length}</div>
          <div className="stat-change" style={{ color:'var(--accent3)' }}>Successful</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Refunded</div>
          <div className="stat-value stat-value--orange">{refundedOnly.length}</div>
          <div className="stat-change" style={{ color:'var(--warning)' }}>Returned</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value stat-value--yellow">{data.length}</div>
          <div className="stat-change">All time</div>
        </div>
      </div>

      <DataTable columns={columns} data={data} loading={loading} rowKey="paymentId" />

      {/* Payment Modal (Cash or Card) */}
      <Modal isOpen={showStripe} onClose={() => setShowStripe(false)} title="NEW PAYMENT">
        {paySuccess ? (
          <div style={{ textAlign:'center', padding:'32px 0' }}>
            <div style={{ fontSize:'3rem', marginBottom:12 }}>✅</div>
            <div style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--success)', marginBottom:4 }}>
              Payment {payMethod === 'cash' ? 'Recorded' : 'Processed'}!
            </div>
            {payMethod === 'cash' && (
              <div style={{ fontSize:'.82rem', color:'var(--muted)' }}>Cash receipt will open automatically</div>
            )}
          </div>
        ) : (
          <div className="form-grid">
            {/* Payment method selector */}
            <div className="filter-tabs" style={{ marginBottom:4 }}>
              <button className={`filter-tab${payMethod === 'cash' ? ' filter-tab--active' : ''}`} onClick={() => setPayMethod('cash')}>💵 Cash</button>
              <button className={`filter-tab${payMethod === 'card' ? ' filter-tab--active' : ''}`} onClick={() => setPayMethod('card')}>💳 Card</button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount (LKR) *</label>
                <input className="form-input" type="number" step="0.01"
                  value={payMethod === 'cash' ? cashForm.amount : stripeForm.amount}
                  onChange={(e) => payMethod === 'cash' ? setCashForm((f) => ({ ...f, amount: e.target.value })) : setStripeForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="5000.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Subscription ID</label>
                <input className="form-input" type="number"
                  value={payMethod === 'cash' ? cashForm.subscriptionId : stripeForm.subscriptionId}
                  onChange={(e) => payMethod === 'cash' ? setCashForm((f) => ({ ...f, subscriptionId: e.target.value })) : setStripeForm((f) => ({ ...f, subscriptionId: e.target.value }))}
                  placeholder="Optional" />
              </div>
            </div>

            {payMethod === 'cash' && (
              <div className="form-group">
                <label className="form-label">Received By</label>
                <input className="form-input" value={cashForm.receivedBy}
                  onChange={(e) => setCashForm((f) => ({ ...f, receivedBy: e.target.value }))}
                  placeholder="Staff name" />
              </div>
            )}

            {payMethod === 'card' && (
              <>
                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input className="form-input" name="name" value={stripeForm.name} onChange={handleStripeChange} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input className="form-input" name="cardNumber" value={stripeForm.cardNumber} onChange={handleStripeChange} placeholder="1234 5678 9012 3456" maxLength={19} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expiry</label>
                    <input className="form-input" name="expiry" value={stripeForm.expiry} onChange={handleStripeChange} placeholder="MM/YY" maxLength={5} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input className="form-input" name="cvv" value={stripeForm.cvv} onChange={handleStripeChange} placeholder="123" maxLength={4} />
                  </div>
                </div>
              </>
            )}

            <div className="form-actions">
              <button className="btn btn--secondary" onClick={() => setShowStripe(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handlePaymentSubmit} disabled={processing}>
                {processing ? <><span style={{ display:'inline-block', width:14, height:14, border:'2px solid #000', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite', marginRight:6 }} />Processing...</> : `${payMethod === 'cash' ? '💵 Record Cash' : '💳 Process Card'}`}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cash Receipt Modal */}
      <Modal isOpen={showReceipt} onClose={() => setShowReceipt(false)} title="CASH RECEIPT">
        {receiptData && (
          <div>
            <div ref={receiptRef} className="receipt-container">
              <div className="receipt-header">
                <div className="receipt-logo">{receiptData.gym}</div>
                <div style={{ fontSize:'.72rem', color:'var(--muted)', letterSpacing:2 }}>FITNESS MANAGEMENT SYSTEM</div>
                <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:4 }}>PAYMENT RECEIPT</div>
              </div>
              {[
                { label:'Receipt No', val: `#${receiptData.paymentId}` },
                { label:'Date & Time', val: receiptData.date },
                { label:'Payment Method', val: receiptData.method },
                { label:'Subscription', val: receiptData.subscriptionId ? `#${receiptData.subscriptionId}` : '—' },
                receiptData.receivedBy && { label:'Received By', val: receiptData.receivedBy },
              ].filter(Boolean).map(({ label, val }) => (
                <div className="receipt-row" key={label}>
                  <span style={{ color:'var(--muted)' }}>{label}</span>
                  <span style={{ fontFamily:'Space Mono,monospace', fontSize:'.82rem' }}>{val}</span>
                </div>
              ))}
              <div className="receipt-row receipt-total">
                <span>TOTAL AMOUNT</span>
                <span style={{ color:'var(--success)', fontFamily:'Space Mono,monospace' }}>
                  LKR {parseFloat(receiptData.amount || 0).toFixed(2)}
                </span>
              </div>
              <div className="receipt-footer">
                Thank you for your payment!<br/>
                DTS Gym Management System<br/>
                This is a computer-generated receipt
              </div>
            </div>
            <div className="form-actions" style={{ marginTop:16 }}>
              <button className="btn btn--secondary" onClick={() => setShowReceipt(false)}>Close</button>
              <button className="btn btn--primary" onClick={printReceipt}>🖨️ Print Receipt</button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
