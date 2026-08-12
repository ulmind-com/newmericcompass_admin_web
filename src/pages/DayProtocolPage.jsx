import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';

import { adminApi } from '../api/admin';
import ListInput from '../components/ListInput';
import Modal from '../components/Modal';
import { Button, Card, Field, Input, Spinner, Textarea } from '../components/ui';

const ZONES = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

/** The seven-day remedial protocol the app shows under Day-Wise Remedy. */
export default function DayProtocolPage() {
  const [days, setDays] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  const load = async () => setDays(await adminApi.listDayProtocols());
  useEffect(() => { load(); }, []);

  const openEdit = (d) => {
    setForm({ ...d, deep_logic: d.deep_logic ?? '', actions: d.actions ?? [], focus_zones: d.focus_zones ?? [] });
    setEditing(d);
  };

  const toggleZone = (z) => setForm((f) => ({
    ...f,
    focus_zones: f.focus_zones.includes(z) ? f.focus_zones.filter((x) => x !== z) : [...f.focus_zones, z],
  }));

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.updateDayProtocol(editing.id, {
        day_name: form.day_name, planet: form.planet, energy: form.energy,
        objective: form.objective, actions: form.actions,
        deep_logic: form.deep_logic?.trim() || null,
        focus_zones: form.focus_zones, color: form.color, is_active: !!form.is_active,
      });
      setEditing(null);
      load();
    } catch (err) {
      alert(err?.response?.data?.detail || 'Save failed');
    } finally { setBusy(false); }
  };

  if (!days) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Day-Wise Remedy</h1>
        <p className="text-sm text-ink/60">
          What the app tells a user to do on each day. Reached from the side menu and from the Day tile on 7D Nexus.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {days.map((d) => (
          <Card key={d.id} className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="mt-1 h-9 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-ink">{d.day_name}</span>
                  <span className="text-sm text-ink/50">· {d.energy}</span>
                  {!d.is_active && <span className="rounded bg-ink/10 px-1.5 py-0.5 text-[10px] font-semibold text-ink/60">HIDDEN</span>}
                </div>
                <p className="text-sm text-ink/70">{d.objective}</p>
              </div>
              <button onClick={() => openEdit(d)} className="rounded-lg p-2 text-ink/60 hover:bg-brand-50"><Pencil size={16} /></button>
            </div>

            {d.focus_zones?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pl-5">
                {d.focus_zones.map((z) => (
                  <span key={z} className="rounded bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">{z}</span>
                ))}
              </div>
            )}

            <ul className="list-disc space-y-1 pl-9 text-sm text-ink/70">
              {d.actions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </Card>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${form.day_name || ''}`}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Day name"><Input value={form.day_name || ''} onChange={(e) => setForm({ ...form, day_name: e.target.value })} /></Field>
          <Field label="Planet"><Input value={form.planet || ''} onChange={(e) => setForm({ ...form, planet: e.target.value })} /></Field>
          <Field label="Energy" hint="e.g. Moon Energy">
            <Input value={form.energy || ''} onChange={(e) => setForm({ ...form, energy: e.target.value })} />
          </Field>
          <Field label="Accent colour">
            <div className="flex items-center gap-2">
              <input type="color" value={form.color || '#FF6A00'} onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-9 w-12 cursor-pointer rounded border border-brand-100 bg-white" />
              <Input value={form.color || ''} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
          </Field>
        </div>

        <div className="mt-3">
          <Field label="Objective"><Input value={form.objective || ''} onChange={(e) => setForm({ ...form, objective: e.target.value })} /></Field>
        </div>

        <div className="mt-3">
          <Field label="Focus zones" hint="Shown as chips on the day card">
            <div className="flex flex-wrap gap-2">
              {ZONES.map((z) => {
                const on = form.focus_zones?.includes(z);
                return (
                  <button key={z} type="button" onClick={() => toggleZone(z)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                      on ? 'border-brand-500 bg-brand-500 text-white' : 'border-brand-100 text-ink/60 hover:bg-brand-50'}`}>
                    {z}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="mt-3">
          <Field label="What to do" hint="One action per line; shown as a numbered checklist">
            <ListInput value={form.actions || []} onChange={(v) => setForm({ ...form, actions: v })} placeholder="Keep the North-West clean and well ventilated." />
          </Field>
        </div>

        <div className="mt-3">
          <Field label="Deep Vastu logic" hint="The reasoning shown under the checklist">
            <Textarea rows={3} value={form.deep_logic || ''} onChange={(e) => setForm({ ...form, deep_logic: e.target.value })} />
          </Field>
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          Visible in the app
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save day'}</Button>
        </div>
      </Modal>
    </div>
  );
}
