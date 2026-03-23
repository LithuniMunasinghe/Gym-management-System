import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSchedules, fetchSchedulesByTrainer, fetchSchedulesByMember,
  addSchedule, confirmSchedule, deleteSchedule,
  updateScheduleStatus, fetchMembers, fetchTrainers, fetchAllTimeslots,
} from '../actions';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { formatDate } from '../utils';
import { ROLES } from '../constants';
import './Schedules.css';

const initForm = { session_name: '', memberId: '', trainer_Id: '', timeslot_Id: '', scheduleDate: '' };

export default function Schedules() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.schedules);
  const members   = useSelector((s) => s.members.data);
  const trainers  = useSelector((s) => s.trainers.data);
  const timeslots = useSelector((s) => s.timeslots.data);
  const user      = useSelector((s) => s.auth.user);
  const adminId   = useSelector((s) => s.ui.currentUserId);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(initForm);
  const [saving, setSaving]       = useState(false);
  const [filter, setFilter]       = useState('all');

  const loadSchedules = () => {
    if (user?.roleId === ROLES.TRAINER) dispatch(fetchSchedulesByTrainer(user.userId));
    else if (user?.roleId === ROLES.MEMBER) dispatch(fetchSchedulesByMember(user.userId));
    else dispatch(fetchSchedules());
  };

  useEffect(() => {
    loadSchedules();
    dispatch(fetchMembers());
    dispatch(fetchTrainers());
    dispatch(fetchAllTimeslots());
  }, [dispatch, user]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    const payload = user?.roleId === ROLES.MEMBER ? { ...form, memberId: user.userId } :
                    user?.roleId === ROLES.TRAINER ? { ...form, trainer_Id: user.userId } : form;
    const ok = await dispatch(addSchedule(payload));
    setSaving(false);
    if (ok) { setShowModal(false); setForm(initForm); }
  };

  // Trainer approve/reject
  const handleApprove = (s) => dispatch(updateScheduleStatus(s.scheduleId, 'Scheduled', user.userId));
  const handleReject  = (s) => dispatch(updateScheduleStatus(s.scheduleId, 'Cancelled', user.userId));
  // Admin confirm
  const handleConfirm = (s) => dispatch(confirmSchedule(s, adminId));
  const handleDelete  = (id) => { if (window.confirm('Delete this schedule?')) dispatch(deleteSchedule(id)); };

  const getMemberName = (id) => {
    const m = members.find((m) => String(m.memberId) === String(id));
    return m ? `${m.firstName} ${m.lastName}` : `Member #${id}`;
  };
  const getTrainerName = (id) => {
    const t = trainers.find((t) => String(t.trainer_Id) === String(id));
    return t ? (t.username || `Trainer #${id}`) : `Trainer #${id}`;
  };

  const filtered = data.filter((s) => {
    if (filter === 'pending')   return s.status === 'Pending' || !s.status;
    if (filter === 'scheduled') return s.status === 'Scheduled';
    if (filter === 'cancelled') return s.status === 'Cancelled';
    return true;
  });

  const statusVariant = (status) => {
    if (status === 'Scheduled') return 'confirmed';
    if (status === 'Cancelled') return 'inactive';
    return 'pending';
  };

  // Available trainers from timeslots for member booking
  const availableTrainers = user?.roleId === ROLES.MEMBER
    ? trainers.filter((t) => timeslots.some((ts) => String(ts.trainer_Id) === String(t.trainer_Id) && ts.isAvailable))
    : trainers;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">
            {user?.roleId === ROLES.MEMBER ? 'My Sessions' :
             user?.roleId === ROLES.TRAINER ? 'Session Requests' : 'Schedules'}
          </div>
          <div className="section-sub">
            {data.length} sessions · {data.filter((s) => s.status === 'Scheduled').length} scheduled
            · {data.filter((s) => s.status === 'Pending' || !s.status).length} pending
          </div>
        </div>
        <div className="page-header-actions">
          <div className="filter-tabs">
            {['all','pending','scheduled','cancelled'].map((f) => (
              <button key={f} className={`filter-tab${filter === f ? ' filter-tab--active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn--secondary" onClick={loadSchedules}>↺ Refresh</button>
          <button className="btn btn--primary" onClick={() => setShowModal(true)}>+ Book Session</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding:'48px', textAlign:'center', color:'var(--muted)', fontSize:'.75rem' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding:'56px', textAlign:'center', color:'var(--muted)' }}>
          <div style={{ fontSize:'2rem', marginBottom:10, opacity:.4 }}>📅</div>
          <div style={{ fontSize:'.83rem' }}>No sessions found</div>
        </div>
      ) : (
        <div className="schedule-grid">
          {filtered.map((s) => (
            <div className="schedule-card" key={s.scheduleId}>
              <div className="schedule-card-header">
                <div>
                  <div className="schedule-card-name">{s.session_name || 'Training Session'}</div>
                  <span className="id-chip">#{s.scheduleId}</span>
                </div>
                <Badge variant={statusVariant(s.status)}>{s.status || 'Pending'}</Badge>
              </div>
              <div className="schedule-card-body">
                <div className="schedule-meta-row">
                  <span className="schedule-meta-icon">👤</span>
                  <span>{getMemberName(s.memberId)}</span>
                </div>
                <div className="schedule-meta-row">
                  <span className="schedule-meta-icon">🏋️</span>
                  <span>{getTrainerName(s.trainer_Id)}</span>
                </div>
                <div className="schedule-meta-row">
                  <span className="schedule-meta-icon">📅</span>
                  <span>{formatDate(s.scheduleDate)}</span>
                </div>
                {s.timeslot_Id && (
                  <div className="schedule-meta-row">
                    <span className="schedule-meta-icon">🕐</span>
                    <span>Slot #{s.timeslot_Id}</span>
                  </div>
                )}
              </div>
              <div className="schedule-card-actions">
                {/* Trainer: Approve or Reject pending sessions */}
                {user?.roleId === ROLES.TRAINER && (s.status === 'Pending' || !s.status) && (
                  <>
                    <button className="btn btn--sm btn--success" onClick={() => handleApprove(s)}>✓ Approve</button>
                    <button className="btn btn--sm btn--danger"  onClick={() => handleReject(s)}>✗ Reject</button>
                  </>
                )}
                {/* Admin: confirm pending */}
                {user?.roleId === ROLES.ADMIN && (s.status === 'Pending' || !s.status) && (
                  <button className="btn btn--sm btn--success" onClick={() => handleConfirm(s)}>✓ Confirm</button>
                )}
                {/* Admin: delete */}
                {user?.roleId === ROLES.ADMIN && (
                  <button className="btn btn--sm btn--danger" onClick={() => handleDelete(s.scheduleId)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="BOOK SESSION">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Session Name</label>
            <input className="form-input" name="session_name" value={form.session_name}
              onChange={handleChange} placeholder="e.g. Morning Strength Training" />
          </div>
          {user?.roleId !== ROLES.MEMBER && (
            <div className="form-group">
              <label className="form-label">Member *</label>
              <select className="form-input" name="memberId" value={form.memberId} onChange={handleChange}>
                <option value="">Select member...</option>
                {members.map((m) => (
                  <option key={m.memberId} value={m.memberId}>{m.firstName} {m.lastName}</option>
                ))}
              </select>
            </div>
          )}
          {user?.roleId !== ROLES.TRAINER && (
            <div className="form-group">
              <label className="form-label">
                Trainer * {user?.roleId === ROLES.MEMBER ? '(Available Trainers)' : ''}
              </label>
              <select className="form-input" name="trainer_Id" value={form.trainer_Id} onChange={handleChange}>
                <option value="">Select trainer...</option>
                {availableTrainers.map((t) => (
                  <option key={t.trainer_Id} value={t.trainer_Id}>
                    {t.username || `Trainer #${t.trainer_Id}`} {t.specialization ? `– ${t.specialization}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          {timeslots.length > 0 && (
            <div className="form-group">
              <label className="form-label">Time Slot</label>
              <select className="form-input" name="timeslot_Id" value={form.timeslot_Id} onChange={handleChange}>
                <option value="">Select time slot...</option>
                {timeslots.filter((ts) => ts.isAvailable).map((ts) => (
                  <option key={ts.timeslot_Id} value={ts.timeslot_Id}>
                    {ts.day_of_week} {ts.startTime?.substring(0,5)}–{ts.endTime?.substring(0,5)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Schedule Date *</label>
            <input className="form-input" name="scheduleDate" type="date" value={form.scheduleDate} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Booking...' : 'Book Session'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
