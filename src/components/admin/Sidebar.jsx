import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../actions';
import { ROLES } from '../../constants';
import './Sidebar.css';

const NAV_ADMIN = [
  { section: 'Overview', items: [
    { to: '/dashboard', label: 'Dashboard',   icon: <GridIcon /> },
    { to: '/reports',   label: 'Reports',     icon: <ChartIcon /> },
  ]},
  { section: 'People', items: [
    { to: '/users',       label: 'Users',       icon: <UserIcon /> },
    { to: '/members',     label: 'Members',     icon: <UsersIcon /> },
    { to: '/trainers',    label: 'Trainers',    icon: <TrainerIcon /> },
    { to: '/assignments', label: 'Assignments', icon: <LinkIcon /> },
  ]},
  { section: 'Sessions', items: [
    { to: '/timeslots', label: 'Time Slots', icon: <ClockIcon /> },
    { to: '/schedules', label: 'Schedules',  icon: <CalIcon /> },
    { to: '/workouts',  label: 'Workouts',   icon: <DumbIcon /> },
  ]},
  { section: 'Billing', items: [
    { to: '/plans',         label: 'Plans',         icon: <LayersIcon /> },
    { to: '/subscriptions', label: 'Subscriptions', icon: <CardIcon /> },
    { to: '/payments',      label: 'Payments',      icon: <DollarIcon /> },
  ]},
  { section: 'System', items: [
    { to: '/rfid',      label: 'RFID Attendance', icon: <RfidIcon /> },
    { to: '/equipment', label: 'Equipment',       icon: <GearIcon /> },
  ]},
];

const NAV_TRAINER = [
  { section: 'Overview', items: [
    { to: '/dashboard', label: 'Dashboard', icon: <GridIcon /> },
  ]},
  { section: 'My Work', items: [
    { to: '/timeslots', label: 'Time Slots', icon: <ClockIcon /> },
    { to: '/schedules', label: 'Sessions',   icon: <CalIcon /> },
    { to: '/workouts',  label: 'Workouts',   icon: <DumbIcon /> },
  ]},
  { section: 'Equipment', items: [
    { to: '/equipment', label: 'Equipment Live', icon: <GearIcon /> },
  ]},
];

const NAV_MEMBER = [
  { section: 'Overview', items: [
    { to: '/dashboard', label: 'Dashboard', icon: <GridIcon /> },
  ]},
  { section: 'My Gym', items: [
    { to: '/schedules',  label: 'My Sessions',  icon: <CalIcon /> },
    { to: '/workouts',   label: 'My Workouts',  icon: <DumbIcon /> },
    { to: '/equipment',  label: 'Live Floor',   icon: <GearIcon /> },
  ]},
];

export default function Sidebar() {
  const user     = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navGroups =
    user?.roleId === ROLES.ADMIN   ? NAV_ADMIN :
    user?.roleId === ROLES.TRAINER ? NAV_TRAINER :
    NAV_MEMBER;

  const roleLabel =
    user?.roleId === ROLES.ADMIN   ? 'Administrator' :
    user?.roleId === ROLES.TRAINER ? 'Trainer' : 'Member';

  const roleColor =
    user?.roleId === ROLES.ADMIN   ? 'var(--accent)' :
    user?.roleId === ROLES.TRAINER ? 'var(--accent3)' : 'var(--success)';

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-dumbbell">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
            <rect x="3" y="11" width="5" height="10" rx="2" fill="currentColor" opacity="0.9"/>
            <rect x="1"  y="9"  width="3" height="14" rx="1.5" fill="currentColor"/>
            <rect x="24" y="11" width="5" height="10" rx="2" fill="currentColor" opacity="0.9"/>
            <rect x="28" y="9"  width="3" height="14" rx="1.5" fill="currentColor"/>
            <rect x="8"  y="14" width="16" height="4" rx="2" fill="currentColor" opacity="0.7"/>
          </svg>
        </div>
        <div>
          <div className="logo-mark">DTS GYM</div>
          <div className="logo-sub">Management Portal</div>
        </div>
      </div>

      <div className="sidebar-status">
        <div className="status-dot" style={{ background: roleColor, boxShadow: `0 0 8px ${roleColor}` }} />
        <span style={{ color: roleColor }}>{roleLabel} Active</span>
      </div>

      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.section}>
            <div className="nav-section">{group.section}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-card">
          <div className="admin-avatar" style={{ background: roleColor }}>
            {(user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="admin-name" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.username || 'User'}
            </div>
            <div className="admin-role" style={{ color: roleColor }}>{roleLabel}</div>
          </div>
          <button onClick={handleLogout} title="Sign out"
            style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', padding:4, display:'flex', alignItems:'center' }}>
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}

function GridIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>; }
function ChartIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function UserIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function UsersIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>; }
function TrainerIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>; }
function LinkIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>; }
function ClockIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>; }
function CalIcon()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function DumbIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4M6 9h12M6 15h12"/></svg>; }
function LayersIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>; }
function CardIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>; }
function DollarIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>; }
function RfidIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L6 7h12l-2-4z"/></svg>; }
function GearIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
function LogoutIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
