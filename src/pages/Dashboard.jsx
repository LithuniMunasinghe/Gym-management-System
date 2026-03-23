import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMembers, fetchTrainers, fetchSubscriptions, fetchPayments, fetchSchedules } from '../actions';
import { formatDate, formatCurrency, sumBy } from '../utils';
import Badge from '../components/Badge';
import './Dashboard.css';

// ── User Cards component (Admin view) ──
function UserCard({ user: u, color, type, onClick }) {
  return (
    <div className={`user-card user-card--${type}`} onClick={onClick}>
      <div className="user-card-avatar" style={{ background: color }}>
        {(u.username || u.firstName || 'U').charAt(0).toUpperCase()}
      </div>
      <div className="user-card-name">{u.username || `${u.firstName || ''} ${u.lastName || ''}`.trim()}</div>
      <div className="user-card-role" style={{ color }}>
        {type === 'admin' ? 'Administrator' : type === 'trainer' ? 'Trainer' : 'Member'}
      </div>
      <div className="user-card-info">
        {u.email && (
          <div className="user-card-info-row">
            <span>✉</span><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{u.email}</span>
          </div>
        )}
        {u.specialization && (
          <div className="user-card-info-row"><span>🎯</span><span>{u.specialization}</span></div>
        )}
        {u.fitness_goals && (
          <div className="user-card-info-row"><span>💪</span><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{u.fitness_goals}</span></div>
        )}
        {u.joinDate && (
          <div className="user-card-info-row"><span>📅</span><span>Joined {formatDate(u.joinDate)}</span></div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const members       = useSelector((s) => s.members.data);
  const trainers      = useSelector((s) => s.trainers.data);
  const subscriptions = useSelector((s) => s.subscriptions.data);
  const payments      = useSelector((s) => s.payments.data);
  const schedules     = useSelector((s) => s.schedules.data);
  const loading       = useSelector((s) => s.schedules.loading);

  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchTrainers());
    dispatch(fetchSubscriptions());
    dispatch(fetchPayments());
    dispatch(fetchSchedules());
  }, [dispatch]);

  const totalRevenue = sumBy(payments, 'paymentAmount');
  const activeSubs   = subscriptions.filter((s) => s.is_active).length;
  const pendingSched = schedules.filter((s) => s.status === 'Pending').length;

  const quickActions = [
    { icon: '👤', label: 'Manage Members',   route: '/members' },
    { icon: '📋', label: 'New Subscription', route: '/subscriptions' },
    { icon: '📅', label: 'Book Session',     route: '/schedules' },
    { icon: '📡', label: 'RFID Attendance',  route: '/rfid' },
    { icon: '🏋️', label: 'Add Workout',      route: '/workouts' },
    { icon: '⚙️', label: 'Equipment',        route: '/equipment' },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/members')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Total Members</div>
          <div className="stat-value stat-value--yellow">{members.length || '—'}</div>
          <div className="stat-change">↑ Registered</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/trainers')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Active Trainers</div>
          <div className="stat-value stat-value--blue">{trainers.length || '—'}</div>
          <div className="stat-change" style={{ color: 'var(--accent3)' }}>Staff</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/subscriptions')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Active Subs</div>
          <div className="stat-value stat-value--green">{activeSubs || subscriptions.length || '—'}</div>
          <div className="stat-change">Active plans</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/payments')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value stat-value--orange" style={{ fontSize: payments.length ? '1.4rem' : '2.4rem' }}>
            {payments.length ? formatCurrency(totalRevenue) : '—'}
          </div>
          <div className="stat-change" style={{ color: 'var(--warning)' }}>All time</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Sessions */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="card-title" style={{ marginBottom:0 }}>Recent Sessions</div>
            {pendingSched > 0 && (
              <span style={{
                background:'rgba(255,179,71,.12)', border:'1px solid rgba(255,179,71,.3)',
                borderRadius:20, padding:'3px 10px', fontSize:'.72rem', color:'var(--warning)'
              }}>
                {pendingSched} pending
              </span>
            )}
          </div>
          {loading ? (
            <div style={{ padding:'24px', textAlign:'center', color:'var(--muted)', fontSize:'.75rem' }}>Loading...</div>
          ) : schedules.length === 0 ? (
            <div style={{ padding:'32px', textAlign:'center', color:'var(--muted)', fontSize:'.82rem' }}>No schedules found</div>
          ) : (
            <div className="activity-list">
              {schedules.slice(0, 7).map((s) => (
                <div className="activity-item" key={s.scheduleId}>
                  <div className="activity-dot" style={{
                    background: s.status === 'Scheduled' ? 'var(--success)' :
                                s.status === 'Cancelled' ? 'var(--accent2)' : 'var(--warning)'
                  }} />
                  <div className="activity-body">
                    <span className="activity-name">{s.session_name || `Session #${s.scheduleId}`}</span>
                    <span className="activity-meta">Member #{s.memberId} · Trainer #{s.trainer_Id}</span>
                  </div>
                  <div className="activity-right">
                    <span className="activity-date">{formatDate(s.scheduleDate)}</span>
                    <Badge variant={s.status === 'Scheduled' ? 'confirmed' : s.status === 'Cancelled' ? 'inactive' : 'pending'}>
                      {s.status || 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-title">Quick Actions</div>
          <div className="quick-grid">
            {quickActions.map((a) => (
              <button key={a.route} className="quick-btn" onClick={() => navigate(a.route)}>
                <span className="quick-icon">{a.icon}</span>
                <span className="quick-label">{a.label}</span>
                <span className="quick-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Member Cards */}
      {members.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="card-title" style={{ marginBottom:0 }}>Member Cards</div>
            <button className="btn btn--sm btn--secondary" onClick={() => navigate('/members')}>View All</button>
          </div>
          <div className="user-cards-grid">
            {members.slice(0, 6).map((m) => (
              <UserCard key={m.memberId} user={m} color="var(--success)" type="member"
                onClick={() => navigate('/members')} />
            ))}
          </div>
        </div>
      )}

      {/* Trainer Cards */}
      {trainers.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="card-title" style={{ marginBottom:0 }}>Trainer Cards</div>
            <button className="btn btn--sm btn--secondary" onClick={() => navigate('/trainers')}>View All</button>
          </div>
          <div className="user-cards-grid">
            {trainers.slice(0, 4).map((t) => (
              <UserCard key={t.trainer_Id} user={t} color="var(--accent3)" type="trainer"
                onClick={() => navigate('/trainers')} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
