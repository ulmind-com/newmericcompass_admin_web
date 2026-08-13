import { useEffect, useState } from 'react';
import { Gift, RotateCcw, Search, ShieldOff } from 'lucide-react';

import { adminApi } from '../api/admin';
import Modal from '../components/Modal';
import { Button, Card, Field, Input, Select, Spinner } from '../components/ui';

const FEATURES = [
  { value: 'submissions', label: 'Submissions' },
  { value: 'analysis', label: '16 Zone Analysis' },
  { value: 'nexus', label: '7D Nexus screen' },
];
const LABEL = Object.fromEntries(FEATURES.map((f) => [f.value, f.label]));

const when = (iso) => (iso ? new Date(iso).toLocaleDateString() : null);
const isLive = (e) => e.is_active && (!e.expires_at || new Date(e.expires_at) > new Date());

const BLANK = { email: '', feature: 'submissions', duration_days: '', submission_quota: '', note: '' };

/**
 * Who can use what, and the lever to hand it out for free.
 *
 * A grant here is indistinguishable from a purchase as far as the app is
 * concerned — it just never shows up in revenue.
 */
export default function AccessPage() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [granting, setGranting] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);

  const load = async () => setRows(await adminApi.listEntitlements());
  useEffect(() => { load(); }, []);

  const grant = async () => {
    if (!form.email.trim()) return alert('An email is required.');
    setBusy(true);
    try {
      await adminApi.grantAccess({
        email: form.email.trim(),
        feature: form.feature,
        duration_days: form.duration_days === '' ? null : Number(form.duration_days),
        submission_quota: form.submission_quota === '' ? null : Number(form.submission_quota),
        note: form.note.trim() || null,
      });
      setGranting(false);
      setForm(BLANK);
      load();
    } catch (err) {
      alert(err?.response?.data?.detail || 'Could not grant access');
    } finally { setBusy(false); }
  };

  const revoke = async (e) => {
    if (!confirm(`Revoke ${LABEL[e.feature] || e.feature} for ${e.user_email}?`)) return;
    await adminApi.revokeAccess(e.id);
    load();
  };

  const reset = async (e) => {
    if (!confirm(`Reset the used quota for ${e.user_email}?`)) return;
    await adminApi.resetQuota(e.id);
    load();
  };

  if (!rows) return <Spinner />;

  const filtered = rows.filter((e) => !q.trim() || e.user_email.includes(q.trim().toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Access</h1>
          <p className="text-sm text-ink/60">Everything a user has unlocked — bought or given.</p>
        </div>
        <Button onClick={() => setGranting(true)}><Gift size={16} /> Give free access</Button>
      </div>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <Input className="pl-8" placeholder="Filter by email" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm italic text-ink/50">Nobody has access yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Feature</th>
                  <th className="py-2 pr-3">Source</th>
                  <th className="py-2 pr-3">Expires</th>
                  <th className="py-2 pr-3">Quota</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-brand-50 last:border-0">
                    <td className="py-2 pr-3 text-ink">{e.user_email}</td>
                    <td className="py-2 pr-3">
                      <div className="text-ink">{LABEL[e.feature] || e.feature}</div>
                      {e.plan_name && <div className="text-xs text-ink/50">{e.plan_name}</div>}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                        e.source === 'admin' ? 'bg-brand-100 text-brand-700' : 'bg-green-100 text-green-700'}`}>
                        {e.source === 'admin' ? 'Free' : 'Paid'}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-ink/70">
                      {!e.is_active ? <span className="text-red-500">Revoked</span>
                        : e.expires_at ? (isLive(e) ? when(e.expires_at) : <span className="text-red-500">Expired</span>)
                        : 'Lifetime'}
                    </td>
                    <td className="py-2 pr-3 text-ink/70">
                      {e.quota_total == null ? 'Unlimited' : `${e.quota_used} / ${e.quota_total}`}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
                      {e.quota_total != null && (
                        <button onClick={() => reset(e)} title="Reset used quota"
                          className="rounded-lg p-2 text-ink/60 hover:bg-brand-50"><RotateCcw size={16} /></button>
                      )}
                      {e.is_active && (
                        <button onClick={() => revoke(e)} title="Revoke access"
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"><ShieldOff size={16} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={granting} onClose={() => setGranting(false)} title="Give free access">
        <p className="mb-3 text-sm text-ink/60">
          The user gets the feature without paying. Granting again extends what they already have
          rather than replacing it.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="User email">
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" />
          </Field>
          <Field label="Feature">
            <Select value={form.feature} onChange={(e) => setForm({ ...form, feature: e.target.value })}>
              {FEATURES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </Select>
          </Field>
          <Field label="Duration (days)" hint="Leave blank for lifetime">
            <Input type="number" min="1" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} />
          </Field>
          <Field label="Submission quota" hint="Leave blank for unlimited">
            <Input type="number" min="1" value={form.submission_quota} onChange={(e) => setForm({ ...form, submission_quota: e.target.value })} />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Note" hint="Why — shown only here">
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Beta tester" />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setGranting(false)}>Cancel</Button>
          <Button onClick={grant} disabled={busy}>{busy ? 'Granting…' : 'Grant access'}</Button>
        </div>
      </Modal>
    </div>
  );
}
