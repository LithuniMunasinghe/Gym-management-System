export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.substring(0, 10);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr.substring(0, 10); }
};

export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return 'LKR ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const sumBy = (arr, key) =>
  (arr || []).reduce((acc, item) => acc + (parseFloat(item[key]) || 0), 0);

export const isSuccess = (res) =>
  res && (res.StatusCode === 200 || res.Success === true || res.success === true);

export const getErrorMsg = (res) =>
  res?.Message || res?.message || 'An error occurred';

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2);

export const uid = () => Math.random().toString(36).substring(2, 9);
