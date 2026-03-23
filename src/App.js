import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store';
import { restoreSession } from './actions';
import { ROLES } from './constants';

import AdminLayout      from './components/admin/AdminLayout';
import Login            from './pages/Login';
import Dashboard        from './pages/Dashboard';
import MemberDashboard  from './pages/MemberDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import Users            from './pages/Users';
import Members          from './pages/Members';
import Trainers         from './pages/Trainers';
import Assignments      from './pages/Assignments';
import Timeslots        from './pages/Timeslots';
import Schedules        from './pages/Schedules';
import Workouts         from './pages/Workouts';
import Plans            from './pages/Plans';
import Subscriptions    from './pages/Subscriptions';
import Payments         from './pages/Payments';
import RFID             from './pages/RFID';
import Reports          from './pages/Reports';
import Equipment        from './pages/Equipment';
import './assets/global.css';

function ProtectedRoute({ children, allowedRoles }) {
  const user = useSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.roleId)) return <Navigate to="/dashboard" replace />;
  return children;
}

function RoleDashboard() {
  const user = useSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.roleId === ROLES.MEMBER)  return <MemberDashboard />;
  if (user.roleId === ROLES.TRAINER) return <TrainerDashboard />;
  return <Dashboard />;
}

function AppRoutes() {
  const dispatch = useDispatch();
  const user  = useSelector((s) => s.auth.user);
  const theme = useSelector((s) => s.ui.theme);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<RoleDashboard />} />

          {/* Admin only */}
          <Route path="users"    element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><Users /></ProtectedRoute>} />
          <Route path="members"  element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><Members /></ProtectedRoute>} />
          <Route path="trainers" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><Trainers /></ProtectedRoute>} />
          <Route path="assignments" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><Assignments /></ProtectedRoute>} />
          <Route path="plans"    element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><Plans /></ProtectedRoute>} />
          <Route path="subscriptions" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><Subscriptions /></ProtectedRoute>} />
          <Route path="payments" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><Payments /></ProtectedRoute>} />
          <Route path="rfid"     element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><RFID /></ProtectedRoute>} />
          <Route path="reports"  element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><Reports /></ProtectedRoute>} />

          {/* Admin + Trainer */}
          <Route path="timeslots" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TRAINER]}><Timeslots /></ProtectedRoute>} />
          <Route path="schedules" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TRAINER, ROLES.MEMBER]}><Schedules /></ProtectedRoute>} />
          <Route path="workouts"  element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TRAINER, ROLES.MEMBER]}><Workouts /></ProtectedRoute>} />

          {/* All roles: Equipment / Live Tracking */}
          <Route path="equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}
