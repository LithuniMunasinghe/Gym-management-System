import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, addUser, editUserAction, deleteUser } from '../actions';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { formatDate } from '../utils';

const ROLE_LABELS  = { 1: 'Admin', 2: 'Trainer', 3: 'Member' };
const ROLE_VARIANT = { 1: 'admin', 2: 'trainer', 3: 'member' };
const ROLE_COLOR   = { 1: 'var(--accent)', 2: 'var(--accent3)', 3: 'var(--success)' };

const initForm = { username: '', email: '', phone: '', password_hash: '', roleId: '3', status: 'Active' };

export default function Users() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.users);
  const adminId = useSelector((s) => s.ui.currentUserId);

  const [showAdd,   setShowAdd]   = useState(false);
  const [showEdit,  setShowEdit]  = useState(false);
  const [showCard,  setShowCard]  = useState(false);
  const [cardData,  setCardData]  = useState(null);
  const [form,      setForm]      = useState(initForm);
  const [editForm,  setEditForm]  = useState({});
  const [saving,    setSaving]    = useState(false);
  const [search,    setSearch]    = useState('');
  const [viewMode,  setViewMode]  = useState('table');
  const [roleFilter,setRoleFilter]= useState('all');

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  const handleChange     = (e) => setForm((f)     => ({ ...f, [e.target.name]: e.target.value }));
  const handleEditChange = (e) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = async () => {
    setSaving(true);
    const ok = await dispatch(addUser(form, adminId));
    setSaving(false);
    if (ok) { setShowAdd(false); setForm(initForm); }
  };

  const handleEditOpen = (row) => {
    setEditForm({ userId: row.userId, username: row.username || '', email: row.email || '',
      phone: row.phone || '', roleId: String(row.roleId || 3), status: row.status || 'Active' });
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    const ok = await dispatch(editUserAction(editForm, adminId));
    setSaving(false);
    if (ok) setShowEdit(false);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Delete user #${id}? This cannot be undone.`)) dispatch(deleteUser(id, adminId));
  };

  const handleCardOpen = (row) => { setCardData(row); setShowCard(true); };

  let filtered = data;
  if (roleFilter !== 'all') filtered = filtered.filter((u) => String(u.roleId) === roleFilter);
  if (search) filtered = filtered.filter((u) =>
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    String(u.userId).includes(search));

  const columns = [
    { key: 'userId',       label: 'ID',       width:60, render:(v)=><span className="id-chip">#{v}</span> },
    { key: 'username',     label: 'Username',  render:(v)=><strong>{v}</strong> },
    { key: 'email',        label: 'Email',     render:(v)=><span className="muted">{v||'—'}</span> },
    { key: 'phone',        label: 'Phone',     render:(v)=><span className="muted">{v||'—'}</span> },
    { key: 'roleId',       label: 'Role',      render:(v)=><Badge variant={ROLE_VARIANT[v]||'inactive'}>{ROLE_LABELS[v]||'Unknown'}</Badge> },
    { key: 'status',       label: 'Status',    render:(v)=><Badge variant={v==='Active'||!v?'active':'inactive'}>{v||'Active'}</Badge> },
    { key: 'created_date', label: 'Joined',    render:(v)=><span className="muted">{formatDate(v)}</span> },
    { key: '_actions',     label: 'Actions',   render:(_,row)=>(
      <div style={{ display:'flex', gap:6 }}>
        <button className="btn btn--sm btn--secondary" onClick={()=>handleCardOpen(row)}>View</button>
        <button className="btn btn--sm btn--secondary" onClick={()=>handleEditOpen(row)}>Edit</button>
        <button className="btn btn--sm btn--danger"    onClick={()=>handleDelete(row.userId)}>Delete</button>
      </div>
    )},
  ];

  const roleStats = [
    { label:'Admins',   count: data.filter((u)=>u.roleId===1).length, color:'var(--accent)',  key:'1' },
    { label:'Trainers', count: data.filter((u)=>u.roleId===2).length, color:'var(--accent3)', key:'2' },
    { label:'Members',  count: data.filter((u)=>u.roleId===3).length, color:'var(--success)', key:'3' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">System Users</div>
          <div className="section-sub">{filtered.length} of {data.length} users</div>
        </div>
        <div className="page-header-actions">
          <input className="form-input" placeholder="Search users..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ width:200 }} />
          <div className="filter-tabs">
            <button className={`filter-tab${roleFilter==='all'?' filter-tab--active':''}`} onClick={()=>setRoleFilter('all')}>All</button>
            {roleStats.map((r) => (
              <button key={r.key} className={`filter-tab${roleFilter===r.key?' filter-tab--active':''}`}
                onClick={()=>setRoleFilter(r.key)} style={roleFilter===r.key?{}:{}}>
                {r.label} ({r.count})
              </button>
            ))}
          </div>
          <div className="filter-tabs">
            <button className={`filter-tab${viewMode==='table'?' filter-tab--active':''}`} onClick={()=>setViewMode('table')}>Table</button>
            <button className={`filter-tab${viewMode==='cards'?' filter-tab--active':''}`} onClick={()=>setViewMode('cards')}>Cards</button>
          </div>
          <button className="btn btn--primary" onClick={()=>setShowAdd(true)}>+ Add User</button>
        </div>
      </div>

      {/* Role summary cards */}
      <div style={{ display:'flex', gap:14, marginBottom:20 }}>
        {[{ label:'Total Users', count:data.length, color:'var(--muted)' }, ...roleStats].map(({ label, count, color }) => (
          <div key={label} style={{
            background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12,
            padding:'12px 18px', flex:1,
          }}>
            <div style={{ fontSize:'.65rem', textTransform:'uppercase', letterSpacing:2, color:'var(--muted)', marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:'1.6rem', fontFamily:'Bebas Neue,sans-serif', color }}>{count}</div>
          </div>
        ))}
      </div>

      {viewMode === 'cards' ? (
        <div className="user-cards-grid">
          {filtered.map((u) => {
            const roleId = parseInt(u.roleId);
            const color  = ROLE_COLOR[roleId] || 'var(--muted)';
            const type   = roleId === 1 ? 'admin' : roleId === 2 ? 'trainer' : 'member';
            return (
              <div key={u.userId} className={`user-card user-card--${type}`} onClick={()=>handleCardOpen(u)}>
                <div className="user-card-avatar" style={{ background: color }}>
                  {(u.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="user-card-name">{u.username}</div>
                <div className="user-card-role" style={{ color }}>
                  {ROLE_LABELS[roleId] || 'User'} <span className="id-chip">#{u.userId}</span>
                </div>
                <div className="user-card-info">
                  {u.email && <div className="user-card-info-row"><span>✉</span><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{u.email}</span></div>}
                  {u.phone && <div className="user-card-info-row"><span>📞</span><span>{u.phone}</span></div>}
                  <div className="user-card-info-row"><span>📅</span><span>Joined {formatDate(u.created_date)}</span></div>
                </div>
                <div style={{ marginTop:12, display:'flex', gap:8 }} onClick={(e)=>e.stopPropagation()}>
                  <button className="btn btn--sm btn--secondary" style={{ flex:1 }} onClick={()=>handleEditOpen(u)}>Edit</button>
                  <button className="btn btn--sm btn--danger" onClick={()=>handleDelete(u.userId)}>Del</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} loading={loading} rowKey="userId" />
      )}

      {/* Add User Modal */}
      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="ADD USER">
        <div className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input className="form-input" name="username" value={form.username} onChange={handleChange} placeholder="johndoe" />
            </div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select className="form-input" name="roleId" value={form.roleId} onChange={handleChange}>
                <option value="3">Member</option>
                <option value="2">Trainer</option>
                <option value="1">Admin</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+94 77 000 0000" />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" name="password_hash" type="password" value={form.password_hash} onChange={handleChange} placeholder="••••••••" />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={()=>setShowAdd(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleAdd} disabled={saving}>{saving?'Adding...':'Add User'}</button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={showEdit} onClose={()=>setShowEdit(false)} title="EDIT USER">
        <div className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" name="username" value={editForm.username||''} onChange={handleEditChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" name="roleId" value={editForm.roleId||'3'} onChange={handleEditChange}>
                <option value="3">Member</option>
                <option value="2">Trainer</option>
                <option value="1">Admin</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" name="email" type="email" value={editForm.email||''} onChange={handleEditChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" value={editForm.phone||''} onChange={handleEditChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" name="status" value={editForm.status||'Active'} onChange={handleEditChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={()=>setShowEdit(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleEditSave} disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
          </div>
        </div>
      </Modal>

      {/* View Card Modal */}
      <Modal isOpen={showCard} onClose={()=>setShowCard(false)} title="USER CARD">
        {cardData && (() => {
          const roleId = parseInt(cardData.roleId);
          const color  = ROLE_COLOR[roleId] || 'var(--muted)';
          return (
            <div>
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:color, color:'#000',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'Bebas Neue', fontSize:'2rem', margin:'0 auto 12px' }}>
                  {(cardData.username||'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize:'1.2rem', fontWeight:700 }}>{cardData.username}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:6 }}>
                  <Badge variant={ROLE_VARIANT[roleId]||'inactive'}>{ROLE_LABELS[roleId]||'User'}</Badge>
                  <Badge variant={cardData.status==='Active'||!cardData.status?'active':'inactive'}>{cardData.status||'Active'}</Badge>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
                {[
                  { label:'User ID',  val:`#${cardData.userId}` },
                  { label:'Email',    val:cardData.email },
                  { label:'Phone',    val:cardData.phone||'—' },
                  { label:'Joined',   val:formatDate(cardData.created_date) },
                ].map(({label,val})=>(
                  <div key={label} style={{ background:'var(--surface2)', borderRadius:8, padding:'10px 12px' }}>
                    <div style={{ fontSize:'.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:3 }}>{label}</div>
                    <div style={{ fontSize:'.82rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val||'—'}</div>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button className="btn btn--secondary" onClick={()=>{ setShowCard(false); handleEditOpen(cardData); }}>Edit Details</button>
                <button className="btn btn--primary" onClick={()=>setShowCard(false)}>Close</button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
