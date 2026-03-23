import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWorkoutsBySchedule, addWorkout, updateWorkout } from '../actions';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { ROLES } from '../constants';
import './Workouts.css';

const initForm = { scheduleId: '', exercise: '', sets: '', weights: '', rest_seconds: '', description: '' };

export default function Workouts() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.workouts);
  const user    = useSelector((s) => s.auth.user);
  const adminId = useSelector((s) => s.ui.currentUserId);

  const [scheduleId, setScheduleId] = useState('');
  const [showAdd,    setShowAdd]    = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);
  const [form,       setForm]       = useState(initForm);
  const [editForm,   setEditForm]   = useState({});
  const [saving,     setSaving]     = useState(false);

  const handleLoad = () => { if (scheduleId.trim()) dispatch(fetchWorkoutsBySchedule(scheduleId)); };

  const handleAdd = async () => {
    setSaving(true);
    const payload = { ...form, scheduleId: form.scheduleId || scheduleId };
    const ok = await dispatch(addWorkout(payload, adminId || user?.userId));
    setSaving(false);
    if (ok) {
      setShowAdd(false); setForm(initForm);
      if (scheduleId) dispatch(fetchWorkoutsBySchedule(scheduleId));
    }
  };

  const handleEditOpen = (row) => { setEditForm({ ...row }); setShowEdit(true); };
  const handleEditSave = async () => {
    setSaving(true);
    const ok = await dispatch(updateWorkout(editForm, adminId || user?.userId));
    setSaving(false);
    if (ok) { setShowEdit(false); if (scheduleId) dispatch(fetchWorkoutsBySchedule(scheduleId)); }
  };

  const statusVariant = { Completed: 'completed', 'In Progress': 'inprogress', Pending: 'pending' };

  const canEdit = user?.roleId === ROLES.ADMIN || user?.roleId === ROLES.TRAINER;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">
            {user?.roleId === ROLES.MEMBER ? 'My Workouts' : 'Workout Sessions'}
          </div>
          <div className="section-sub">{data.length} exercises loaded</div>
        </div>
        <div className="page-header-actions">
          <input className="form-input" placeholder="Schedule ID..."
            value={scheduleId} onChange={(e) => setScheduleId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
            style={{ width: 160 }} />
          <button className="btn btn--secondary" onClick={handleLoad}>Load</button>
          {canEdit && (
            <button className="btn btn--primary" onClick={() => setShowAdd(true)}>+ Add Exercise</button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding:'48px', textAlign:'center', color:'var(--muted)', fontSize:'.75rem' }}>Loading...</div>
      ) : data.length === 0 ? (
        <div style={{ padding:'56px', textAlign:'center', color:'var(--muted)' }}>
          <div style={{ fontSize:'2.2rem', marginBottom:10, opacity:.4 }}>🏋️</div>
          <div style={{ fontSize:'.83rem' }}>
            {user?.roleId === ROLES.MEMBER ? 'No workouts found — enter a Schedule ID above' : 'Enter a Schedule ID and click Load'}
          </div>
        </div>
      ) : (
        <div className="exercise-list">
          {data.map((e, i) => (
            <div className="exercise-card" key={e.workout_sessonId}>
              <div className="exercise-num">{i + 1}</div>
              <div className="exercise-info">
                <div className="exercise-name">{e.exercise}</div>
                {e.description && <div className="exercise-desc">{e.description}</div>}
                <div className="exercise-stats">
                  <span className="exercise-stat"><span className="es-label">Sets</span>{e.sets || '—'}</span>
                  <span className="exercise-stat"><span className="es-label">Weight</span>{e.weights ? `${e.weights}kg` : '—'}</span>
                  <span className="exercise-stat"><span className="es-label">Rest</span>{e.rest_seconds ? `${e.rest_seconds}s` : '—'}</span>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                <Badge variant={statusVariant[e.sub_status] || 'pending'}>{e.sub_status || 'In Progress'}</Badge>
                {canEdit && (
                  <button className="btn btn--sm btn--secondary" onClick={() => handleEditOpen(e)}>Edit</button>
                )}
                {/* Member can mark as completed */}
                {user?.roleId === ROLES.MEMBER && e.sub_status !== 'Completed' && (
                  <button className="btn btn--sm btn--success"
                    onClick={() => dispatch(updateWorkout({ ...e, sub_status: 'Completed' }, user.userId))}>
                    ✓ Done
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="ADD EXERCISE">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Schedule ID</label>
            <input className="form-input" name="scheduleId" type="number"
              value={form.scheduleId || scheduleId} onChange={(e) => setForm((f) => ({ ...f, scheduleId: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Exercise Name *</label>
              <input className="form-input" name="exercise" value={form.exercise}
                onChange={(e) => setForm((f) => ({ ...f, exercise: e.target.value }))} placeholder="Bench Press" />
            </div>
            <div className="form-group">
              <label className="form-label">Sets</label>
              <input className="form-input" name="sets" type="number" value={form.sets}
                onChange={(e) => setForm((f) => ({ ...f, sets: e.target.value }))} placeholder="3" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input className="form-input" name="weights" type="number" step="0.5" value={form.weights}
                onChange={(e) => setForm((f) => ({ ...f, weights: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Rest (seconds)</label>
              <input className="form-input" name="rest_seconds" type="number" value={form.rest_seconds}
                onChange={(e) => setForm((f) => ({ ...f, rest_seconds: e.target.value }))} placeholder="60" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Instructions</label>
            <input className="form-input" name="description" value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional..." />
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleAdd} disabled={saving}>{saving ? 'Adding...' : 'Add Exercise'}</button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="EDIT EXERCISE">
        <div className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Exercise Name</label>
              <input className="form-input" value={editForm.exercise || ''}
                onChange={(e) => setEditForm((f) => ({ ...f, exercise: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Sets</label>
              <input className="form-input" type="number" value={editForm.sets || ''}
                onChange={(e) => setEditForm((f) => ({ ...f, sets: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input className="form-input" type="number" step="0.5" value={editForm.weights || ''}
                onChange={(e) => setEditForm((f) => ({ ...f, weights: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Rest (seconds)</label>
              <input className="form-input" type="number" value={editForm.rest_seconds || ''}
                onChange={(e) => setEditForm((f) => ({ ...f, rest_seconds: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={editForm.sub_status || ''}
              onChange={(e) => setEditForm((f) => ({ ...f, sub_status: e.target.value }))}>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" value={editForm.description || ''}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
