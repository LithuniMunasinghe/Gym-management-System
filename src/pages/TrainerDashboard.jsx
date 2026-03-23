import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchSchedulesByTrainer, fetchAssignments,
  fetchTimeslotsByTrainer, updateScheduleStatus,
  fetchMembers, fetchWorkoutsBySchedule, addWorkout,
} from '../actions';
import { formatDate } from '../utils';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function TrainerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user        = useSelector((s) => s.auth.user);
  const schedules   = useSelector((s) => s.schedules.data);
  const assignments = useSelector((s) => s.assignments.data);
  const timeslots   = useSelector((s) => s.timeslots.data);
  const members     = useSelector((s) => s.members.data);
  const workouts    = useSelector((s) => s.workouts.data);

  const [activeTab, setActiveTab]       = useState('pending');
  const [showAddEx, setShowAddEx]       = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showProfile, setShowProfile]   = useState(false);
  const [exForm, setExForm] = useState({ exercise: '', sets: '', weights: '', rest_seconds: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchSchedulesByTrainer(user.userId));
      dispatch(fetchAssignments());
      dispatch(fetchTimeslotsByTrainer(user.userId));
      dispatch(fetchMembers());
    }
  }, [dispatch, user]);

  const myAssignments = assignments.filter(
    (a) => String(a.trainer_Id) === String(user?.userId)
  );

  const pendingSessions   = schedules.filter((s) => s.status === 'Pending');
  const scheduledSessions = schedules.filter((s) => s.status === 'Scheduled');
  const cancelledSessions = schedules.filter((s) => s.status === 'Cancelled');

  const getMemberName = (id) => {
    const m = members.find((m) => String(m.memberId) === String(id));
    return m ? `${m.firstName} ${m.lastName}` : `Member #${id}`;
  };

  const handleApprove = (s) => {
    dispatch(updateScheduleStatus(s.scheduleId, 'Scheduled', user.userId));
  };
  const handleReject = (s) => {
    dispatch(updateScheduleStatus(s.scheduleId, 'Cancelled', user.userId));
  };

  const handleOpenAddExercise = (schedule) => {
    setSelectedSchedule(schedule);
    dispatch(fetchWorkoutsBySchedule(schedule.scheduleId));
    setShowAddEx(true);
  };

  const handleAddExercise = async () => {
    if (!exForm.exercise.trim()) return;
    setSaving(true);
    const ok = await dispatch(addWorkout(
      { ...exForm, scheduleId: selectedSchedule.scheduleId },
      user.userId
    ));
    setSaving(false);
    if (ok) {
      setExForm({ exercise: '', sets: '', weights: '', rest_seconds: '', description: '' });
      dispatch(fetchWorkoutsBySchedule(selectedSchedule.scheduleId));
    }
  };

  const tabSessions = activeTab === 'pending'   ? pendingSessions :
                      activeTab === 'scheduled' ? scheduledSessions : cancelledSessions;

  const statusBadge = (status) => {
    if (status === 'Scheduled') return 'confirmed';
    if (status === 'Cancelled') return 'inactive';
    return 'pending';
  };

  return (
    <div>
      {/* Welcome + Profile card */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.8rem', letterSpacing: 2, color: 'var(--text)' }}>
            Trainer Portal — <span style={{ color: 'var(--accent3)' }}>{user?.username}</span>
          </div>
          <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: 4 }}>DTS Gym Management · {user?.email}</div>
        </div>
        <button
          onClick={() => setShowProfile(true)}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', transition: 'all .2s', color: 'var(--text)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: 'var(--accent3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bebas Neue', fontSize: '1.2rem', color: '#000',
          }}>
            {(user?.username || 'T').charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '.83rem', fontWeight: 600 }}>{user?.username}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--accent3)', textTransform: 'uppercase', letterSpacing: 1 }}>Trainer · View Profile</div>
          </div>
          <span style={{ color: 'var(--muted)' }}>→</span>
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">My Members</div>
          <div className="stat-value stat-value--yellow">{myAssignments.length}</div>
          <div className="stat-change">Assigned to you</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value stat-value--orange">{pendingSessions.length}</div>
          <div className="stat-change" style={{ color: 'var(--warning)' }}>Awaiting decision</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Scheduled</div>
          <div className="stat-value stat-value--green">{scheduledSessions.length}</div>
          <div className="stat-change">Approved sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Sessions</div>
          <div className="stat-value stat-value--blue">{schedules.length}</div>
          <div className="stat-change" style={{ color: 'var(--accent3)' }}>All time</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Sessions with Approve/Reject */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Session Requests</div>
            <button className="btn btn--sm btn--secondary" onClick={() => navigate('/schedules')}>All →</button>
          </div>

          {/* Tab selector */}
          <div className="filter-tabs" style={{ marginBottom: 14 }}>
            {[
              { key: 'pending',   label: `Pending (${pendingSessions.length})` },
              { key: 'scheduled', label: `Approved (${scheduledSessions.length})` },
              { key: 'cancelled', label: `Rejected (${cancelledSessions.length})` },
            ].map((t) => (
              <button key={t.key} className={`filter-tab${activeTab === t.key ? ' filter-tab--active' : ''}`}
                onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {tabSessions.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '.82rem' }}>
              No {activeTab} sessions
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tabSessions.slice(0, 5).map((s) => (
                <div key={s.scheduleId} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{s.session_name || `Session #${s.scheduleId}`}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 2 }}>
                        {getMemberName(s.memberId)} · {formatDate(s.scheduleDate)}
                      </div>
                    </div>
                    <Badge variant={statusBadge(s.status)}>{s.status || 'Pending'}</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {s.status === 'Pending' && (
                      <>
                        <button className="btn btn--sm btn--success" onClick={() => handleApprove(s)}>✓ Approve</button>
                        <button className="btn btn--sm btn--danger"  onClick={() => handleReject(s)}>✗ Reject</button>
                      </>
                    )}
                    {s.status === 'Scheduled' && (
                      <button className="btn btn--sm btn--secondary" onClick={() => handleOpenAddExercise(s)}>
                        + Add Exercise
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions + Timeslots */}
        <div className="card">
          <div className="card-title">Quick Actions</div>
          <div className="quick-grid">
            <button className="quick-btn" onClick={() => navigate('/schedules')}>
              <span className="quick-icon">📅</span>
              <span className="quick-label">Manage Sessions</span>
              <span className="quick-arrow">→</span>
            </button>
            <button className="quick-btn" onClick={() => navigate('/timeslots')}>
              <span className="quick-icon">🕐</span>
              <span className="quick-label">My Time Slots</span>
              <span className="quick-arrow">→</span>
            </button>
            <button className="quick-btn" onClick={() => navigate('/workouts')}>
              <span className="quick-icon">🏋️</span>
              <span className="quick-label">Workout Plans</span>
              <span className="quick-arrow">→</span>
            </button>
            <button className="quick-btn" onClick={() => navigate('/equipment')}>
              <span className="quick-icon">📡</span>
              <span className="quick-label">Live Equipment Floor</span>
              <span className="quick-arrow">→</span>
            </button>
          </div>

          {/* My Time Slots */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 10 }}>
              My Time Slots
            </div>
            {timeslots.length === 0 ? (
              <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>No timeslots configured</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {timeslots.slice(0, 4).map((t) => (
                  <div key={t.timeslot_Id || t.trainerTimeslot_Id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: '.8rem', color: 'var(--text)' }}>{t.day_of_week || t.dayOfWeek}</span>
                    <span style={{ fontSize: '.75rem', fontFamily: 'Space Mono,monospace', color: 'var(--muted)' }}>
                      {(t.startTime || t.start_time || '').substring(0,5)} – {(t.endTime || t.end_time || '').substring(0,5)}
                    </span>
                    <Badge variant={t.isAvailable || t.isActive ? 'active' : 'inactive'}>
                      {t.isAvailable || t.isActive ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Assigned Members */}
      {myAssignments.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-title">My Members</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {myAssignments.slice(0, 8).map((a) => {
              const m = members.find((m) => String(m.memberId) === String(a.memberId));
              return (
                <div key={a.assignmentId} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', background: 'var(--success)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Bebas Neue', fontSize: '1rem', color: '#000', flexShrink: 0,
                  }}>
                    {m ? m.firstName.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '.83rem', fontWeight: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {m ? `${m.firstName} ${m.lastName}` : `Member #${a.memberId}`}
                    </div>
                    <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>Since {formatDate(a.assignment_date)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      <Modal isOpen={showAddEx} onClose={() => setShowAddEx(false)} title="ADD EXERCISE FOR MEMBER">
        {selectedSchedule && (
          <div style={{ marginBottom: 14, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8, fontSize: '.82rem', color: 'var(--muted)' }}>
            Session: <strong style={{ color: 'var(--text)' }}>{selectedSchedule.session_name || `#${selectedSchedule.scheduleId}`}</strong>
            &nbsp;·&nbsp; Member: <strong style={{ color: 'var(--text)' }}>{getMemberName(selectedSchedule.memberId)}</strong>
          </div>
        )}
        {/* Existing exercises */}
        {workouts.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 8 }}>Current Exercises</div>
            {workouts.map((w, i) => (
              <div key={w.workout_sessonId} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '.82rem',
              }}>
                <span style={{ color: 'var(--muted)', fontFamily: 'Space Mono, monospace', fontSize: '.72rem' }}>{i+1}.</span>
                <span style={{ flex: 1 }}>{w.exercise}</span>
                <span style={{ color: 'var(--muted)', fontSize: '.72rem' }}>
                  {w.sets && `${w.sets} sets`} {w.weights && `· ${w.weights}kg`}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Exercise Name *</label>
              <input className="form-input" value={exForm.exercise}
                onChange={(e) => setExForm((f) => ({ ...f, exercise: e.target.value }))}
                placeholder="e.g. Bench Press" />
            </div>
            <div className="form-group">
              <label className="form-label">Sets</label>
              <input className="form-input" type="number" value={exForm.sets}
                onChange={(e) => setExForm((f) => ({ ...f, sets: e.target.value }))} placeholder="3" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input className="form-input" type="number" step="0.5" value={exForm.weights}
                onChange={(e) => setExForm((f) => ({ ...f, weights: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Rest (seconds)</label>
              <input className="form-input" type="number" value={exForm.rest_seconds}
                onChange={(e) => setExForm((f) => ({ ...f, rest_seconds: e.target.value }))} placeholder="60" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Instructions</label>
            <input className="form-input" value={exForm.description}
              onChange={(e) => setExForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional notes..." />
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={() => setShowAddEx(false)}>Close</button>
            <button className="btn btn--primary" onClick={handleAddExercise} disabled={saving || !exForm.exercise.trim()}>
              {saving ? 'Adding...' : '+ Add Exercise'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Profile Modal */}
      <Modal isOpen={showProfile} onClose={() => setShowProfile(false)} title="MY TRAINER PROFILE">
        <div className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="form-input" style={{ opacity: .7 }}>{user?.username}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="form-input" style={{ opacity: .7 }}>{user?.email}</div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <div className="form-input" style={{ opacity: .7 }}>{user?.phone || '—'}</div>
          </div>
          <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)', fontSize: '.78rem', color: 'var(--muted)', textAlign: 'center' }}>
            Contact admin to update your trainer profile
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={() => setShowProfile(false)}>Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
