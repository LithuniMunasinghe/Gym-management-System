import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubscriptions, addSubscription, deleteSubscription, fetchPlans, fetchMembers } from '../actions';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { formatDate } from '../utils';

const initForm = { memberId: '', planId: '', startDate: '', end_date: '' };

export default function Subscriptions() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.subscriptions);
  const plans   = useSelector((s) => s.plans.data);
  const members = useSelector((s) => s.members.data);
  const adminId = useSelector((s) => s.ui.currentUserId);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchSubscriptions());
    dispatch(fetchPlans());
    dispatch(fetchMembers());
  }, [dispatch]);

  const handleChange = (e) => {
    const upd = { ...form, [e.target.name]: e.target.value };
    // Auto-calc end date when plan selected
    if (e.target.name === 'planId' && upd.startDate) {
      const plan = plans.find((p) => String(p.planId) === e.target.value);
      if (plan) {
        const end = new Date(upd.startDate);
        end.setDate(end.getDate() + plan.duration_days);
        upd.end_date = end.toISOString().split('T')[0];
      }
    }
    if (e.target.name === 'startDate' && upd.planId) {
      const plan = plans.find((p) => String(p.planId) === upd.planId);
      if (plan) {
        const end = new Date(e.target.value);
        end.setDate(end.getDate() + plan.duration_days);
        upd.end_date = end.toISOString().split('T')[0];
      }
    }
    setForm(upd);
  };

  const handleSubmit = async () => {
    setSaving(true);
    const ok = await dispatch(addSubscription(form));
    setSaving(false);
    if (ok) { setShowModal(false); setForm(initForm); }
  };

  const handleDelete = (id) => {
    if (window.confirm(`Delete subscription #${id}?`)) dispatch(deleteSubscription(id, adminId));
  };

  const filtered = data.filter((s) => {
    if (filter === 'active')   return s.is_active;
    if (filter === 'inactive') return !s.is_active;
    return true;
  });

  const getMemberName = (id) => {
    const m = members.find((m) => m.memberId === id);
    return m ? `${m.firstName} ${m.lastName}` : `Member #${id}`;
  };

  const getPlanName = (id) => {
    const p = plans.find((p) => p.planId === id);
    return p ? p.planType : `Plan #${id}`;
  };

  const columns = [
    { key: 'subscriptionId', label: 'ID',       width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'memberId',       label: 'Member',   render: (v) => <span>{getMemberName(v)}</span> },
    { key: 'planId',         label: 'Plan',     render: (v) => <Badge variant="active">{getPlanName(v)}</Badge> },
    { key: 'startDate',      label: 'Start',    render: (v) => <span className="muted">{formatDate(v)}</span> },
    { key: 'end_date',       label: 'Expires',  render: (v) => <span className="muted">{formatDate(v)}</span> },
    { key: 'is_active',      label: 'Status',   render: (v) => <Badge variant={v ? 'active' : 'inactive'}>{v ? 'Active' : 'Expired'}</Badge> },
    { key: '_actions',       label: 'Actions',  render: (_, row) => (
      <button className="btn btn--sm btn--danger" onClick={() => handleDelete(row.subscriptionId)}>Delete</button>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">Subscriptions</div>
          <div className="section-sub">{data.filter((s) => s.is_active).length} active · {data.length} total</div>
        </div>
        <div className="page-header-actions">
          <div className="filter-tabs">
            {['all','active','inactive'].map((f) => (
              <button key={f} className={`filter-tab${filter === f ? ' filter-tab--active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn--secondary" onClick={() => dispatch(fetchSubscriptions())}>↺ Refresh</button>
          <button className="btn btn--primary" onClick={() => setShowModal(true)}>+ Subscribe</button>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyIcon="📋" emptyText="No subscriptions found" />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="CREATE SUBSCRIPTION">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Member *</label>
            <select className="form-input" name="memberId" value={form.memberId} onChange={handleChange}>
              <option value="">Select member...</option>
              {members.map((m) => (
                <option key={m.memberId} value={m.memberId}>{m.firstName} {m.lastName} (#{m.memberId})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Plan *</label>
            <select className="form-input" name="planId" value={form.planId} onChange={handleChange}>
              <option value="">Select plan...</option>
              {plans.map((p) => (
                <option key={p.planId} value={p.planId}>{p.planType} — LKR {p.price} ({p.duration_days} days)</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input className="form-input" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input className="form-input" name="end_date" type="date" value={form.end_date} onChange={handleChange} readOnly style={{ opacity: 0.7 }} />
            </div>
          </div>
          <div style={{ background: 'rgba(71,255,154,.06)', border: '1px solid rgba(71,255,154,.15)', borderRadius: 8, padding: '10px 14px', fontSize: '.78rem', color: 'var(--muted)' }}>
            💡 Payment is automatically created when subscription is saved (backend trigger).
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Creating...' : 'Create Subscription'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
