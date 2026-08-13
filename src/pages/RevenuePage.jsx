import { useEffect, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';

import { adminApi } from '../api/admin';
import Modal from '../components/Modal';
import { Button, Card, Input, Select, Spinner } from '../components/ui';
import { rupees } from './PlansPage';

const FEATURE_LABEL = {
  submissions: 'Submissions',
  analysis: '16 Zone Analysis',
  nexus: '7D Nexus',
};

const when = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</div>
      <div className="mt-1 text-2xl font-bold text-ink">{value}</div>
      {sub && <div className="text-xs text-ink/50">{sub}</div>}
    </div>
  );
}

function Bar({ label, amount, max, count }) {
  const pct = max > 0 ? Math.round((amount / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-ink/80">{label}</span>
        <span className="font-semibold text-ink">{rupees(amount)} <span className="text-xs font-normal text-ink/50">· {count}</span></span>
      </div>
      <div className="h-2 rounded-full bg-brand-50">
        <div className="h-2 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/**
 * Every rupee that came in, and where from.
 *
 * Only verified payments are listed — an abandoned checkout never reaches this
 * page, so the totals here are money actually received.
 */
export default function RevenuePage() {
  const [report, setReport] = useState(null);
  const [payments, setPayments] = useState(null);
  const [feature, setFeature] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  const load = async () => {
    const [r, p] = await Promise.all([
      adminApi.revenue(),
      adminApi.listPayments(feature ? { feature } : {}),
    ]);
    setReport(r);
    setPayments(p);
  };
  useEffect(() => { load(); }, [feature]);

  if (!report || !payments) return <Spinner />;

  const rows = payments.filter((p) => {
    if (!q.trim()) return true;
    const hay = `${p.user_email} ${p.user_name || ''} ${p.razorpay_payment_id} ${p.razorpay_order_id} ${p.plan_name}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  const maxFeature = Math.max(1, ...report.by_feature.map((b) => b.amount));
  const maxPlan = Math.max(1, ...report.by_plan.map((b) => b.amount));
  const maxMonth = Math.max(1, ...report.by_month.map((b) => b.amount));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Revenue</h1>
        <p className="text-sm text-ink/60">Verified payments only — abandoned checkouts are never recorded.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total earned" value={rupees(report.total_amount)} sub={`${report.total_payments} payments`} />
        <Stat label="Last 24 hours" value={rupees(report.today_amount)} />
        <Stat label="This month" value={rupees(report.month_amount)} />
        <Stat label="Paying users" value={report.paying_users} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">By feature</h2>
          <div className="space-y-3">
            {report.by_feature.length === 0 ? <p className="text-sm italic text-ink/50">Nothing yet.</p>
              : report.by_feature.map((b) => (
                <Bar key={b.key} label={FEATURE_LABEL[b.key] || b.key} amount={b.amount} count={b.count} max={maxFeature} />
              ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">By plan</h2>
          <div className="space-y-3">
            {report.by_plan.length === 0 ? <p className="text-sm italic text-ink/50">Nothing yet.</p>
              : report.by_plan.map((b) => (
                <Bar key={b.key} label={b.label || b.key} amount={b.amount} count={b.count} max={maxPlan} />
              ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">By month</h2>
          <div className="space-y-3">
            {report.by_month.length === 0 ? <p className="text-sm italic text-ink/50">Nothing yet.</p>
              : report.by_month.map((b) => (
                <Bar key={b.key} label={b.key} amount={b.amount} count={b.count} max={maxMonth} />
              ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">Transactions</h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
              <Input className="pl-8" placeholder="Email, name or payment id" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={feature} onChange={(e) => setFeature(e.target.value)}>
              <option value="">All features</option>
              {Object.entries(FEATURE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm italic text-ink/50">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Plan</th>
                  <th className="py-2 pr-3">Method</th>
                  <th className="py-2 pr-3 text-right">Amount</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-brand-50 last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap text-ink/70">{when(p.created_at)}</td>
                    <td className="py-2 pr-3">
                      <div className="font-medium text-ink">{p.user_name || '—'}</div>
                      <div className="text-xs text-ink/50">{p.user_email}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="text-ink">{p.plan_name}</div>
                      <div className="text-xs text-ink/50">{FEATURE_LABEL[p.feature] || p.feature}</div>
                    </td>
                    <td className="py-2 pr-3 uppercase text-xs text-ink/60">{p.method || '—'}</td>
                    <td className="py-2 pr-3 text-right font-semibold text-brand-700">{rupees(p.amount, p.currency)}</td>
                    <td className="py-2 text-right">
                      <Button variant="ghost" onClick={() => setOpen(p)}>Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!open} onClose={() => setOpen(null)} title="Payment details">
        {open && (
          <div className="space-y-3 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <Detail label="Amount" value={`${rupees(open.amount, open.currency)} ${open.currency}`} />
              <Detail label="Status" value={open.status} />
              <Detail label="Paid at" value={when(open.created_at)} />
              <Detail label="Method" value={open.method || '—'} />
              <Detail label="User" value={`${open.user_name || '—'} · ${open.user_email}`} />
              <Detail label="Contact" value={open.user_contact || '—'} />
              <Detail label="Plan" value={`${open.plan_name} (${open.plan_slug})`} />
              <Detail label="Feature" value={FEATURE_LABEL[open.feature] || open.feature} />
            </div>

            <div className="rounded-xl border border-brand-100 p-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/50">Razorpay</div>
              <Detail label="Payment id" value={open.razorpay_payment_id} mono />
              <Detail label="Order id" value={open.razorpay_order_id} mono />
              <Detail label="Signature" value={open.razorpay_signature} mono />
              <a className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
                href={`https://dashboard.razorpay.com/app/payments/${open.razorpay_payment_id}`}
                target="_blank" rel="noreferrer">
                Open in Razorpay <ExternalLink size={14} />
              </a>
            </div>

            {open.razorpay_raw && (
              <details className="rounded-xl border border-brand-100 p-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-ink/50">
                  Full Razorpay response
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-ink/5 p-2 text-[11px] leading-relaxed">
                  {JSON.stringify(open.razorpay_raw, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2 py-0.5">
      <span className="text-xs uppercase tracking-wide text-ink/45">{label}</span>
      <span className={`text-ink ${mono ? 'font-mono text-xs break-all' : ''}`}>{value || '—'}</span>
    </div>
  );
}
