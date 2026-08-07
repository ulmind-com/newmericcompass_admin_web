import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, CheckCircle2, Circle } from 'lucide-react';
import { adminApi } from '../api/admin';
import { Button, Card, Field, Input, Select, Spinner, Textarea, VerdictBadge } from '../components/ui';
import Modal from '../components/Modal';
import ListInput from '../components/ListInput';

const VERDICTS = ['excellent', 'good', 'average', 'bad'];
const QUAD_COLOR = { N: 'text-sky-600', E: 'text-emerald-600', S: 'text-rose-600', W: 'text-amber-600' };
const blankRule = { verdict: 'average', score: 50, effects: [], treatments: [], notes: '', is_active: true };

export default function RulesPage() {
  const [categories, setCategories] = useState([]);
  const [padas, setPadas] = useState([]);
  const [category, setCategory] = useState('');
  const [rulesByPada, setRulesByPada] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { pada, rule }
  const [form, setForm] = useState(blankRule);
  const [busy, setBusy] = useState(false);

  // Bootstrap categories + padas once.
  useEffect(() => {
    Promise.all([adminApi.getCategories(), adminApi.getPadas()]).then(([cats, pds]) => {
      setCategories(cats);
      setPadas(pds);
      if (cats.length) setCategory(cats[0].slug);
      setLoading(false);
    });
  }, []);

  const loadRules = (slug) => {
    if (!slug) return;
    adminApi.getRules({ category: slug }).then((rules) => {
      setRulesByPada(Object.fromEntries(rules.map((r) => [r.pada_code, r])));
    });
  };
  useEffect(() => loadRules(category), [category]);

  const configuredCount = useMemo(() => Object.keys(rulesByPada).length, [rulesByPada]);

  const openEdit = (pada) => {
    const rule = rulesByPada[pada.code];
    setForm(rule ? { ...blankRule, ...rule } : { ...blankRule });
    setEditing({ pada, rule });
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        verdict: form.verdict,
        score: Number(form.score),
        effects: form.effects,
        treatments: form.treatments,
        notes: form.notes || null,
        is_active: form.is_active,
      };
      await adminApi.upsertRule(category, editing.pada.code, payload);
      setEditing(null);
      loadRules(category);
    } catch (err) {
      alert(err?.response?.data?.detail || 'Save failed');
    } finally { setBusy(false); }
  };

  if (loading) return <Spinner label="Loading rules…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Vastu Rules</h1>
          <p className="text-sm text-ink/50">
            Configure the verdict, effects &amp; treatments for each pada.{' '}
            <span className="font-semibold text-brand-600">{configuredCount}/32</span> configured for this category.
          </p>
        </div>
        <div className="w-64">
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </Select>
          </Field>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50/60 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                {['', 'Pada', 'Direction', 'Life Aspect', 'Verdict', 'Score', 'Effects', 'Treatments', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {padas.map((p) => {
                const rule = rulesByPada[p.code];
                return (
                  <tr key={p.code} className="cursor-pointer hover:bg-brand-50/40" onClick={() => openEdit(p)}>
                    <td className="px-4 py-2.5">
                      {rule ? <CheckCircle2 size={16} className="text-hgreen" /> : <Circle size={16} className="text-ink/20" />}
                    </td>
                    <td className="px-4 py-2.5 font-bold"><span className={QUAD_COLOR[p.quadrant]}>{p.code}</span></td>
                    <td className="px-4 py-2.5 text-ink/70">{p.direction16}</td>
                    <td className="px-4 py-2.5 text-ink/60">{p.life_aspect || '—'}</td>
                    <td className="px-4 py-2.5">{rule ? <VerdictBadge verdict={rule.verdict} /> : <span className="text-xs text-ink/30">default</span>}</td>
                    <td className="px-4 py-2.5 tabular-nums text-ink/70">{rule ? rule.score : '—'}</td>
                    <td className="px-4 py-2.5 text-ink/50">{rule?.effects?.length || 0}</td>
                    <td className="px-4 py-2.5 text-ink/50">{rule?.treatments?.length || 0}</td>
                    <td className="px-4 py-2.5 text-right"><Pencil size={15} className="text-brand-400" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        maxWidth="max-w-2xl"
        title={editing ? `${categories.find((c) => c.slug === category)?.name} · ${editing.pada.code} (${editing.pada.direction16})` : ''}
        footer={<>
          <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save rule'}</Button>
        </>}
      >
        {editing && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Verdict">
                <Select value={form.verdict} onChange={(e) => setForm({ ...form, verdict: e.target.value })}>
                  {VERDICTS.map((v) => <option key={v} value={v}>{v}</option>)}
                </Select>
              </Field>
              <Field label="Score (0–100)">
                <Input type="number" min={0} max={100} value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
              </Field>
            </div>
            <Field label="Effects" hint="Bullet points shown in the app's Effects tab">
              <ListInput value={form.effects} onChange={(effects) => setForm({ ...form, effects })} placeholder="Add an effect…" />
            </Field>
            <Field label="Treatments" hint="Shown in the app's Treatment tab">
              <ListInput value={form.treatments} onChange={(treatments) => setForm({ ...form, treatments })} placeholder="Add a remedy…" />
            </Field>
            <Field label="Notes (internal)">
              <Textarea rows={2} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
            <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
              <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-brand-500" />
              Active
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
