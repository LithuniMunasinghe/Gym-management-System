import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../actions';
import './Login.css';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const theme = useSelector((s) => s.ui.theme);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form.email, form.password));
  };

  return (
    <div className="login-root">
      <div className="login-bg">
        <div className="bg-orb bg-orb--1" />
        <div className="bg-orb bg-orb--2" />
        <div className="bg-orb bg-orb--3" />
        <div className="bg-grid" />
      </div>

      {/* Left brand panel */}
      <div className="login-brand">
        <div className="brand-content">
          <div className="brand-logo-wrap">
            <div className="brand-logo-icon"><DumbellIcon /></div>
          </div>
          <div className="brand-name">DTS GYM</div>
          <div className="brand-tagline">Elite Fitness Management System</div>
          <div className="brand-features">
            {['Member & Trainer Management', 'Smart Workout Scheduling', 'Cash & Card Payments', 'RFID Live Tracking', 'Equipment Floor Monitor'].map((f) => (
              <div className="brand-feature" key={f}>
                <span className="feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="brand-bottom">
          <div className="brand-stat"><div className="bs-num">3</div><div className="bs-lbl">User Roles</div></div>
          <div className="brand-stat-div" />
          <div className="brand-stat"><div className="bs-num">24/7</div><div className="bs-lbl">Access</div></div>
          <div className="brand-stat-div" />
          <div className="brand-stat"><div className="bs-num">RFID</div><div className="bs-lbl">Live Track</div></div>
        </div>
      </div>

      {/* Right login form */}
      <div className="login-panel">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-icon"><LockIcon /></div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-sub">Sign in to DTS Gym Management Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* CHANGED: email field instead of username */}
            <div className="login-field">
              <label className="login-label">Email Address</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><MailIcon /></span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="login-input"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><LockSmIcon /></span>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="login-input"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="login-eye" onClick={() => setShowPass((p) => !p)} tabIndex={-1}>
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="login-spinner" /> : <><span>Sign In</span><ArrowIcon /></>}
            </button>
          </form>

          <div className="login-roles">
            <div className="roles-label">Access Levels</div>
            <div className="roles-grid">
              <div className="role-chip role-chip--admin">Admin</div>
              <div className="role-chip role-chip--trainer">Trainer</div>
              <div className="role-chip role-chip--member">Member</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DumbellIcon() {
  return <svg viewBox="0 0 40 40" fill="none"><rect x="4" y="15" width="6" height="10" rx="2" fill="currentColor" opacity="0.9"/><rect x="2" y="13" width="4" height="14" rx="2" fill="currentColor"/><rect x="30" y="15" width="6" height="10" rx="2" fill="currentColor" opacity="0.9"/><rect x="34" y="13" width="4" height="14" rx="2" fill="currentColor"/><rect x="10" y="18" width="20" height="4" rx="2" fill="currentColor" opacity="0.7"/></svg>;
}
function MailIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function LockIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>; }
function LockSmIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>; }
function EyeIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EyeOffIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>; }
function ArrowIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>; }
