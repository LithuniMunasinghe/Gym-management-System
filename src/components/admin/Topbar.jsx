import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setTheme } from '../../actions';
import './Topbar.css';

const ROUTE_TITLES = {
  '/dashboard':    'Dashboard',
  '/reports':      'Reports & Analytics',
  '/users':        'System Users',
  '/members':      'Members',
  '/trainers':     'Trainers',
  '/assignments':  'Trainer Assignments',
  '/timeslots':    'Time Slots',
  '/schedules':    'Schedules',
  '/workouts':     'Workout Sessions',
  '/plans':        'Membership Plans',
  '/subscriptions':'Subscriptions',
  '/payments':     'Payments',
  '/rfid':         'RFID Attendance',
  '/equipment':    'Equipment',
};

export default function Topbar() {
  const user  = useSelector((s) => s.auth.user);
  const theme = useSelector((s) => s.ui.theme);
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const title = ROUTE_TITLES[pathname] || 'DTS Gym';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const roleColor =
    user?.roleId === 1 ? 'var(--accent)' :
    user?.roleId === 2 ? 'var(--accent3)' : 'var(--success)';

  const toggleTheme = () => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">{title}</div>
        <div className="topbar-date">{today}</div>
      </div>
      <div className="topbar-right">
        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <div className="topbar-user">
          <div className="topbar-avatar" style={{ background: roleColor, color: '#000' }}>
            {(user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="topbar-info">
            <span className="topbar-name">{user?.username || 'User'}</span>
            <span className="topbar-role" style={{ color: roleColor }}>{user?.roleName || 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function SunIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>;
}
function MoonIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>;
}
