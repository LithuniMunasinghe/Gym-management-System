import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembers, fetchTrainers, fetchPayments, fetchSubscriptions, fetchSchedules, fetchAssignments } from '../actions';
import { formatCurrency, formatDate, sumBy } from '../utils';
import './Reports.css';

export default function Reports() {
  const dispatch = useDispatch();
  const members       = useSelector((s) => s.members.data);
  const trainers      = useSelector((s) => s.trainers.data);
  const payments      = useSelector((s) => s.payments.data);
  const subscriptions = useSelector((s) => s.subscriptions.data);
  const schedules     = useSelector((s) => s.schedules.data);
  const assignments   = useSelector((s) => s.assignments.data);

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchTrainers());
    dispatch(fetchPayments());
    dispatch(fetchSubscriptions());
    dispatch(fetchSchedules());
    dispatch(fetchAssignments());
  }, [dispatch]);

  // ── Computed metrics ──────────────────────────────────────
  const totalRevenue    = sumBy(payments, 'paymentAmount');
  const completedPmts   = payments.filter((p) => p.payment_Status === 'Completed');
  const refundedPmts    = payments.filter((p) => p.payment_Status === 'Refunded');
  const activeSubs      = subscriptions.filter((s) => s.is_active);
  const confirmedSess   = schedules.filter((s) => s.status === 'Scheduled');
  const pendingSess     = schedules.filter((s) => s.status === 'Pending' || !s.status);
  const avgPayment      = payments.length ? totalRevenue / payments.length : 0;
  const trainerRatio    = trainers.length ? (members.length / trainers.length).toFixed(1) : '—';

  // Monthly revenue (last 6 months from payments)
  const monthlyRevenue = (() => {
    const map = {};
    payments.forEach((p) => {
      if (!p.payment_date) return;
      const key = p.payment_date.substring(0, 7);
      map[key] = (map[key] || 0) + parseFloat(p.paymentAmount || 0);
    });
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);
  })();

  const maxMonthRevenue = Math.max(...monthlyRevenue.map((m) => m[1]), 1);

  // Plan distribution
  const planDist = (() => {
    const map = {};
    subscriptions.forEach((s) => {
      const key = s.planType || `Plan #${s.planId}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map);
  })();

  // Trainer workload
  const trainerWorkload = trainers.map((t) => ({
    ...t,
    memberCount: assignments.filter((a) => a.trainer_Id === t.trainer_Id).length,
    sessionCount: schedules.filter((s) => s.trainer_Id === t.trainer_Id).length,
  }));

  const tabs = [
    { id: 'overview',   label: '📊 Overview' },
    { id: 'revenue',    label: '💰 Revenue' },
    { id: 'membership', label: '👥 Membership' },
    { id: 'trainers',   label: '🏋️ Trainers' },
    { id: 'sessions',   label: '📅 Sessions' },
  ];

  return (
    <div className="reports-root">
      <div className="page-header">
        <div>
          <div className="page-title-text">Reports & Analytics</div>
          <div className="section-sub">DTS Gym — Management Overview</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn--secondary" onClick={() => window.print()}>🖨 Print</button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="report-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`report-tab${activeTab === t.id ? ' report-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="report-section">
          <div className="report-kpi-grid">
            <KpiCard label="Total Revenue"    value={formatCurrency(totalRevenue)}  sub={`${completedPmts.length} completed payments`} color="accent"  icon="💰" />
            <KpiCard label="Total Members"    value={members.length}                sub={`${activeSubs.length} active subscriptions`}  color="blue"    icon="👥" />
            <KpiCard label="Active Trainers"  value={trainers.length}               sub={`${trainerRatio}:1 member ratio`}             color="green"   icon="🏋️" />
            <KpiCard label="Total Sessions"   value={schedules.length}              sub={`${confirmedSess.length} confirmed`}          color="orange"  icon="📅" />
          </div>

          <div className="report-row">
            <div className="report-card report-card--wide">
              <div className="rc-title">Monthly Revenue Trend</div>
              {monthlyRevenue.length === 0 ? (
                <div className="rc-empty">No payment data yet</div>
              ) : (
                <div className="bar-chart">
                  {monthlyRevenue.map(([month, amount]) => (
                    <div className="bar-item" key={month}>
                      <div className="bar-label-top">{formatCurrency(amount)}</div>
                      <div
                        className="bar-fill"
                        style={{ height: `${Math.max(8, (amount / maxMonthRevenue) * 180)}px` }}
                      />
                      <div className="bar-label">{month.substring(5)}/{month.substring(2,4)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="report-card">
              <div className="rc-title">Quick Stats</div>
              <div className="quick-stats">
                <StatRow label="Avg Payment Value"     value={formatCurrency(avgPayment)} />
                <StatRow label="Refunded Payments"     value={refundedPmts.length} />
                <StatRow label="Pending Sessions"      value={pendingSess.length} />
                <StatRow label="Total Assignments"     value={assignments.length} />
                <StatRow label="Active Subscriptions"  value={activeSubs.length} />
                <StatRow label="Member:Trainer Ratio"  value={`${trainerRatio}:1`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REVENUE TAB ──────────────────────────────────── */}
      {activeTab === 'revenue' && (
        <div className="report-section">
          <div className="report-kpi-grid">
            <KpiCard label="Total Revenue"     value={formatCurrency(totalRevenue)}          sub="All time"             color="accent" icon="💰" />
            <KpiCard label="Completed"         value={formatCurrency(sumBy(completedPmts, 'paymentAmount'))} sub={`${completedPmts.length} payments`} color="green"  icon="✅" />
            <KpiCard label="Refunded"          value={formatCurrency(sumBy(refundedPmts, 'paymentAmount'))}  sub={`${refundedPmts.length} refunds`}   color="orange" icon="↩" />
            <KpiCard label="Avg Transaction"   value={formatCurrency(avgPayment)}             sub="Per payment"          color="blue"   icon="📈" />
          </div>

          <div className="report-card">
            <div className="rc-title">Payment History</div>
            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Payment ID</th><th>Subscription</th><th>Amount</th><th>Date</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 20).map((p) => (
                    <tr key={p.paymentId}>
                      <td><span className="id-chip">#{p.paymentId}</span></td>
                      <td>Sub #{p.subscriptionId}</td>
                      <td style={{ color: 'var(--success)', fontFamily: 'Space Mono,monospace', fontWeight: 600 }}>{formatCurrency(p.paymentAmount)}</td>
                      <td className="muted">{formatDate(p.payment_date)}</td>
                      <td>
                        <span className={`status-pill status-pill--${(p.payment_Status || '').toLowerCase()}`}>
                          {p.payment_Status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && <div className="rc-empty">No payments recorded yet</div>}
            </div>
          </div>

          {planDist.length > 0 && (
            <div className="report-card">
              <div className="rc-title">Subscriptions by Plan Type</div>
              <div className="donut-legend">
                {planDist.map(([plan, count], i) => (
                  <div className="legend-item" key={plan}>
                    <div className="legend-dot" style={{ background: ['var(--accent)','var(--accent3)','var(--success)','var(--warning)'][i % 4] }} />
                    <span>{plan}</span>
                    <span className="legend-val">{count}</span>
                    <span className="legend-pct">({Math.round(count / subscriptions.length * 100)}%)</span>
                  </div>
                ))}
              </div>
              <div className="plan-bars">
                {planDist.map(([plan, count], i) => (
                  <div className="plan-bar-row" key={plan}>
                    <div className="plan-bar-label">{plan}</div>
                    <div className="plan-bar-track">
                      <div
                        className="plan-bar-fill"
                        style={{
                          width: `${(count / subscriptions.length) * 100}%`,
                          background: ['var(--accent)','var(--accent3)','var(--success)','var(--warning)'][i % 4],
                        }}
                      />
                    </div>
                    <div className="plan-bar-val">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MEMBERSHIP TAB ───────────────────────────────── */}
      {activeTab === 'membership' && (
        <div className="report-section">
          <div className="report-kpi-grid">
            <KpiCard label="Total Members"       value={members.length}        sub="Registered"               color="accent" icon="👥" />
            <KpiCard label="Active Subs"          value={activeSubs.length}     sub="Currently active"         color="green"  icon="✅" />
            <KpiCard label="Inactive Subs"        value={subscriptions.length - activeSubs.length} sub="Expired/cancelled" color="orange" icon="⏸" />
            <KpiCard label="Avg Subscription"     value={subscriptions.length ? Math.round(subscriptions.length / Math.max(members.length,1) * 100) + '%' : '—'} sub="Member coverage" color="blue" icon="📊" />
          </div>

          <div className="report-card">
            <div className="rc-title">Member Directory</div>
            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Join Date</th><th>Weight</th><th>Height</th><th>Fitness Goal</th></tr>
                </thead>
                <tbody>
                  {members.slice(0, 20).map((m) => (
                    <tr key={m.memberId}>
                      <td><span className="id-chip">#{m.memberId}</span></td>
                      <td><strong>{m.firstName} {m.lastName}</strong></td>
                      <td className="muted">{formatDate(m.joinDate)}</td>
                      <td className="muted">{m.weight ? `${m.weight} kg` : '—'}</td>
                      <td className="muted">{m.height ? `${m.height} cm` : '—'}</td>
                      <td className="muted" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.fitness_goals || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {members.length === 0 && <div className="rc-empty">No members found</div>}
            </div>
          </div>

          <div className="report-card">
            <div className="rc-title">Subscription Status Breakdown</div>
            <div className="plan-bars">
              <div className="plan-bar-row">
                <div className="plan-bar-label">Active</div>
                <div className="plan-bar-track">
                  <div className="plan-bar-fill" style={{ width: subscriptions.length ? `${(activeSubs.length / subscriptions.length) * 100}%` : '0%', background: 'var(--success)' }} />
                </div>
                <div className="plan-bar-val">{activeSubs.length}</div>
              </div>
              <div className="plan-bar-row">
                <div className="plan-bar-label">Inactive</div>
                <div className="plan-bar-track">
                  <div className="plan-bar-fill" style={{ width: subscriptions.length ? `${((subscriptions.length - activeSubs.length) / subscriptions.length) * 100}%` : '0%', background: 'var(--warning)' }} />
                </div>
                <div className="plan-bar-val">{subscriptions.length - activeSubs.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TRAINERS TAB ─────────────────────────────────── */}
      {activeTab === 'trainers' && (
        <div className="report-section">
          <div className="report-kpi-grid">
            <KpiCard label="Total Trainers"    value={trainers.length}       sub="Active staff"            color="accent" icon="🏋️" />
            <KpiCard label="Total Assignments" value={assignments.length}    sub="Member-trainer pairs"    color="blue"   icon="🔗" />
            <KpiCard label="Avg Members/Trainer" value={trainerRatio}        sub="Workload ratio"          color="green"  icon="📊" />
            <KpiCard label="Sessions Handled"  value={schedules.length}      sub="All time"                color="orange" icon="📅" />
          </div>

          <div className="report-card">
            <div className="rc-title">Trainer Performance Overview</div>
            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Specialization</th><th>Experience</th><th>Members</th><th>Sessions</th></tr>
                </thead>
                <tbody>
                  {trainerWorkload.map((t) => (
                    <tr key={t.trainer_Id}>
                      <td><span className="id-chip">#{t.trainer_Id}</span></td>
                      <td><strong>{t.username || `Trainer #${t.trainer_Id}`}</strong></td>
                      <td>{t.specialization || '—'}</td>
                      <td className="muted">{t.experience_years != null ? `${t.experience_years} yrs` : '—'}</td>
                      <td>
                        <span style={{ color: 'var(--accent3)', fontWeight: 600 }}>{t.memberCount}</span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>{t.sessionCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trainers.length === 0 && <div className="rc-empty">No trainers found</div>}
            </div>
          </div>

          {trainerWorkload.length > 0 && (
            <div className="report-card">
              <div className="rc-title">Members per Trainer</div>
              <div className="plan-bars">
                {trainerWorkload.map((t) => (
                  <div className="plan-bar-row" key={t.trainer_Id}>
                    <div className="plan-bar-label">{t.username || `T#${t.trainer_Id}`}</div>
                    <div className="plan-bar-track">
                      <div
                        className="plan-bar-fill"
                        style={{
                          width: `${Math.max(4, (t.memberCount / Math.max(...trainerWorkload.map((x) => x.memberCount), 1)) * 100)}%`,
                          background: 'var(--accent3)',
                        }}
                      />
                    </div>
                    <div className="plan-bar-val">{t.memberCount} members</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SESSIONS TAB ─────────────────────────────────── */}
      {activeTab === 'sessions' && (
        <div className="report-section">
          <div className="report-kpi-grid">
            <KpiCard label="Total Sessions"    value={schedules.length}       sub="All scheduled"           color="accent" icon="📅" />
            <KpiCard label="Confirmed"         value={confirmedSess.length}   sub="Approved sessions"       color="green"  icon="✅" />
            <KpiCard label="Pending"           value={pendingSess.length}     sub="Awaiting confirmation"   color="orange" icon="⏳" />
            <KpiCard label="Confirmation Rate" value={schedules.length ? Math.round(confirmedSess.length / schedules.length * 100) + '%' : '—'} sub="Of total sessions" color="blue" icon="📈" />
          </div>

          <div className="report-card">
            <div className="rc-title">Session Log</div>
            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr><th>ID</th><th>Session Name</th><th>Member</th><th>Trainer</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {schedules.slice(0, 20).map((s) => (
                    <tr key={s.scheduleId}>
                      <td><span className="id-chip">#{s.scheduleId}</span></td>
                      <td>{s.session_name || `Session #${s.scheduleId}`}</td>
                      <td className="muted">#{s.memberId}</td>
                      <td className="muted">#{s.trainer_Id}</td>
                      <td className="muted">{formatDate(s.scheduleDate)}</td>
                      <td>
                        <span className={`status-pill status-pill--${s.status === 'Scheduled' ? 'completed' : 'pending'}`}>
                          {s.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {schedules.length === 0 && <div className="rc-empty">No sessions found</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, sub, color, icon }) {
  const colors = {
    accent: 'var(--accent)',
    blue:   'var(--accent3)',
    green:  'var(--success)',
    orange: 'var(--warning)',
  };
  return (
    <div className="report-kpi-card">
      <div className="rkpi-icon" style={{ color: colors[color] }}>{icon}</div>
      <div className="rkpi-value" style={{ color: colors[color] }}>{value ?? '—'}</div>
      <div className="rkpi-label">{label}</div>
      <div className="rkpi-sub">{sub}</div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="stat-row">
      <span className="sr-label">{label}</span>
      <span className="sr-value">{value}</span>
    </div>
  );
}
