import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';

import { adminApi } from '../api/admin';
import Modal from '../components/Modal';
import { Button, Card, Field, Input, Select, Spinner, Textarea } from '../components/ui';

const FEATURES = [
  { value: 'submissions', label: 'Submissions (subscription)' },
  { value: 'analysis', label: '16 Zone Analysis (one-time)' },
  { value: 'nexus', label: '7D Nexus screen (one-time)' },
  { value: 'vastu_analysis', label: 'Integrated Vastu Space & Environment Analysis' },
];

/** Everything a plan opens. Older plans carry only `feature`. */
const featuresOf = (p) => (p.features?.length ? p.features : p.feature ? [p.feature] : []);
const labelOf = (v) => FEATURES.find((f) => f.value === v)?.label ?? v;

const BLANK = {
  slug: '', feature: 'submissions', features: ['submissions'], kind: 'subscription', name: '', description: '',
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
      // An older plan has no list; open it showing the one feature it grants.
      features: featuresOf(p),
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
        // What the plan opens. The primary feature is always included, so a
        // plan can never be saved granting nothing.
        features: Array.from(new Set([form.feature, ...(form.features || [])])),
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

  // A bundle opens several screens, so it belongs under each of them: the
  // owner looking at "7D Nexus" should see every plan that sells it, not only
  // the ones filed under it.
  const grouped = FEATURES.map((f) => ({
    ...f,
    rows: plans.filter((p) => featuresOf(p).includes(f.value)),
  }));

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
                    {featuresOf(p).length > 1 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {featuresOf(p).map((f) => (
                          <span key={f} className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
                            {labelOf(f)}
                          </span>
                        ))}
                      </div>
                    )}
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
          <Field label="Feature" hint="Which list the plan is filed under">
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
          <Field label="Duration" hint={form.duration_days === '' ? 'Lifetime — access never expires' : 'How many days access lasts'}>
            <div className="flex items-center gap-3">
              <Input className="flex-1" type="number" min="1" disabled={form.duration_days === ''}
                value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} placeholder="30" />
              <label className="flex select-none items-center gap-1.5 whitespace-nowrap text-sm text-ink/80">
                <input type="checkbox" checked={form.duration_days === ''}
                  onChange={(e) => setForm({ ...form, duration_days: e.target.checked ? '' : '30' })} />
                ♾️ Lifetime
              </label>
            </div>
          </Field>
          <Field label="Submission quota" hint={form.feature !== 'submissions' ? 'Only used by subscription plans' : (form.submission_quota === '' ? 'Unlimited submissions' : 'How many reports it allows')}>
            <div className="flex items-center gap-3">
              <Input className="flex-1" type="number" min="1" disabled={form.submission_quota === ''}
                value={form.submission_quota} onChange={(e) => setForm({ ...form, submission_quota: e.target.value })} placeholder="25" />
              <label className="flex select-none items-center gap-1.5 whitespace-nowrap text-sm text-ink/80">
                <input type="checkbox" checked={form.submission_quota === ''}
                  onChange={(e) => setForm({ ...form, submission_quota: e.target.checked ? '' : '25' })} />
                Unlimited
              </label>
            </div>
          </Field>

          {/* What one payment opens. Tick more than one and the plan is a
              bundle: every ticked screen is unlocked by the single purchase,
              and unticking one later stops it being included in new sales. */}
          <div className="sm:col-span-2">
            <Field label="What this plan unlocks" hint="Tick every screen the purchase should open">
              <div className="grid gap-2 sm:grid-cols-2">
                {FEATURES.map((f) => {
                  const on = f.value === form.feature || (form.features || []).includes(f.value);
                  const locked = f.value === form.feature;  // the primary is always included
                  return (
                    <label
                      key={f.value}
                      className={`flex items-start gap-2 rounded-xl border p-2.5 text-sm ${
                        on ? 'border-brand-300 bg-brand-50' : 'border-brand-100'
                      } ${locked ? 'opacity-70' : 'cursor-pointer'}`}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={on}
                        disabled={locked}
                        onChange={(e) => {
                          const next = new Set(form.features || []);
                          if (e.target.checked) next.add(f.value);
                          else next.delete(f.value);
                          setForm({ ...form, features: Array.from(next) });
                        }}
                      />
                      <span className="text-ink/80">
                        {f.label}
                        {locked && <span className="block text-[11px] text-ink/45">Always included</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Field>
          </div>
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
