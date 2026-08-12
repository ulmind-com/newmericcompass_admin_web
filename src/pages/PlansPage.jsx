import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';

import { adminApi } from '../api/admin';
import Modal from '../components/Modal';
import { Button, Card, Field, Input, Select, Spinner, Textarea } from '../components/ui';

const FEATURES = [
  { value: 'submissions', label: 'Submissions (subscription)' },
  { value: 'analysis', label: 'Analysis screen (one-time)' },
  { value: 'nexus', label: '7D Nexus screen (one-time)' },
];

const BLANK = {
  slug: '', feature: 'submissions', kind: 'subscription', name: '', description: '',
  amount: '', currency: 'INR', duration_days: '', submission_quota: '',
  is_popular: false, is_active: true, order: 0,
};

/** Paise -> rupees for display; the API always speaks paise. */
export const rupees = (paise, currency = 'INR') => {
  const symbol = currency === 'INR' ? '₹' : `${currency} `;
  const whole = (paise || 0) / 100;
  return `${symbol}${whole % 1 === 0 ? whole.toFixed(0) : whole.toFixed(2)}`;
};

const periodOf = (p) => {
  if (p.duration_days == null) return 'Lifetime';
  if (p.duration_days % 365 === 0) return `${p.duration_days / 365} year(s)`;
  if (p.duration_days % 30 === 0) return `${p.duration_days / 30} month(s)`;
  return `${p.duration_days} day(s)`;
};

export default function PlansPage() {
  const [plans, setPlans] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);

  const load = async () => setPlans(await adminApi.listPlans());
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(BLANK); setEditing('new'); };
  const openEdit = (p) => {
    setForm({
      ...BLANK, ...p,
      description: p.description ?? '',
      duration_days: p.duration_days ?? '',
      submission_quota: p.submission_quota ?? '',
      amount: String((p.amount || 0) / 100),
    });
    setEditing(p);
  };

  const save = async () => {
    setBusy(true);
    try {
      // Blank duration or quota is the deliberate "lifetime" / "unlimited"
      // choice, so it goes to the API as null rather than being dropped.
      const payload = {
        slug: form.slug.trim(),
        feature: form.feature,
        kind: form.kind,
        name: form.name.trim(),
        description: form.description?.trim() || null,
        amount: Math.round(Number(form.amount || 0) * 100),
        currency: form.currency || 'INR',
        duration_days: form.duration_days === '' ? null : Number(form.duration_days),
        submission_quota: form.submission_quota === '' ? null : Number(form.submission_quota),
        is_popular: !!form.is_popular,
        is_active: !!form.is_active,
        order: Number(form.order || 0),
      };
      if (editing === 'new') await adminApi.createPlan(payload);
      else {
        const { slug, ...rest } = payload;
        await adminApi.updatePlan(editing.id, rest);
      }
      setEditing(null);
      load();
    } catch (err) {
      alert(err?.response?.data?.detail || 'Save failed');
    } finally { setBusy(false); }
  };

  const remove = async (p) => {
    if (!confirm(`Delete the plan "${p.name}"? Anyone who already bought it keeps their access.`)) return;
    await adminApi.deletePlan(p.id);
    load();
  };

  if (!plans) return <Spinner />;

  const grouped = FEATURES.map((f) => ({ ...f, rows: plans.filter((p) => p.feature === f.value) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Plans & Pricing</h1>
          <p className="text-sm text-ink/60">What the app sells, how long it lasts, and how much it allows.</p>
        </div>
        <Button onClick={openNew}><Plus size={16} /> New plan</Button>
      </div>

      {grouped.map((group) => (
        <Card key={group.value}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">{group.label}</h2>
          {group.rows.length === 0 ? (
            <p className="text-sm italic text-ink/50">No plan yet — this feature cannot be bought.</p>
          ) : (
            <div className="space-y-2">
              {group.rows.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-100 p-3">
                  <div className="min-w-40 flex-1">
                    <div className="flex items-center gap-2 font-semibold text-ink">
                      {p.name}
                      {p.is_popular && <Star size={14} className="text-brand-600" fill="currentColor" />}
                      {!p.is_active && <span className="rounded bg-ink/10 px-1.5 py-0.5 text-[10px] font-semibold text-ink/60">HIDDEN</span>}
                    </div>
                    <div className="text-xs text-ink/50">{p.slug}</div>
                  </div>
                  <div className="text-sm text-ink/70">{periodOf(p)}</div>
                  <div className="text-sm text-ink/70">
                    {p.feature === 'submissions'
                      ? (p.submission_quota == null ? 'Unlimited' : `${p.submission_quota} submissions`)
                      : '—'}
                  </div>
                  <div className="w-24 text-right text-lg font-bold text-brand-700">{rupees(p.amount, p.currency)}</div>
                  <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-ink/60 hover:bg-brand-50"><Pencil size={16} /></button>
                  <button onClick={() => remove(p)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New plan' : `Edit ${form.name}`}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Monthly" /></Field>
          <Field label="Slug" hint={editing === 'new' ? 'Permanent id, e.g. submissions-monthly' : 'Cannot be changed'}>
            <Input value={form.slug} disabled={editing !== 'new'}
              onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="submissions-monthly" />
          </Field>
          <Field label="Feature">
            <Select value={form.feature} onChange={(e) => setForm({ ...form, feature: e.target.value })}>
              {FEATURES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </Select>
          </Field>
          <Field label="Kind">
            <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="subscription">Subscription</option>
              <option value="one_time">One-time</option>
            </Select>
          </Field>
          <Field label="Price (₹)" hint="Stored in paise; enter rupees">
            <Input type="number" min="0" step="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <Field label="Currency"><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></Field>
          <Field label="Duration (days)" hint="Leave blank for lifetime">
            <Input type="number" min="1" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} placeholder="30" />
          </Field>
          <Field label="Submission quota" hint="Leave blank for unlimited">
            <Input type="number" min="1" value={form.submission_quota} onChange={(e) => setForm({ ...form, submission_quota: e.target.value })} placeholder="25" />
          </Field>
        </div>

        <div className="mt-3">
          <Field label="Description" hint="Shown under the plan name in the app">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input type="checkbox" checked={!!form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} />
            Mark as popular
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Visible in the app
          </label>
          <div className="flex items-center gap-2 text-sm text-ink/80">
            Order
            <Input className="w-20" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={save} disabled={busy || !form.name || !form.slug}>{busy ? 'Saving…' : 'Save plan'}</Button>
        </div>
      </Modal>
    </div>
  );
}
