import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, Bell } from 'lucide-react';
import { adminApi } from '../api/admin';
import { Button, Card, Field, Input, Spinner, Textarea } from '../components/ui';
import Modal from '../components/Modal';

const empty = { title: '', body: '', category_slug: '', image_url: '', order: 0, is_active: true, notify: true };

export default function TipsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => { setLoading(true); adminApi.getTips().then(setItems).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openNew = () => { setForm({ ...empty, order: items.length }); setEditing({}); };
  const openEdit = (t) => { setForm({ ...empty, ...t }); setEditing(t); };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminApi.uploadImage(file, 'tips');
      setForm({ ...form, image_url: url });
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0, category_slug: form.category_slug || null };
      if (editing.id) {
        // Only a new tip announces itself; an edit is a correction, not news.
        const { notify, ...rest } = payload;
        await adminApi.updateTip(editing.id, rest);
      } else {
        await adminApi.createTip(payload);
      }
      setEditing(null); load();
    } catch (err) { alert(err?.response?.data?.detail || 'Save failed'); }
    finally { setBusy(false); }
  };

  const remove = async (t) => { if (confirm(`Delete tip "${t.title}"?`)) { await adminApi.deleteTip(t.id); load(); } };

  const notify = async (t) => {
    if (!confirm(`Send "${t.title}" as a push notification to every installed device?`)) return;
    try {
      const stats = await adminApi.notifyTip(t.id);
      // Say why, not just how many: "10 failed" with no reason sends you
      // looking at the app when the tokens were simply stale.
      const why = Object.entries(stats.errors || {})
        .map(([error, count]) => `${count} ${error}`)
        .join(', ');
      alert(
        `Sent to ${stats.sent} of ${stats.devices} device(s).` +
        (stats.failed ? ` ${stats.failed} failed${why ? ` — ${why}` : ''}.` : '') +
        (stats.errors?.DeviceNotRegistered
          ? '\n\nThose devices uninstalled or reinstalled the app; they have been removed.'
          : '')
      );
      load();
    } catch (err) { alert(err?.response?.data?.detail || 'Could not send'); }
  };

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
              <div className="flex-1">
                <h3 className="font-bold text-ink">{t.title}</h3>
                <p className="mt-1 text-sm text-ink/60 line-clamp-3">{t.body}</p>
              </div>
              {t.image_url && (
                <img src={t.image_url} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover bg-gray-100" />
              )}
              <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => notify(t)} title="Send as a notification" className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50"><Bell size={16} /></button>
                <button onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50"><Pencil size={16} /></button>
                <button onClick={() => remove(t)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              {t.category_slug && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-600">{t.category_slug}</span>}
              <span className={`rounded-full px-2 py-0.5 ${t.is_active ? 'bg-hgreen/10 text-hgreen' : 'bg-gray-100 text-gray-500'}`}>{t.is_active ? 'Active' : 'Hidden'}</span>
              {t.notified_at && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-600">
                  Notified {t.notified_count ?? 0} · {new Date(t.notified_at).toLocaleDateString()}
                </span>
              )}
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
          <Button onClick={save} disabled={busy || uploading}>{busy ? 'Saving…' : 'Save'}</Button>
        </>}
      >
        <div className="space-y-4">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Body"><Textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
          
          <Field label="Image (optional)">
            <div className="flex items-center gap-4">
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="h-16 w-16 shrink-0 rounded-lg object-cover bg-gray-100" />
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium hover:bg-ink/5">
                <Upload size={16} />
                {uploading ? 'Uploading…' : 'Choose Image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category slug (optional)"><Input value={form.category_slug || ''} onChange={(e) => setForm({ ...form, category_slug: e.target.value })} placeholder="kitchen" /></Field>
            <Field label="Order"><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-brand-500" />
            Active
          </label>
          {!editing?.id && (
            <label className="flex items-start gap-2 rounded-lg border border-brand-100 bg-brand-50/50 p-3 text-sm font-medium text-ink/80">
              <input type="checkbox" checked={form.notify} onChange={(e) => setForm({ ...form, notify: e.target.checked })} className="mt-0.5 h-4 w-4 accent-brand-500" />
              <span>
                Notify every installed device
                <span className="block text-xs font-normal text-ink/50">
                  Sends the title and body as a push notification the moment this tip is saved.
                </span>
              </span>
            </label>
          )}
        </div>
      </Modal>
    </div>
  );
}
