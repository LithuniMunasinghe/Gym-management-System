import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllTimeslots, fetchTimeslotsByTrainer, addTimeslot, deleteTimeslot, toggleTimeslot } from '../actions';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { ROLES } from '../constants';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const initForm = { trainer_Id: '', day_of_week: 'Monday', startTime: '08:00', endTime: '09:00' };

export default function Timeslots() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.timeslots);
  const user = useSelector((s) => s.auth.user);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const [filterTrainer, setFilterTrainer] = useState('');

  useEffect(() => {
    if (user?.roleId === ROLES.TRAINER) {
      dispatch(fetchTimeslotsByTrainer(user.userId));
    } else {
      dispatch(fetchAllTimeslots());
    }
  }, [dispatch, user]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    const payload = user?.roleId === ROLES.TRAINER ? { ...form, trainer_Id: user.userId } : form;
    const ok = await dispatch(addTimeslot(payload));
    setSaving(false);
    if (ok) {
      setShowModal(false);
      setForm(initForm);
      user?.roleId === ROLES.TRAINER ? dispatch(fetchTimeslotsByTrainer(user.userId)) : dispatch(fetchAllTimeslots());
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this timeslot?')) {
      dispatch(deleteTimeslot(id));
      setTimeout(() => {
        user?.roleId === ROLES.TRAINER ? dispatch(fetchTimeslotsByTrainer(user.userId)) : dispatch(fetchAllTimeslots());
      }, 500);
    }
  };

  const handleToggle = (slot) => {
    dispatch(toggleTimeslot(slot.timeslot_Id, !slot.isAvailable));
    setTimeout(() => {
      user?.roleId === ROLES.TRAINER ? dispatch(fetchTimeslotsByTrainer(user.userId)) : dispatch(fetchAllTimeslots());
    }, 500);
  };

  const filtered = filterTrainer ? data.filter((s) => String(s.trainer_Id) === filterTrainer) : data;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">Time Slots</div>
          <div className="section-sub">{data.length} slots configured</div>
        </div>
        <div className="page-header-actions">
          {user?.roleId === ROLES.ADMIN && (
            <input
              className="form-input" placeholder="Filter by Trainer ID..."
              value={filterTrainer} onChange={(e) => setFilterTrainer(e.target.value)}
              style={{ width: 180 }}
            />
          )}
          <button className="btn btn--secondary" onClick={() => user?.roleId === ROLES.TRAINER ? dispatch(fetchTimeslotsByTrainer(user.userId)) : dispatch(fetchAllTimeslots())}>↺ Refresh</button>
          <button className="btn btn--primary" onClick={() => setShowModal(true)}>+ Add Slot</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '56px', textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 10, opacity: .4 }}>🕐</div>
          <div style={{ fontSize: '.83rem' }}>No timeslots found</div>
        </div>
      ) : (
        <div className="timeslot-grid">
          {filtered.map((slot) => (
            <div className="timeslot-card" key={slot.timeslot_Id}>
              <div className="timeslot-day">{slot.day_of_week}</div>
              <div className="timeslot-time">{slot.startTime?.substring(0,5)} — {slot.endTime?.substring(0,5)}</div>
              <div className="timeslot-trainer">Trainer #{slot.trainer_Id}</div>
              <div className="timeslot-footer">
                <Badge variant={slot.isAvailable ? 'active' : 'inactive'}>{slot.isAvailable ? 'Available' : 'Unavailable'}</Badge>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn--sm btn--secondary" onClick={() => handleToggle(slot)}>
                    {slot.isAvailable ? 'Disable' : 'Enable'}
                  </button>
                  <button className="btn btn--sm btn--danger" onClick={() => handleDelete(slot.timeslot_Id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="ADD TIMESLOT">
        <div className="form-grid">
          {user?.roleId === ROLES.ADMIN && (
            <div className="form-group">
              <label className="form-label">Trainer ID *</label>
              <input className="form-input" name="trainer_Id" type="number" value={form.trainer_Id} onChange={handleChange} placeholder="Trainer ID" />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Day of Week</label>
            <select className="form-input" name="day_of_week" value={form.day_of_week} onChange={handleChange}>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input className="form-input" name="startTime" type="time" value={form.startTime} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input className="form-input" name="endTime" type="time" value={form.endTime} onChange={handleChange} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Adding...' : 'Add Slot'}</button>
          </div>
        </div>
      </Modal>

      <style>{`
        .timeslot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
        .timeslot-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px; transition: border-color .2s; }
        .timeslot-card:hover { border-color: var(--border2); }
        .timeslot-day { font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 1px; color: var(--accent); margin-bottom: 6px; }
        .timeslot-time { font-family: 'Space Mono', monospace; font-size: 1.1rem; color: var(--text); margin-bottom: 4px; }
        .timeslot-trainer { font-size: .75rem; color: var(--muted); margin-bottom: 16px; }
        .timeslot-footer { display: flex; align-items: center; justify-content: space-between; }
      `}</style>
    </div>
  );
}
