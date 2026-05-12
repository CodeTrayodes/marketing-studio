import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n, decimals = 0) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toFixed(decimals);
}

export function formatCurrency(n) {
  if (n >= 1000000) return `£${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`;
  return `£${n.toLocaleString()}`;
}

export function formatPercent(n, decimals = 1) {
  return `${n.toFixed(decimals)}%`;
}

export function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'text-ink-muted', bg: 'bg-surface-muted dark:bg-dark-border', border: 'border-border' },
  'qa-review': { label: 'QA Review', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200' },
  'gate-2-pending': { label: 'Gate 2 Pending', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200' },
  'gate-3-pending': { label: 'Gate 3 Pending', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200' },
  approved: { label: 'Approved', color: 'text-brand-green', bg: 'bg-brand-green-light dark:bg-green-900/20', border: 'border-green-200' },
  published: { label: 'Published', color: 'text-brand-green-dark', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300' },
  error: { label: 'Error', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200' },
};

export const LAYER_COLORS = {
  1: { bg: 'bg-blue-500', text: 'text-white', label: 'Layer 1', hex: '#2563EB' },
  2: { bg: 'bg-brand-green', text: 'text-white', label: 'Layer 2', hex: '#16A34A' },
  3: { bg: 'bg-violet-600', text: 'text-white', label: 'Layer 3', hex: '#7C3AED' },
  4: { bg: 'bg-cyan-600', text: 'text-white', label: 'Layer 4', hex: '#0891B2' },
};

export function qualityColor(score) {
  if (score >= 90) return 'text-brand-green';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-amber-600';
  return 'text-red-500';
}

export function qualityBg(score) {
  if (score >= 90) return 'bg-green-50 dark:bg-green-900/20';
  if (score >= 80) return 'bg-blue-50 dark:bg-blue-900/20';
  if (score >= 70) return 'bg-amber-50 dark:bg-amber-900/20';
  return 'bg-red-50 dark:bg-red-900/20';
}
