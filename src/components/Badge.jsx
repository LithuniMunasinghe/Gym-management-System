import React from 'react';
import './Badge.css';

const VARIANTS = {
  active:      { bg: 'rgba(71,255,154,.12)',  color: '#47ff9a', border: 'rgba(71,255,154,.25)' },
  inactive:    { bg: 'rgba(107,107,128,.12)', color: '#6b6b80', border: 'rgba(107,107,128,.25)' },
  confirmed:   { bg: 'rgba(71,255,154,.12)',  color: '#47ff9a', border: 'rgba(71,255,154,.25)' },
  pending:     { bg: 'rgba(255,179,71,.12)',  color: '#ffb347', border: 'rgba(255,179,71,.25)' },
  inprogress:  { bg: 'rgba(71,200,255,.12)',  color: '#47c8ff', border: 'rgba(71,200,255,.25)' },
  completed:   { bg: 'rgba(71,255,154,.12)',  color: '#47ff9a', border: 'rgba(71,255,154,.25)' },
  refunded:    { bg: 'rgba(255,71,71,.12)',   color: '#ff4747', border: 'rgba(255,71,71,.25)' },
  cancelled:   { bg: 'rgba(255,71,71,.12)',   color: '#ff4747', border: 'rgba(255,71,71,.25)' },
  admin:       { bg: 'rgba(232,255,71,.12)',  color: '#e8ff47', border: 'rgba(232,255,71,.25)' },
  trainer:     { bg: 'rgba(71,200,255,.12)',  color: '#47c8ff', border: 'rgba(71,200,255,.25)' },
  member:      { bg: 'rgba(71,255,154,.12)',  color: '#47ff9a', border: 'rgba(71,255,154,.25)' },
};

export default function Badge({ variant = 'inactive', children, style }) {
  const v = VARIANTS[variant] || VARIANTS.inactive;
  return (
    <span className="badge" style={{
      background: v.bg,
      color: v.color,
      border: `1px solid ${v.border}`,
      ...style,
    }}>
      {children}
    </span>
  );
}
