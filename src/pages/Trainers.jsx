import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrainers, addTrainer, editTrainer } from '../actions';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';

const initUser    = { username: '', email: '', phone: '', password_hash: '' };
const initTrainer = { specialization: '', experience_years: '' };

export default function Trainers() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.trainers);
  const adminId = useSelector((s) => s.ui.currentUserId);

  const [showAdd,  setShowAdd]  = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [userForm,    setUserForm]    = useState(initUser);
  const [trainerForm, setTrainerForm] = useState(initTrainer);
  const [editForm,    setEditForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [search,  setSearch]  = useState('');
  const [viewMode, setViewMode] = useState('cards');

  useEffect(() => { dispatch(fetchTrainers()); }, [dispatch]);

  const handleAdd = async () => {
    setSaving(true);
    const ok = await dispatch(addTrainer({ ...userForm, ...trainerForm }, adminId));
    setSaving(false);
    if (ok) { setShowAdd(false); setUserForm(initUser); setTrainerForm(initTrainer); }
  };

  const handleEditOpen = (row) => {
    setEditForm({ trainer_Id: row.trainer_Id, specialization: row.specialization || '', experience_years: row.experience_years || '' });
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    const ok = await dispatch(editTrainer(editForm, adminId));
    setSaving(false);
    if (ok) setShowEdit(false);
  };

  const filtered = search
    ? data.filter((t) =>
        (t.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.specialization || '').toLowerCase().includes(search.toLowerCase()))
    : data;

  const columns = [
    { key: 'trainer_Id',      label: 'ID',            width:60, render:(v)=><span className="id-chip">#{v}</span> },
    { key: 'username',        label: 'Name',           render:(v)=><strong>{v || '—'}</strong> },
    { key: 'email',           label: 'Email',          render:(v)=><span className="muted">{v || '—'}</span> },
    { key: 'specialization',  label: 'Specialization', render:(v)=><span>{v || '—'}</span> },
    { key: 'experience_years',label: 'Experience',     render:(v)=>v ? `${v} yrs` : '—' },
    { key: 'status',          label: 'Status',         render:(v)=><Badge variant={v === 'Active' || !v ? 'active':'inactive'}>{v||'Active'}</Badge> },
    { key: '_actions', label:'Actions', render:(_, row)=>(
      <div style={{ display:'flex', gap:6 }}>
        <button className="btn btn--sm btn--secondary" onClick={()=>{setCardData(row);setShowCard(true);}}>View</button>
        <button className="btn btn--sm btn--secondary" onClick={()=>handleEditOpen(row)}>Edit</button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">Trainers</div>
          <div className="section-sub">{filtered.length} trainers</div>
        </div>
        <div className="page-header-actions">
          <input className="form-input" placeholder="Search trainers..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ width:200 }} />
          <div className="filter-tabs">
            <button className={`filter-tab${viewMode==='cards'?' filter-tab--active':''}`} onClick={()=>setViewMode('cards')}>Cards</button>
            <button className={`filter-tab${viewMode==='table'?' filter-tab--active':''}`} onClick={()=>setViewMode('table')}>Table</button>
          </div>
          <button className="btn btn--primary" onClick={()=>setShowAdd(true)}>+ Add Trainer</button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="user-cards-grid">
          {filtered.map((t) => (
            <div key={t.trainer_Id} className="user-card user-card--trainer" onClick={()=>{setCardData(t);setShowCard(true);}}>
              <div className="user-card-avatar" style={{ background:'var(--accent3)' }}>
                {(t.username||'T').charAt(0).toUpperCase()}
              </div>
              <div className="user-card-name">{t.username || `Trainer #${t.trainer_Id}`}</div>
              <div className="user-card-role" style={{ color:'var(--accent3)' }}>Trainer <span className="id-chip">#{t.trainer_Id}</span></div>
              <div className="user-card-info">
                {t.email && <div className="user-card-info-row"><span>✉</span><span style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160 }}>{t.email}</span></div>}
                {t.specialization && <div className="user-card-info-row"><span>🎯</span><span>{t.specialization}</span></div>}
                {t.experience_years && <div className="user-card-info-row"><span>⏱</span><span>{t.experience_years} years experience</span></div>}
              </div>
              <div style={{ marginTop:12, display:'flex', gap:8 }} onClick={(e)=>e.stopPropagation()}>
                <button className="btn btn--sm btn--secondary" style={{ flex:1 }} onClick={()=>handleEditOpen(t)}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} loading={loading} rowKey="trainer_Id" />
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="ADD TRAINER">
        <div className="form-grid">
          <div style={{ fontSize:'.72rem', textTransform:'uppercase', letterSpacing:2, color:'var(--accent3)', borderBottom:'1px solid var(--border)', paddingBottom:8 }}>Account Info</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input className="form-input" name="username" value={userForm.username} onChange={(e)=>setUserForm((f)=>({...f,[e.target.name]:e.target.value}))} placeholder="trainer_jane" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" name="email" type="email" value={userForm.email} onChange={(e)=>setUserForm((f)=>({...f,[e.target.name]:e.target.value}))} placeholder="jane@gym.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" value={userForm.phone} onChange={(e)=>setUserForm((f)=>({...f,[e.target.name]:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" name="password_hash" type="password" value={userForm.password_hash} onChange={(e)=>setUserForm((f)=>({...f,[e.target.name]:e.target.value}))} />
            </div>
          </div>
          <div style={{ fontSize:'.72rem', textTransform:'uppercase', letterSpacing:2, color:'var(--accent3)', borderBottom:'1px solid var(--border)', paddingBottom:8, marginTop:4 }}>Trainer Profile</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Specialization</label>
              <select className="form-input" value={trainerForm.specialization} onChange={(e)=>setTrainerForm((f)=>({...f,specialization:e.target.value}))}>
                <option value="">Select...</option>
                {['Weightlifting','Cardio','Yoga','CrossFit','Functional Training','Nutrition','Boxing','Swimming','General'].map((s)=>(
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Experience (years)</label>
              <input className="form-input" type="number" value={trainerForm.experience_years} onChange={(e)=>setTrainerForm((f)=>({...f,experience_years:e.target.value}))} placeholder="3" />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={()=>setShowAdd(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleAdd} disabled={saving}>{saving?'Adding...':'Add Trainer'}</button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={()=>setShowEdit(false)} title="EDIT TRAINER">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <select className="form-input" value={editForm.specialization||''} onChange={(e)=>setEditForm((f)=>({...f,specialization:e.target.value}))}>
              <option value="">Select...</option>
              {['Weightlifting','Cardio','Yoga','CrossFit','Functional Training','Nutrition','Boxing','Swimming','General'].map((s)=>(
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Experience (years)</label>
            <input className="form-input" type="number" value={editForm.experience_years||''} onChange={(e)=>setEditForm((f)=>({...f,experience_years:e.target.value}))} />
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={()=>setShowEdit(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleEditSave} disabled={saving}>{saving?'Saving...':'Save'}</button>
          </div>
        </div>
      </Modal>

      {/* View Card */}
      <Modal isOpen={showCard} onClose={()=>setShowCard(false)} title="TRAINER CARD">
        {cardData && (
          <div>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--accent3)', color:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue', fontSize:'2rem', margin:'0 auto 12px' }}>
                {(cardData.username||'T').charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize:'1.2rem', fontWeight:700 }}>{cardData.username||`Trainer #${cardData.trainer_Id}`}</div>
              <div style={{ fontSize:'.75rem', color:'var(--accent3)', marginTop:4 }}>Trainer <span className="id-chip">#{cardData.trainer_Id}</span></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {[
                { label:'Email',         val:cardData.email },
                { label:'Phone',         val:cardData.phone },
                { label:'Specialization',val:cardData.specialization||'—' },
                { label:'Experience',    val:cardData.experience_years ? `${cardData.experience_years} years` : '—' },
              ].map(({label,val})=>(
                <div key={label} style={{ background:'var(--surface2)', borderRadius:8, padding:'10px 12px' }}>
                  <div style={{ fontSize:'.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:3 }}>{label}</div>
                  <div style={{ fontSize:'.82rem' }}>{val||'—'}</div>
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn btn--secondary" onClick={()=>{setShowCard(false);handleEditOpen(cardData);}}>Edit Details</button>
              <button className="btn btn--primary" onClick={()=>setShowCard(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
