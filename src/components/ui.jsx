import React from 'react';

export function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'text-white brand-gradient shadow-sm hover:shadow-md hover:brightness-105',
    ghost: 'text-brand-700 hover:bg-brand-50',
    outline: 'border border-brand-200 text-brand-700 hover:bg-brand-50',
    danger: 'text-white bg-red-500 hover:bg-red-600 shadow-sm',
    subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Card({ className = '', children }) {
  return (
    <div className={`rounded-2xl bg-white/90 backdrop-blur border border-brand-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-ink/80">{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-brand-100 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-200';

export function Input({ className = '', ...props }) {
  return <input className={`${inputCls} ${className}`} {...props} />;
}
export function Textarea({ className = '', ...props }) {
  return <textarea className={`${inputCls} ${className}`} {...props} />;
}
export function Select({ className = '', children, ...props }) {
  return <select className={`${inputCls} ${className}`} {...props}>{children}</select>;
}

const verdictStyles = {
  excellent: 'bg-hgreen/10 text-hgreen',
  good: 'bg-emerald-100 text-emerald-700',
  average: 'bg-amber-100 text-amber-700',
  bad: 'bg-red-100 text-red-700',
};

export function VerdictBadge({ verdict }) {
  const v = (verdict || 'average').toLowerCase();
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${verdictStyles[v] || verdictStyles.average}`}>
      {v}
    </span>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex h-64 items-center justify-center gap-3 text-ink/50">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" />
      {label}
    </div>
  );
}
