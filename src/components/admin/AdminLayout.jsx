import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ToastContainer from '../Toast';
import './AdminLayout.css';

export default function AdminLayout() {
  const theme = useSelector((s) => s.ui.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="admin-layout" data-theme={theme}>
      <Sidebar />
      <div className="admin-main">
        <Topbar />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
