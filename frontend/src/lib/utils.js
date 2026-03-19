import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format currency in INR
export function formatCurrency(amount, options = {}) {
  const { compact = false, showSign = false } = options;
  
  if (amount === null || amount === undefined) return '₹0';
  
  const sign = showSign && amount > 0 ? '+' : '';
  
  if (compact && Math.abs(amount) >= 100000) {
    if (Math.abs(amount) >= 10000000) {
      return `${sign}₹${(amount / 10000000).toFixed(2)}Cr`;
    }
    return `${sign}₹${(amount / 100000).toFixed(2)}L`;
  }
  
  return `${sign}₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

// Format percentage
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
}

// Format date
export function formatDate(dateString, options = {}) {
  const { format = 'short' } = options;
  
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  if (format === 'relative') {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return formatDate(dateString, { format: 'short' });
  }
  
  return date.toLocaleDateString('en-IN');
}

// Get status color class
export function getStatusColor(status) {
  const statusMap = {
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    verified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cleared: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    in_process: 'bg-blue-100 text-blue-800 border-blue-200',
    pending_kyb: 'bg-amber-100 text-amber-800 border-amber-200',
    not_submitted: 'bg-slate-100 text-slate-800 border-slate-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    expired: 'bg-red-100 text-red-800 border-red-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    suspended: 'bg-red-100 text-red-800 border-red-200',
    blocked: 'bg-red-100 text-red-800 border-red-200',
    partial: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-slate-100 text-slate-800 border-slate-200',
    inactive: 'bg-slate-100 text-slate-800 border-slate-200',
    reviewed: 'bg-slate-100 text-slate-800 border-slate-200',
  };
  
  return statusMap[status?.toLowerCase()] || 'bg-slate-100 text-slate-800 border-slate-200';
}

// Get severity color class
export function getSeverityColor(severity) {
  const severityMap = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  
  return severityMap[severity?.toLowerCase()] || 'bg-slate-100 text-slate-800 border-slate-200';
}

// Truncate text
export function truncate(text, length = 20) {
  if (!text) return '';
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

// Generate initials from name
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
