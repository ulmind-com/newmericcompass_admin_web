import React, { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { adminApi } from '../api/admin';
import { Button, Card, Field, Input, Select, Spinner, Textarea } from '../components/ui';
import Modal from '../components/Modal';

const VERDICTS = ['excellent', 'good', 'average', 'bad'];
const QUAD_COLOR = { N: 'text-sky-600', E: 'text-emerald-600', S: 'text-rose-600', W: 'text-amber-600' };

export default function PadasPage() {
  const [padas, setPadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  const load = () => { setLoading(true); adminApi.getPadas().then(setPadas).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openEdit = (p) => { setForm({ ...p }); setEditing(p); };

  const save = async () => {
    setBusy(true);
    try {
      const keys = ['name', 'element', 'dosha', 'organ', 'life_aspect', 'nakshatra', 'color',
        'lord', 'planet', 'metal', 'shape', 'day', 'self_colour', 'destruct_colour',
        'enhance_colour', 'exhaust_colour', 'acceptable_colour', 'relationship',
        'default_verdict', 'description', 'is_active'];
      const payload = Object.fromEntries(keys.map((k) => [k, form[k]]));
      await adminApi.updatePada(editing.code, payload);
      setEditing(null); load();
    } catch (err) { alert(err?.response?.data?.detail || 'Save failed'); }
    finally { setBusy(false); }
  };

  if (loading) return <Spinner label="Loading padas…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">Padas <span className="text-ink/30">· N5 system</span></h1>
        <p className="text-sm text-ink/50">The 32 compass zones (11.25° each). N5 = due North. Structure is fixed; attributes are editable.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50/60 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                {['Pada', 'Range', '16-Dir', 'Element', 'Dosha', 'Organ', 'Life Aspect', 'Default', ''].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {padas.map((p) => (
                <tr key={p.code} className="hover:bg-brand-50/40">
                  <td className="px-4 py-2.5 font-bold">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-sm border border-brand-100" style={{ backgroundColor: p.color || '#EFE7D6' }} />
                      <span className={QUAD_COLOR[p.quadrant]}>{p.code}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-ink/60">{p.start_deg}°–{p.end_deg}°</td>
                  <td className="px-4 py-2.5 font-medium">{p.direction16}</td>
                  <td className="px-4 py-2.5 text-ink/70">{p.element || '—'}</td>
                  <td className="px-4 py-2.5 text-ink/70">{p.dosha || '—'}</td>
                  <td className="px-4 py-2.5 text-ink/70">{p.organ || '—'}</td>
                  <td className="px-4 py-2.5 text-ink/70">{p.life_aspect || '—'}</td>
                  <td className="px-4 py-2.5 capitalize text-ink/70">{p.default_verdict}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-100"><Pencil size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={`Edit Pada ${editing?.code || ''}`}
        footer={<>
          <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
        </>}
      >
        {editing && (
          <div className="space-y-4">
            <div className="rounded-lg bg-brand-50/60 px-4 py-3 text-sm text-ink/60">
              {editing.direction16_full} · {editing.center_deg}° center · quadrant {editing.quadrant}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name"><Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Nakshatra"><Input value={form.nakshatra || ''} onChange={(e) => setForm({ ...form, nakshatra: e.target.value })} /></Field>
              <Field label="Element"><Input value={form.element || ''} onChange={(e) => setForm({ ...form, element: e.target.value })} /></Field>
              <Field label="Dosha"><Input value={form.dosha || ''} onChange={(e) => setForm({ ...form, dosha: e.target.value })} /></Field>
              <Field label="Organ"><Input value={form.organ || ''} onChange={(e) => setForm({ ...form, organ: e.target.value })} /></Field>
              <Field label="Default verdict">
                <Select value={form.default_verdict} onChange={(e) => setForm({ ...form, default_verdict: e.target.value })}>
                  {VERDICTS.map((v) => <option key={v} value={v}>{v}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Life aspect"><Input value={form.life_aspect || ''} onChange={(e) => setForm({ ...form, life_aspect: e.target.value })} /></Field>
            <Field label="Zone colour" hint="Hex, shown as the compass band colour">
              <div className="flex items-center gap-2">
                <input type="color" value={form.color || '#EFE7D6'} onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-brand-100 bg-white" />
                <Input value={form.color || ''} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#CFE8F5" />
              </div>
            </Field>

            <div className="rounded-lg bg-brand-50/50 p-3">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-700">7D Master Code</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[['lord', 'Lord'], ['planet', 'Planet'], ['metal', 'Metal'], ['shape', 'Shape'], ['day', 'Day']].map(([k, label]) => (
                  <Field key={k} label={label}><Input value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></Field>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-brand-50/50 p-3">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-700">Colour Remedies</div>
              <div className="grid grid-cols-2 gap-3">
                {[['self_colour', 'Self'], ['enhance_colour', 'Enhance'], ['destruct_colour', 'Destruct'], ['exhaust_colour', 'Exhaust']].map(([k, label]) => (
                  <Field key={k} label={label}><Input value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></Field>
                ))}
              </div>
              <div className="mt-2"><Field label="Acceptable"><Input value={form.acceptable_colour || ''} onChange={(e) => setForm({ ...form, acceptable_colour: e.target.value })} /></Field></div>
            </div>

            <Field label="Relationship" hint="Optional detail (e.g. Sex-Partner, Extra Marital Affair)">
              <Input value={form.relationship || ''} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
            </Field>
            <Field label="Description"><Textarea rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
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
