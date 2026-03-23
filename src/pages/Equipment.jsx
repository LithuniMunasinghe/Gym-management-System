import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEquipment, addEquipment, fetchLiveEquipmentUsage, fetchMembers } from '../actions';
import { formatDate } from '../utils';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { ROLES } from '../constants';

export default function Equipment() {
  const dispatch = useDispatch();
  const equipment      = useSelector((s) => s.equipment.data);
  const equipUsage     = useSelector((s) => s.equipmentUsage.data);
  const members        = useSelector((s) => s.members.data);
  const user           = useSelector((s) => s.auth.user);
  const adminId        = useSelector((s) => s.ui.currentUserId);

  const [showAdd, setShowAdd]   = useState(false);
  const [activeTab, setTab]     = useState('live');
  const [form, setForm]         = useState({ equipmentName: '', equipmentType: '', description: '' });
  const [saving, setSaving]     = useState(false);
  const pollRef                 = useRef(null);

  // Live polling every 10 seconds
  useEffect(() => {
    dispatch(fetchEquipment());
    dispatch(fetchMembers());
    dispatch(fetchLiveEquipmentUsage());
    pollRef.current = setInterval(() => dispatch(fetchLiveEquipmentUsage()), 10000);
    return () => clearInterval(pollRef.current);
  }, [dispatch]);

  const getMemberName = (id) => {
    const m = members.find((m) => String(m.memberId) === String(id));
    return m ? `${m.firstName} ${m.lastName}` : `Member #${id}`;
  };

  const getEquipmentName = (id) => {
    const e = equipment.find((e) => String(e.equipmentId) === String(id));
    return e ? e.equipmentName : `Equipment #${id}`;
  };

  // Currently "in use" = logs that have no end_time
  const activeUsage = equipUsage.filter((u) => !u.endtime);
  const completedToday = equipUsage.filter((u) => u.endtime);

  const handleAdd = async () => {
    setSaving(true);
    const ok = await dispatch(addEquipment(form, adminId));
    setSaving(false);
    if (ok) { setShowAdd(false); setForm({ equipmentName: '', equipmentType: '', description: '' }); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">Equipment & Live Tracking</div>
          <div className="section-sub" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="live-badge"><span className="live-dot" /> LIVE</span>
            <span>{activeUsage.length} in use · {equipment.length} total equipment</span>
          </div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn--secondary" onClick={() => dispatch(fetchLiveEquipmentUsage())}>↺ Refresh</button>
          {user?.roleId === ROLES.ADMIN && (
            <button className="btn btn--primary" onClick={() => setShowAdd(true)}>+ Add Equipment</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        {[
          { key: 'live',      label: `🔴 Live Usage (${activeUsage.length})` },
          { key: 'equipment', label: `⚙️ All Equipment (${equipment.length})` },
          { key: 'history',   label: `📋 Today's History (${completedToday.length})` },
        ].map((t) => (
          <button key={t.key}
            className={`filter-tab${activeTab === t.key ? ' filter-tab--active' : ''}`}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* LIVE USAGE VIEW */}
      {activeTab === 'live' && (
        <div>
          {activeUsage.length === 0 ? (
            <div style={{
              padding: '64px', textAlign: 'center', color: 'var(--muted)',
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 16, opacity: .4 }}>📡</div>
              <div style={{ fontSize: '.9rem', marginBottom: 8 }}>No equipment in use right now</div>
              <div style={{ fontSize: '.75rem' }}>Members tap RFID cards on equipment scanners to appear here</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {activeUsage.map((u) => (
                <div key={u.logId} style={{
                  background: 'var(--surface)', border: '1px solid rgba(71,255,154,.3)',
                  borderRadius: 14, padding: 20, position: 'relative', overflow: 'hidden',
                }}>
                  {/* Live pulse background */}
                  <div style={{
                    position:'absolute', top:0, right:0, width:80, height:80, borderRadius:'50%',
                    background:'var(--success)', opacity:0.05, transform:'translate(20px,-20px)',
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{
                      background: 'rgba(71,255,154,.1)', border: '1px solid rgba(71,255,154,.2)',
                      borderRadius: 8, padding: '6px 12px', fontSize: '.72rem',
                      color: 'var(--success)', fontFamily: 'Space Mono, monospace',
                    }}>
                      {getEquipmentName(u.ea_Id || u.equipmentId)}
                    </div>
                    <span className="live-badge"><span className="live-dot" /> IN USE</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>
                    {getMemberName(u.rfId_Id || u.memberId)}
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: 8 }}>
                    RFID: <span style={{ fontFamily: 'Space Mono, monospace', color: 'var(--text)' }}>{u.rfId_Id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
                      Started: <span style={{ color: 'var(--text)', fontFamily:'Space Mono,monospace' }}>
                        {u.starttime ? u.starttime.substring(11, 16) : '—'}
                      </span>
                    </div>
                    {u.status && (
                      <Badge variant={u.status === 'Active' ? 'active' : 'pending'}>{u.status}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EQUIPMENT LIST */}
      {activeTab === 'equipment' && (
        <div>
          {equipment.length === 0 ? (
            <div style={{ padding:'56px', textAlign:'center', color:'var(--muted)', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14 }}>
              <div style={{ fontSize:'2rem', opacity:.4, marginBottom:8 }}>⚙️</div>
              <div style={{ fontSize:'.83rem' }}>No equipment added yet</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14 }}>
              {equipment.map((e) => {
                const isInUse = activeUsage.some((u) =>
                  String(u.ea_Id || u.equipmentId) === String(e.equipmentId)
                );
                return (
                  <div key={e.equipmentId} style={{
                    background:'var(--surface)', border:`1px solid ${isInUse ? 'rgba(71,255,154,.3)' : 'var(--border)'}`,
                    borderRadius:12, padding:18,
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:'.85rem', fontWeight:600 }}>{e.equipmentName}</div>
                        <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>
                          {e.equipmentType} · #{e.equipmentId}
                        </div>
                      </div>
                      <Badge variant={isInUse ? 'active' : 'inactive'}>{isInUse ? 'In Use' : 'Free'}</Badge>
                    </div>
                    {e.description && (
                      <div style={{ fontSize:'.75rem', color:'var(--muted)' }}>{e.description}</div>
                    )}
                    {isInUse && (
                      <div style={{ marginTop:10, fontSize:'.72rem', color:'var(--success)', display:'flex', alignItems:'center', gap:6 }}>
                        <span className="live-dot" style={{ width:6, height:6 }} />
                        Currently in use
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* HISTORY */}
      {activeTab === 'history' && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
          {completedToday.length === 0 ? (
            <div style={{ padding:'56px', textAlign:'center', color:'var(--muted)', fontSize:'.83rem' }}>
              No completed sessions today
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--surface2)' }}>
                  {['Log ID','Equipment','Member (RFID)','Start Time','End Time','Duration','Status'].map((h) => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'.65rem', textTransform:'uppercase', letterSpacing:'1.5px', color:'var(--muted)', fontWeight:500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedToday.map((u) => {
                  const dur = u.actual_mins ? `${u.actual_mins} min` : '—';
                  return (
                    <tr key={u.logId} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'10px 14px', fontSize:'.78rem' }}><span className="id-chip">#{u.logId}</span></td>
                      <td style={{ padding:'10px 14px', fontSize:'.82rem' }}>{getEquipmentName(u.ea_Id || u.equipmentId)}</td>
                      <td style={{ padding:'10px 14px', fontSize:'.78rem', color:'var(--muted)' }}>
                        <span style={{ fontFamily:'Space Mono,monospace', color:'var(--text)' }}>{u.rfId_Id}</span>
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:'.78rem', fontFamily:'Space Mono,monospace', color:'var(--muted)' }}>
                        {u.starttime ? u.starttime.substring(11, 19) : '—'}
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:'.78rem', fontFamily:'Space Mono,monospace', color:'var(--muted)' }}>
                        {u.endtime ? u.endtime.substring(11, 19) : '—'}
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:'.78rem', color:'var(--accent3)' }}>{dur}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <Badge variant={u.status === 'Completed' ? 'completed' : 'active'}>{u.status || 'Done'}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Equipment Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="ADD EQUIPMENT">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Equipment Name *</label>
            <input className="form-input" value={form.equipmentName}
              onChange={(e) => setForm((f) => ({ ...f, equipmentName: e.target.value }))}
              placeholder="e.g. Treadmill 01, 5KG Dumbbell" />
          </div>
          <div className="form-group">
            <label className="form-label">Equipment Type *</label>
            <select className="form-input" value={form.equipmentType}
              onChange={(e) => setForm((f) => ({ ...f, equipmentType: e.target.value }))}>
              <option value="">Select type...</option>
              <option value="Cardio">Cardio</option>
              <option value="Strength">Strength</option>
              <option value="Free Weights">Free Weights</option>
              <option value="Machines">Machines</option>
              <option value="Functional">Functional</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional details..." />
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleAdd} disabled={saving}>
              {saving ? 'Adding...' : 'Add Equipment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
