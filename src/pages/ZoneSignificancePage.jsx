import { useEffect, useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';

import { adminApi } from '../api/admin';
import Modal from '../components/Modal';
import { Button, Card, Field, Input, Spinner, Textarea } from '../components/ui';

/*
 * The owner's "16 Zones Significances" — the reading under each zone on the
 * app's 16 Zone Analysis tab, and the Brahmasthan's under it.
 *
 * Seventeen fixed entries, tied to the dial by their code, so they are edited
 * and never added or removed. Every line is editable in English and in Hindi;
 * the app shows Hindi to Hindi readers and English to everyone else. The
 * headings in front of the lines ("Core Insights", "Home" …) belong to the app
 * and are the same for every zone, so they are not here.
 */

const LINES = [
  ['core', 'Core Insights', 'मुख्य ताकत', 2],
  ['planet_label', 'Planet name, inside "Planet ( … )"', 'ग्रह का नाम, "ग्रह ( … )" के अंदर', 1],
  ['planet', 'Research — Planet', 'शोध — ग्रह', 2],
  ['home', 'Research — Home', 'शोध — घर', 3],
  ['office', 'Research — Shop / Office', 'शोध — दुकान / ऑफिस', 3],
  ['health', 'Health & Vitality', 'शरीर और सेहत', 2],
  ['danger', 'Danger Signs (If Wrong)', 'खतरे के संकेत (दोष होने पर)', 3],
  ['suitable', 'Suitable', 'उपयुक्त', 3],
  ['avoid', 'Avoid', 'बचें', 3],
];

// The keys the app draws from. They restate the Element / Guna / Planet lines
// for the artwork, so change them when you change those lines.
const PLANETS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
const ELEMENTS = ['water', 'air', 'fire', 'earth', 'space'];
const GUNAS = ['sattva', 'rajas', 'tamas'];

function Chips({ all, value, onChange }) {
  const toggle = (k) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {all.map((k) => {
        const on = value.includes(k);
        return (
          <button key={k} type="button" onClick={() => toggle(k)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize transition ${
              on ? 'border-brand-500 bg-brand-500 text-white' : 'border-brand-100 text-ink/60 hover:bg-brand-50'}`}>
            {k}
          </button>
        );
      })}
    </div>
  );
}

export default function ZoneSignificancePage() {
  const [zones, setZones] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [lang, setLang] = useState('en');
  const [busy, setBusy] = useState(false);

  const load = async () => setZones(await adminApi.listZoneSignificance());
  useEffect(() => { load(); }, []);

  const openEdit = (z) => {
    setForm(structuredClone(z));
    setLang('en');
    setEditing(z);
  };

  const setLine = (key, text) => setForm((f) => ({ ...f, [lang]: { ...f[lang], [key]: text } }));
  const changed = useMemo(() => editing && form && JSON.stringify(editing) !== JSON.stringify(form), [editing, form]);

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.updateZoneSignificance(editing.id, {
        direction: form.direction, title: form.title, emoji: form.emoji, deity: form.deity,
        element: form.element, guna: form.guna, planet: form.planet,
        planets: form.planets, elements: form.elements, gunas: form.gunas,
        en: form.en, hi: form.hi, is_active: !!form.is_active,
      });
      setEditing(null);
      load();
    } catch (err) {
      alert(err?.response?.data?.detail || 'Save failed');
    } finally { setBusy(false); }
  };

  if (!zones) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">16 Zones</h1>
        <p className="text-sm text-ink/60">
          The reading under each zone on the app&apos;s 16 Zone Analysis tab, and the Brahmasthan&apos;s.
          Edit any line in English or Hindi; the app picks up the change the next time it opens.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {zones.map((z) => (
          <Card key={z.id} className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-400 text-xs font-bold text-amber-700">
                {String(z.order).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold tracking-wide text-ink">{z.direction}</span>
                  <span className="text-xs text-ink/50">· {z.deity}</span>
                  {!z.is_active && <span className="rounded bg-ink/10 px-1.5 py-0.5 text-[10px] font-semibold text-ink/60">HIDDEN</span>}
                </div>
                <p className="text-xs font-semibold tracking-wide text-brand-700">{z.title}</p>
                <p className="mt-1 text-xs text-ink/60">{z.element} · {z.guna} · {z.planet}</p>
                <p className="mt-1.5 text-sm text-ink/75">{z.en.core}</p>
              </div>
              <button onClick={() => openEdit(z)} className="rounded-lg p-2 text-ink/60 hover:bg-brand-50"><Pencil size={16} /></button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={form ? `${String(form.order).padStart(2, '0')} · ${form.direction}` : ''}>
        {form && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
              <Field label="Deity" hint="Shown on the chip under the heading">
                <Input value={form.deity} onChange={(e) => setForm({ ...form, deity: e.target.value })} />
              </Field>
              <Field label="Element"><Input value={form.element} onChange={(e) => setForm({ ...form, element: e.target.value })} /></Field>
              <Field label="Guna"><Input value={form.guna} onChange={(e) => setForm({ ...form, guna: e.target.value })} /></Field>
            </div>
            <Field label="Planet"><Input value={form.planet} onChange={(e) => setForm({ ...form, planet: e.target.value })} /></Field>

            <div className="space-y-2 rounded-xl border border-brand-100 bg-brand-50/40 p-3">
              <p className="text-xs text-ink/60">What the app draws — keep these matching the lines above.</p>
              <Field label="Planet artwork"><Chips all={PLANETS} value={form.planets} onChange={(v) => setForm({ ...form, planets: v })} /></Field>
              <Field label="Element colours"><Chips all={ELEMENTS} value={form.elements} onChange={(v) => setForm({ ...form, elements: v })} /></Field>
              <Field label="Guna colours"><Chips all={GUNAS} value={form.gunas} onChange={(v) => setForm({ ...form, gunas: v })} /></Field>
            </div>

            <div className="flex gap-1 rounded-xl bg-brand-50 p-1">
              {[['en', 'English'], ['hi', 'हिन्दी']].map(([k, label]) => (
                <button key={k} type="button" onClick={() => setLang(k)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    lang === k ? 'bg-white text-brand-700 shadow-sm' : 'text-ink/60 hover:text-ink'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {LINES.map(([key, en, hi, rows]) => (
                <Field key={`${lang}-${key}`} label={lang === 'en' ? en : hi}>
                  {rows === 1
                    ? <Input value={form[lang][key]} onChange={(e) => setLine(key, e.target.value)} />
                    : <Textarea rows={rows} value={form[lang][key]} onChange={(e) => setLine(key, e.target.value)} />}
                </Field>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-ink/80">
              <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Visible in the app
            </label>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} disabled={busy || !changed}>{busy ? 'Saving…' : 'Save'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
