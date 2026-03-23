import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembers, addMember, editMember, deleteMember } from '../actions';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { formatDate } from '../utils';

const initUser   = { username: '', email: '', phone: '', password_hash: '' };
const initMember = { firstName: '', lastName: '', weight: '', height: '', fitness_goals: '' };

export default function Members() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.members);
  const adminId = useSelector((s) => s.ui.currentUserId);

  const [showAdd,   setShowAdd]   = useState(false);
  const [showEdit,  setShowEdit]  = useState(false);
  const [showCard,  setShowCard]  = useState(false);
  const [cardData,  setCardData]  = useState(null);
  const [editRow,   setEditRow]   = useState(null);
  const [userForm,   setUserForm]   = useState(initUser);
  const [memberForm, setMemberForm] = useState(initMember);
  const [saving,  setSaving]  = useState(false);
  const [search,  setSearch]  = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  useEffect(() => { dispatch(fetchMembers()); }, [dispatch]);

  const handleUserChange   = (e) => setUserForm((f)   => ({ ...f, [e.target.name]: e.target.value }));
  const handleMemberChange = (e) => setMemberForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = async () => {
    setSaving(true);
    const ok = await dispatch(addMember(userForm, memberForm, adminId));
    setSaving(false);
    if (ok) { setShowAdd(false); setUserForm(initUser); setMemberForm(initMember); }
  };

  const handleEditOpen = (row) => {
    setEditRow(row);
    setMemberForm({ memberId: row.memberId, firstName: row.firstName || '', lastName: row.lastName || '',
      weight: row.weight || '', height: row.height || '', fitness_goals: row.fitness_goals || '' });
    setShowEdit(true);
  };

  const handleCardOpen = (row) => { setCardData(row); setShowCard(true); };

  const handleEditSave = async () => {
    setSaving(true);
    const ok = await dispatch(editMember(memberForm, adminId));
    setSaving(false);
    if (ok) { setShowEdit(false); setEditRow(null); }
  };

  const handleDelete = (id) => {
    if (window.confirm(`Delete member #${id}?`)) dispatch(deleteMember(id, adminId));
  };

  const filtered = search
    ? data.filter((m) =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
        String(m.memberId).includes(search))
    : data;

  const columns = [
    { key: 'memberId',      label: 'ID',    width: 60,  render: (v) => <span className="id-chip">#{v}</span> },
    { key: '_name',         label: 'Name',  render: (_, r) => <strong>{r.firstName} {r.lastName}</strong> },
    { key: 'email',         label: 'Email', render: (_, r) => <span className="muted">{r.email || '—'}</span> },
    { key: 'joinDate',      label: 'Joined',render: (v) => <span className="muted">{formatDate(v)}</span> },
    { key: 'weight',        label: 'Weight',render: (v) => v ? `${v} kg` : '—' },
    { key: 'height',        label: 'Height',render: (v) => v ? `${v} cm` : '—' },
    { key: 'fitness_goals', label: 'Goal',  render: (v) => <span className="muted" style={{ maxWidth:120, display:'inline-block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v || '—'}</span> },
    { key: 'status',        label: 'Status',render: (v) => <Badge variant={v === 'Active' || !v ? 'active' : 'inactive'}>{v || 'Active'}</Badge> },
    { key: '_actions',      label: 'Actions', render: (_, row) => (
      <div style={{ display:'flex', gap:6 }}>
        <button className="btn btn--sm btn--secondary" onClick={() => handleCardOpen(row)}>View</button>
        <button className="btn btn--sm btn--secondary" onClick={() => handleEditOpen(row)}>Edit</button>
        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(row.memberId)}>Delete</button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">Members</div>
          <div className="section-sub">{filtered.length} members</div>
        </div>
        <div className="page-header-actions">
          <input className="form-input" placeholder="Search members..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ width: 200 }} />
          <div className="filter-tabs">
            <button className={`filter-tab${viewMode === 'table' ? ' filter-tab--active' : ''}`} onClick={() => setViewMode('table')}>Table</button>
            <button className={`filter-tab${viewMode === 'cards' ? ' filter-tab--active' : ''}`} onClick={() => setViewMode('cards')}>Cards</button>
          </div>
          <button className="btn btn--primary" onClick={() => setShowAdd(true)}>+ Add Member</button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="user-cards-grid">
          {filtered.map((m) => (
            <div key={m.memberId} className="user-card user-card--member" onClick={() => handleCardOpen(m)}>
              <div className="user-card-avatar" style={{ background: 'var(--success)' }}>
                {(m.firstName || 'M').charAt(0).toUpperCase()}
              </div>
              <div className="user-card-name">{m.firstName} {m.lastName}</div>
              <div className="user-card-role" style={{ color: 'var(--success)' }}>Member <span className="id-chip">#{m.memberId}</span></div>
              <div className="user-card-info">
                {m.email && <div className="user-card-info-row"><span>✉</span><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{m.email}</span></div>}
                {m.weight && <div className="user-card-info-row"><span>⚖️</span><span>{m.weight} kg</span></div>}
                {m.height && <div className="user-card-info-row"><span>📏</span><span>{m.height} cm</span></div>}
                {m.fitness_goals && <div className="user-card-info-row"><span>💪</span><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{m.fitness_goals}</span></div>}
              </div>
              <div style={{ marginTop:12, display:'flex', gap:8 }} onClick={(e) => e.stopPropagation()}>
                <button className="btn btn--sm btn--secondary" style={{ flex:1 }} onClick={() => handleEditOpen(m)}>Edit</button>
                <button className="btn btn--sm btn--danger" onClick={() => handleDelete(m.memberId)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} loading={loading} rowKey="memberId" />
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="ADD MEMBER">
        <div className="form-grid">
          <div style={{ fontSize:'.72rem', textTransform:'uppercase', letterSpacing:2, color:'var(--accent)', borderBottom:'1px solid var(--border)', paddingBottom:8 }}>Account Info</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input className="form-input" name="username" value={userForm.username} onChange={handleUserChange} placeholder="john_doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" name="email" type="email" value={userForm.email} onChange={handleUserChange} placeholder="john@example.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" value={userForm.phone} onChange={handleUserChange} placeholder="+1 234 567 8900" />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" name="password_hash" type="password" value={userForm.password_hash} onChange={handleUserChange} placeholder="Min 6 characters" />
            </div>
          </div>
          <div style={{ fontSize:'.72rem', textTransform:'uppercase', letterSpacing:2, color:'var(--success)', borderBottom:'1px solid var(--border)', paddingBottom:8, marginTop:4 }}>Member Profile</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-input" name="firstName" value={memberForm.firstName} onChange={handleMemberChange} placeholder="John" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="form-input" name="lastName" value={memberForm.lastName} onChange={handleMemberChange} placeholder="Doe" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input className="form-input" name="weight" type="number" step="0.1" value={memberForm.weight} onChange={handleMemberChange} placeholder="70" />
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input className="form-input" name="height" type="number" step="0.1" value={memberForm.height} onChange={handleMemberChange} placeholder="175" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Fitness Goals</label>
            <input className="form-input" name="fitness_goals" value={memberForm.fitness_goals} onChange={handleMemberChange} placeholder="Weight loss, muscle gain..." />
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleAdd} disabled={saving}>{saving ? 'Adding...' : 'Add Member'}</button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="EDIT MEMBER">
        <div className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" name="firstName" value={memberForm.firstName} onChange={handleMemberChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" name="lastName" value={memberForm.lastName} onChange={handleMemberChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input className="form-input" name="weight" type="number" step="0.1" value={memberForm.weight} onChange={handleMemberChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input className="form-input" name="height" type="number" step="0.1" value={memberForm.height} onChange={handleMemberChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Fitness Goals</label>
            <input className="form-input" name="fitness_goals" value={memberForm.fitness_goals} onChange={handleMemberChange} />
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      </Modal>

      {/* View Card Modal */}
      <Modal isOpen={showCard} onClose={() => setShowCard(false)} title="MEMBER CARD">
        {cardData && (
          <div>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--success)', color:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue', fontSize:'2rem', margin:'0 auto 12px' }}>
                {(cardData.firstName || 'M').charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize:'1.2rem', fontWeight:700 }}>{cardData.firstName} {cardData.lastName}</div>
              <div style={{ fontSize:'.75rem', color:'var(--success)', marginTop:4 }}>Member <span className="id-chip">#{cardData.memberId}</span></div>
              <Badge variant={cardData.status === 'Active' || !cardData.status ? 'active' : 'inactive'} style={{ marginTop:8 }}>
                {cardData.status || 'Active'}
              </Badge>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {[
                { label:'Email',    val: cardData.email },
                { label:'Phone',    val: cardData.phone },
                { label:'Weight',   val: cardData.weight ? `${cardData.weight} kg` : '—' },
                { label:'Height',   val: cardData.height ? `${cardData.height} cm` : '—' },
                { label:'Joined',   val: formatDate(cardData.joinDate) },
                { label:'Goals',    val: cardData.fitness_goals || '—' },
              ].map(({ label, val }) => (
                <div key={label} style={{ background:'var(--surface2)', borderRadius:8, padding:'10px 12px' }}>
                  <div style={{ fontSize:'.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:3 }}>{label}</div>
                  <div style={{ fontSize:'.82rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val || '—'}</div>
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn btn--secondary" onClick={() => { setShowCard(false); handleEditOpen(cardData); }}>Edit Details</button>
              <button className="btn btn--primary" onClick={() => setShowCard(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
