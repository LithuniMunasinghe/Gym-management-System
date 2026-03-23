import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchSchedulesByMember, fetchSubscriptions,
  fetchMemberAttendance, fetchTrainers, fetchAssignments,
} from '../actions';
import { formatDate, formatCurrency } from '../utils';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function MemberDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user          = useSelector((s) => s.auth.user);
  const schedules     = useSelector((s) => s.schedules.data);
  const subscriptions = useSelector((s) => s.subscriptions.data);
  const attendance    = useSelector((s) => s.attendance.data);
  const trainers      = useSelector((s) => s.trainers.data);
  const assignments   = useSelector((s) => s.assignments.data);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchSchedulesByMember(user.userId));
      dispatch(fetchSubscriptions());
      dispatch(fetchMemberAttendance(user.userId));
      dispatch(fetchTrainers());
      dispatch(fetchAssignments());
    }
  }, [dispatch, user]);

  const mySubscriptions = subscriptions.filter(
    (s) => String(s.memberId) === String(user?.userId)
  );
  const activeSub = mySubscriptions.find((s) => s.is_active || s.isActive);

  // Sessions filtered and sorted
  const pendingSessions   = schedules.filter((s) => s.status === 'Pending');
  const scheduledSessions = schedules.filter((s) => s.status === 'Scheduled');
  const recentAttendance  = (attendance || []).slice(0, 6);

  // My assigned trainer(s)
  const myAssignments = assignments.filter(
    (a) => String(a.memberId) === String(user?.userId)
  );
  const myTrainers = trainers.filter((t) =>
    myAssignments.some((a) => String(a.trainer_Id) === String(t.trainer_Id))
  );

  const statusVariant = (status) => {
    if (status === 'Scheduled') return 'confirmed';
    if (status === 'Cancelled') return 'inactive';
    return 'pending';
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.8rem', letterSpacing: 2, color: 'var(--text)' }}>
            Welcome Back, <span style={{ color: 'var(--success)' }}>{user?.username}</span>
          </div>
          <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: 4 }}>
            Member Portal — DTS Gym &nbsp;·&nbsp; {user?.email}
          </div>
        </div>
        {/* Member Profile Card */}
        <button
          onClick={() => setShowEditProfile(true)}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', transition: 'all .2s', color: 'var(--text)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--success)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: 'var(--success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bebas Neue', fontSize: '1.2rem', color: '#000',
          }}>
            {(user?.username || 'M').charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '.83rem', fontWeight: 600 }}>{user?.username}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: 1 }}>Member · View Profile</div>
          </div>
          <span style={{ color: 'var(--muted)', fontSize: '.9rem' }}>→</span>
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Subscription</div>
          <div className={`stat-value ${activeSub ? 'stat-value--green' : 'stat-value--orange'}`}>
            {activeSub ? 'Active' : 'None'}
          </div>
          <div className="stat-change" style={{ color: activeSub ? 'var(--success)' : 'var(--warning)' }}>
            {activeSub ? `Expires ${formatDate(activeSub.end_date)}` : 'No active plan'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">My Sessions</div>
          <div className="stat-value stat-value--blue">{schedules.length}</div>
          <div className="stat-change" style={{ color: 'var(--accent3)' }}>
            {scheduledSessions.length} confirmed · {pendingSessions.length} pending
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Attendance</div>
          <div className="stat-value stat-value--green">{recentAttendance.length}</div>
          <div className="stat-change">Check-ins recorded</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">My Trainers</div>
          <div className="stat-value stat-value--yellow">{myTrainers.length}</div>
          <div className="stat-change" style={{ color: 'var(--accent)' }}>Assigned to you</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* My Sessions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>My Sessions</div>
            <button className="btn btn--sm btn--secondary" onClick={() => navigate('/schedules')}>View All →</button>
          </div>
          {schedules.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '.82rem' }}>
              <div style={{ fontSize: '2rem', opacity: .4, marginBottom: 8 }}>📅</div>
              No sessions booked yet
            </div>
          ) : (
            <div className="activity-list">
              {schedules.slice(0, 5).map((s) => (
                <div className="activity-item" key={s.scheduleId}>
                  <div className="activity-dot" style={{
                    background: s.status === 'Scheduled' ? 'var(--success)' :
                                s.status === 'Cancelled' ? 'var(--accent2)' : 'var(--warning)'
                  }} />
                  <div className="activity-body">
                    <span className="activity-name">{s.session_name || `Session #${s.scheduleId}`}</span>
                    <span className="activity-meta">Trainer #{s.trainer_Id} · {formatDate(s.scheduleDate)}</span>
                  </div>
                  <Badge variant={statusVariant(s.status)}>{s.status || 'Pending'}</Badge>
                </div>
              ))}
            </div>
          )}
          <button className="btn btn--primary" style={{ marginTop: 16, width: '100%' }} onClick={() => navigate('/schedules')}>
            📅 Book New Session
          </button>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-title">Quick Actions</div>
          <div className="quick-grid">
            <button className="quick-btn" onClick={() => navigate('/schedules')}>
              <span className="quick-icon">📅</span>
              <span className="quick-label">Book Session</span>
              <span className="quick-arrow">→</span>
            </button>
            <button className="quick-btn" onClick={() => navigate('/workouts')}>
              <span className="quick-icon">🏋️</span>
              <span className="quick-label">My Workouts</span>
              <span className="quick-arrow">→</span>
            </button>
            <button className="quick-btn" onClick={() => navigate('/equipment')}>
              <span className="quick-icon">📡</span>
              <span className="quick-label">Live Equipment Floor</span>
              <span className="quick-arrow">→</span>
            </button>
          </div>

          {/* Subscription info */}
          <div style={{ marginTop: 16 }}>
            {activeSub ? (
              <div style={{
                background: 'rgba(71,255,154,.05)', border: '1px solid rgba(71,255,154,.15)',
                borderRadius: 10, padding: 16,
              }}>
                <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 6 }}>Active Plan</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--success)' }}>{activeSub.planType} Plan</div>
                <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 4 }}>
                  {formatDate(activeSub.startDate)} → {formatDate(activeSub.end_date)}
                </div>
                {activeSub.price && (
                  <div style={{ fontSize: '.82rem', color: 'var(--success)', marginTop: 4, fontWeight: 600 }}>
                    {formatCurrency(activeSub.price)}
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: 'rgba(255,179,71,.05)', border: '1px solid rgba(255,179,71,.15)',
                borderRadius: 10, padding: 16, textAlign: 'center',
              }}>
                <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: 4 }}>No active subscription</div>
                <div style={{ fontSize: '.75rem', color: 'var(--warning)' }}>Contact admin to subscribe</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Trainers */}
      {myTrainers.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-title">My Trainers</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {myTrainers.map((t) => (
              <div key={t.trainer_Id} style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: 'var(--accent3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Bebas Neue', fontSize: '1.1rem', color: '#000', flexShrink: 0,
                }}>
                  {(t.username || 'T').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{t.username || `Trainer #${t.trainer_Id}`}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--accent3)' }}>{t.specialization || 'General'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Attendance */}
      {recentAttendance.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-title">Recent Attendance</div>
          <div className="activity-list">
            {recentAttendance.map((a) => (
              <div className="activity-item" key={a.attendanceId}>
                <div className="activity-dot" style={{ background: a.check_out_time ? 'var(--muted)' : 'var(--success)' }} />
                <div className="activity-body">
                  <span className="activity-name">
                    {a.check_out_time ? 'Checked Out' : 'Checked In'}
                  </span>
                  <span className="activity-meta">{formatDate(a.check_in_time)}</span>
                </div>
                <div className="activity-right">
                  <span style={{ fontFamily: 'Space Mono,monospace', fontSize: '.72rem', color: 'var(--muted)' }}>
                    {a.check_in_time ? a.check_in_time.substring(11, 16) : '—'}
                    {a.check_out_time ? ` → ${a.check_out_time.substring(11, 16)}` : ''}
                  </span>
                  <Badge variant={a.check_out_time ? 'inactive' : 'active'}>
                    {a.check_out_time ? 'Left' : 'Inside'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <Modal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} title="MY PROFILE">
        <div className="form-grid">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
            Contact admin to update profile details
          </div>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={() => setShowEditProfile(false)}>Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
