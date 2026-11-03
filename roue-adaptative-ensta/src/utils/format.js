import projectData from '../config/projectData.js';

const { locale, currency } = projectData.meta;

export const fmtNumber = (n, decimals = 0) =>
  Number.isFinite(n)
    ? new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n)
    : '—';

export const fmtMoney = (n, decimals = 0) =>
  Number.isFinite(n)
    ? new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(n)
    : '—';

export const fmtCompactMoney = (n) =>
  Number.isFinite(n)
    ? new Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(n)
    : '—';

export const fmtPct = (n, decimals = 0) => (Number.isFinite(n) ? `${fmtNumber(n, decimals)} %` : '—');

export const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' });
};

export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

