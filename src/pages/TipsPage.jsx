import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { adminApi } from '../api/admin';
import { Button, Card, Field, Input, Spinner, Textarea } from '../components/ui';
import Modal from '../components/Modal';

const empty = { title: '', body: '', category_slug: '', image_url: '', order: 0, is_active: true };

export default function TipsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  const load = () => { setLoading(true); adminApi.getTips().then(setItems).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openNew = () => { setForm({ ...empty, order: items.length }); setEditing({}); };
  const openEdit = (t) => { setForm({ ...empty, ...t }); setEditing(t); };

  const save = async () => {
    setBusy(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0, category_slug: form.category_slug || null };
      if (editing.id) await adminApi.updateTip(editing.id, payload);
      else await adminApi.createTip(payload);
      setEditing(null); load();
    } catch (err) { alert(err?.response?.data?.detail || 'Save failed'); }
    finally { setBusy(false); }
  };

  const remove = async (t) => { if (confirm(`Delete tip "${t.title}"?`)) { await adminApi.deleteTip(t.id); load(); } };

  if (loading) return <Spinner label="Loading tips…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">Daily Tips</h1>
          <p className="text-sm text-ink/50">Vastu tips surfaced in the app ({items.length}).</p>
        </div>
        <Button onClick={openNew}><Plus size={16} /> New Tip</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((t) => (
          <Card key={t.id} className="group p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-ink">{t.title}</h3>
                <p className="mt-1 text-sm text-ink/60 line-clamp-3">{t.body}</p>
              </div>
              <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50"><Pencil size={16} /></button>
                <button onClick={() => remove(t)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              {t.category_slug && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-600">{t.category_slug}</span>}
              <span className={`rounded-full px-2 py-0.5 ${t.is_active ? 'bg-hgreen/10 text-hgreen' : 'bg-gray-100 text-gray-500'}`}>{t.is_active ? 'Active' : 'Hidden'}</span>
            </div>
          </Card>
        ))}
        {items.length === 0 && <p className="col-span-full py-10 text-center text-ink/40">No tips yet.</p>}
      </div>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit Tip' : 'New Tip'}
        footer={<>
          <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
        </>}
      >
        <div className="space-y-4">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Body"><Textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category slug (optional)"><Input value={form.category_slug || ''} onChange={(e) => setForm({ ...form, category_slug: e.target.value })} placeholder="kitchen" /></Field>
            <Field label="Order"><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-brand-500" />
            Active
          </label>
        </div>
      </Modal>
    </div>
  );
}
