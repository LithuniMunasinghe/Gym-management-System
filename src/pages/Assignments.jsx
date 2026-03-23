import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments, addAssignment, removeAssignment, fetchMembers, fetchTrainers } from '../actions';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { formatDate } from '../utils';

const initForm = { trainer_Id: '', memberId: '' };

export default function Assignments() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.assignments);
  const members = useSelector((s) => s.members.data);
  const trainers = useSelector((s) => s.trainers.data);
  const adminId = useSelector((s) => s.ui.currentUserId);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(initForm);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    dispatch(fetchAssignments());
    dispatch(fetchMembers());
    dispatch(fetchTrainers());
  }, [dispatch]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    const ok = await dispatch(addAssignment(form, adminId));
    setSaving(false);
    if (ok) { setShowModal(false); setForm(initForm); }
  };

  const handleRemove = (id) => {
    if (window.confirm(`Remove assignment #${id}?`)) dispatch(removeAssignment(id, adminId));
  };

  const getMemberName = (id) => {
    const m = members.find((m) => String(m.memberId) === String(id));
    return m ? `${m.firstName} ${m.lastName}` : `Member #${id}`;
  };
  const getTrainerName = (id) => {
    const t = trainers.find((t) => String(t.trainer_Id) === String(id));
    return t ? (t.username || `Trainer #${id}`) : `Trainer #${id}`;
  };

  const filtered = search
    ? data.filter((a) =>
        getMemberName(a.memberId).toLowerCase().includes(search.toLowerCase()) ||
        getTrainerName(a.trainer_Id).toLowerCase().includes(search.toLowerCase()) ||
        String(a.assignmentId).includes(search))
    : data;

  const columns = [
    { key: 'assignmentId',    label: 'ID',       width:60, render:(v)=><span className="id-chip">#{v}</span> },
    { key: 'trainer_Id',      label: 'Trainer',  render:(v)=>(
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--accent3)', color:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem', fontWeight:700, flexShrink:0 }}>
          {getTrainerName(v).charAt(0).toUpperCase()}
        </div>
        <span>{getTrainerName(v)}</span>
      </div>
    )},
    { key: 'memberId',        label: 'Member',   render:(v)=>(
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--success)', color:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem', fontWeight:700, flexShrink:0 }}>
          {getMemberName(v).charAt(0).toUpperCase()}
        </div>
        <span>{getMemberName(v)}</span>
      </div>
    )},
    { key: 'assignment_date', label: 'Assigned', render:(v)=><span className="muted">{formatDate(v)}</span> },
    { key: '_actions',        label: 'Actions',  render:(_,row)=>(
      <button className="btn btn--sm btn--danger" onClick={()=>handleRemove(row.assignmentId)}>Remove</button>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">Trainer Assignments</div>
          <div className="section-sub">{data.length} assignments</div>
        </div>
        <div className="page-header-actions">
          <input className="form-input" placeholder="Search..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ width:200 }} />
          <button className="btn btn--secondary" onClick={() => dispatch(fetchAssignments())}>↺ Refresh</button>
          <button className="btn btn--primary" onClick={() => setShowModal(true)}>+ Assign Trainer</button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:'flex', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        {trainers.slice(0,4).map((t) => {
          const count = data.filter((a) => String(a.trainer_Id) === String(t.trainer_Id)).length;
          return (
            <div key={t.trainer_Id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent3)', color:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue', fontSize:'1rem', flexShrink:0 }}>
                {(t.username||'T').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:'.82rem', fontWeight:600 }}>{t.username || `Trainer #${t.trainer_Id}`}</div>
                <div style={{ fontSize:'.72rem', color:'var(--accent3)' }}>{count} member{count !== 1 ? 's' : ''}</div>
              </div>
            </div>
          );
        })}
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} rowKey="assignmentId" />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="ASSIGN TRAINER">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Trainer *</label>
            <select className="form-input" name="trainer_Id" value={form.trainer_Id} onChange={handleChange}>
              <option value="">Select trainer...</option>
              {trainers.map((t) => (
                <option key={t.trainer_Id} value={t.trainer_Id}>
                  {t.username || `Trainer #${t.trainer_Id}`} {t.specialization ? `— ${t.specialization}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Member *</label>
            <select className="form-input" name="memberId" value={form.memberId} onChange={handleChange}>
              <option value="">Select member...</option>
              {members.map((m) => (
                <option key={m.memberId} value={m.memberId}>{m.firstName} {m.lastName} (#{m.memberId})</option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Assigning...' : 'Assign Trainer'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
