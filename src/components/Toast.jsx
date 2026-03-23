import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideToast } from '../actions';
import './Toast.css';

const ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

function ToastItem({ toast }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const t = setTimeout(() => dispatch(hideToast(toast.id)), 4000);
    return () => clearTimeout(t);
  }, [toast.id, dispatch]);

  return (
    <div className={`toast toast--${toast.type}`}>
      <span className="toast-icon">{ICONS[toast.type] || 'ℹ'}</span>
      <span className="toast-msg">{toast.message}</span>
      <button className="toast-close" onClick={() => dispatch(hideToast(toast.id))}>✕</button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useSelector((s) => s.ui.toasts);
  return (
    <div className="toast-container">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}
