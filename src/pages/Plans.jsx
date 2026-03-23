import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlans } from '../actions';
import Badge from '../components/Badge';
import './Plans.css';

export default function Plans() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.plans);

  useEffect(() => { dispatch(fetchPlans()); }, [dispatch]);

  const featured = data.find((p) => p.planType === 'Yearly');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">Membership Plans</div>
          <div className="section-sub">{data.length} plans available</div>
        </div>
        <button className="btn btn--secondary" onClick={() => dispatch(fetchPlans())}>↺ Refresh</button>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading plans...</div>
      ) : data.length === 0 ? (
        <div style={{ padding: '56px', textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 10, opacity: .4 }}>📋</div>
          <div>No plans found</div>
        </div>
      ) : (
        <div className="plans-grid">
          {data.map((p) => (
            <div className={`plan-card${p === featured ? ' plan-card--featured' : ''}`} key={p.planId}>
              {p === featured && <div className="plan-badge">POPULAR</div>}
              <div className="plan-type">{p.planType}</div>
              <div className="plan-price">LKR {parseFloat(p.price || 0).toFixed(2)}</div>
              <div className="plan-price-note">per plan</div>
              <div className="plan-duration">📅 {p.duration_days} days</div>
              <div style={{ marginTop: 16 }}>
                <Badge variant={(p.planType || '').toLowerCase()}>{p.planType}</Badge>
              </div>
              <div className="plan-id">Plan ID: {p.planId}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
