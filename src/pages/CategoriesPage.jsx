import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { adminApi } from '../api/admin';
import { Button, Card, Field, Input, Spinner } from '../components/ui';
import Modal from '../components/Modal';

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const empty = { name: '', slug: '', icon_key: '', icon_url: '', order: 0, is_active: true, best_directions: [], avoid_directions: [], category_group: 'architecture' };

function DirPicker({ value = [], onChange, tone }) {
  const active = tone === 'best' ? 'bg-hgreen text-white border-hgreen' : 'bg-red-500 text-white border-red-500';
  const toggle = (d) => onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {DIRS.map((d) => (
        <button key={d} type="button" onClick={() => toggle(d)}
          className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
            value.includes(d) ? active : 'border-brand-100 text-ink/60 hover:bg-brand-50'}`}>
          {d}
        </button>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null=closed, {}=new, {...}=edit
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.getCategories().then(setItems).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setForm({ ...empty, order: items.length }); setEditing({}); };
  const openEdit = (c) => { setForm({ ...empty, ...c }); setEditing(c); };
  const close = () => setEditing(null);

  const save = async () => {
    setBusy(true);
    try {
      const payload = { ...form, slug: form.slug || slugify(form.name), order: Number(form.order) || 0 };
      if (editing.id) {
        const { slug, ...rest } = payload; // slug is immutable on update
        await adminApi.updateCategory(editing.id, rest);
      } else {
        await adminApi.createCategory(payload);
      }
      close(); load();
    } catch (err) {
      alert(err?.response?.data?.detail || 'Save failed');
    } finally { setBusy(false); }
  };

  const remove = async (c) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    await adminApi.deleteCategory(c.id); load();
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminApi.uploadImage(file, 'categories');
      setForm((f) => ({ ...f, icon_url: url }));
    } catch (err) {
      alert(err?.response?.data?.detail || 'Upload failed (check Cloudinary config)');
    } finally { setUploading(false); }
  };

  if (loading) return <Spinner label="Loading categories…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">Categories</h1>
          <p className="text-sm text-ink/50">The placement grid shown in the app ({items.length}).</p>
        </div>
        <Button onClick={openNew}><Plus size={16} /> New Category</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((c) => (
          <Card key={c.id} className="group relative p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                {c.icon_url
                  ? <img src={c.icon_url} alt="" className="h-full w-full object-cover" />
                  : <span className="text-lg font-bold text-brand-500">{c.name[0]}</span>}
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink">{c.name}</div>
                <div className="truncate text-xs text-ink/40">{c.slug}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? 'bg-hgreen/10 text-hgreen' : 'bg-gray-100 text-gray-500'}`}>
                {c.is_active ? 'Active' : 'Hidden'}
              </span>
              <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50"><Pencil size={16} /></button>
                <button onClick={() => remove(c)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={editing !== null}
        onClose={close}
        title={editing?.id ? 'Edit Category' : 'New Category'}
        footer={<>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
        </>}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
              {form.icon_url
                ? <img src={form.icon_url} alt="" className="h-full w-full object-cover" />
                : <span className="text-xl font-bold text-brand-300">{(form.name || '?')[0]}</span>}
            </div>
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100">
                <Upload size={16} /> {uploading ? 'Uploading…' : 'Upload icon'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
            </label>
          </div>
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Main Entrance" />
          </Field>
          <Field label="Section / Group" hint="Which section this appears in the app">
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              value={form.category_group || 'architecture'}
              onChange={(e) => setForm({ ...form, category_group: e.target.value })}
            >
              <option value="architecture">Holistic Vastu Architecture</option>
              <option value="objects">Elements & Objects</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Slug" hint={editing?.id ? 'Immutable' : 'Auto from name if blank'}>
              <Input value={form.slug} disabled={!!editing?.id}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="main-entrance" />
            </Field>
            <Field label="Icon key" hint="App bundled icon id">
              <Input value={form.icon_key || ''} onChange={(e) => setForm({ ...form, icon_key: e.target.value })} placeholder="door" />
            </Field>
          </div>
          <div className="grid grid-cols-2 items-end gap-4">
            <Field label="Order">
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
            </Field>
            <label className="flex items-center gap-2 pb-2 text-sm font-medium text-ink/80">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-brand-500" />
              Active (visible in app)
            </label>
          </div>

          <Field label="Best directions" hint="Ideal placement — shown green & used for compass guidance">
            <DirPicker tone="best" value={form.best_directions || []} onChange={(v) => setForm({ ...form, best_directions: v })} />
          </Field>
          <Field label="Avoid directions" hint="Dosh zones — shown red on the compass">
            <DirPicker tone="avoid" value={form.avoid_directions || []} onChange={(v) => setForm({ ...form, avoid_directions: v })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
