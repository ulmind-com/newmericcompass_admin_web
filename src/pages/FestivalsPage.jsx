import { useEffect, useState } from 'react';
import { Pencil, Plus, Sparkles, Trash2, Upload } from 'lucide-react';

import { adminApi } from '../api/admin';
import Modal from '../components/Modal';
import { Button, Card, Field, Input, Spinner, Textarea } from '../components/ui';

const BLANK = {
  name: '', starts_at: '', ends_at: '', is_active: true,
  header_colors: ['#FF7A1A', '#FFFFFF', '#1B8A3A'],
  accent: '#FF7A1A',
  banner_title: '', banner_subtitle: '', banner_image_url: '', banner_emoji: '',
};

/** ISO in, value the datetime-local input wants out. */
const toLocal = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');

const state = (f) => {
  const now = new Date();
  const from = new Date(f.starts_at);
  const to = new Date(f.ends_at);
  if (!f.is_active) return { label: 'Off', cls: 'bg-ink/10 text-ink/60' };
  if (now < from) return { label: 'Scheduled', cls: 'bg-blue-100 text-blue-700' };
  if (now > to) return { label: 'Finished', cls: 'bg-ink/10 text-ink/50' };
  return { label: 'Live now', cls: 'bg-green-100 text-green-700' };
};

/**
 * Seasonal themes.
 *
 * The dates decide when a theme runs; the switch decides whether it runs at
 * all — so one can be pulled without editing away the dates you would need to
 * put it back next year.
 */
export default function FestivalsPage() {
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => setRows(await adminApi.listFestivals());
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(BLANK); setEditing('new'); };
  const openEdit = (f) => {
    setForm({
      ...BLANK, ...f,
      starts_at: toLocal(f.starts_at), ends_at: toLocal(f.ends_at),
      banner_title: f.banner_title ?? '', banner_subtitle: f.banner_subtitle ?? '',
      banner_image_url: f.banner_image_url ?? '', banner_emoji: f.banner_emoji ?? '',
      accent: f.accent ?? '#FF7A1A',
      header_colors: f.header_colors?.length ? f.header_colors : BLANK.header_colors,
    });
    setEditing(f);
  };

  const setStop = (i, value) => setForm((s) => {
    const next = [...s.header_colors];
    next[i] = value;
    return { ...s, header_colors: next };
  });

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setForm((s) => ({ ...s, banner_image_url: '' }));
      const url = await adminApi.uploadImage(file, 'festivals');
      setForm((s) => ({ ...s, banner_image_url: url }));
    } catch (err) { alert(err?.response?.data?.detail || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.name.trim() || !form.starts_at || !form.ends_at) {
      return alert('A name and both dates are required.');
    }
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        // The input gives local time; the API works in UTC.
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        is_active: !!form.is_active,
        header_colors: form.header_colors.filter(Boolean),
        accent: form.accent || null,
        banner_title: form.banner_title.trim() || null,
        banner_subtitle: form.banner_subtitle.trim() || null,
        banner_image_url: form.banner_image_url || null,
        banner_emoji: form.banner_emoji.trim() || null,
      };
      if (editing === 'new') await adminApi.createFestival(payload);
      else await adminApi.updateFestival(editing.id, payload);
      setEditing(null);
      load();
    } catch (err) { alert(err?.response?.data?.detail || 'Save failed'); }
    finally { setBusy(false); }
  };

  const remove = async (f) => {
    if (!confirm(`Delete the theme "${f.name}"?`)) return;
    await adminApi.deleteFestival(f.id);
    load();
  };

  if (!rows) return <Spinner />;

  const preview = form.header_colors.filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Seasonal Themes</h1>
          <p className="text-sm text-ink/60">
            Repaint the app for a festival or a sale. It turns itself on and off on the dates you set.
          </p>
        </div>
        <Button onClick={openNew}><Plus size={16} /> New theme</Button>
      </div>

      {rows.length === 0 ? (
        <Card><p className="py-8 text-center text-sm italic text-ink/50">No themes yet — the app stays in its own colours.</p></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((f) => {
            const s = state(f);
            return (
              <Card key={f.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${(f.header_colors || []).join(', ')})` }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{f.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${s.cls}`}>{s.label}</span>
                    </div>
                    <div className="text-xs text-ink/50">
                      {new Date(f.starts_at).toLocaleString()} → {new Date(f.ends_at).toLocaleString()}
                    </div>
                  </div>
                  <button onClick={() => openEdit(f)} className="rounded-lg p-2 text-ink/60 hover:bg-brand-50"><Pencil size={16} /></button>
                  <button onClick={() => remove(f)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>

                {(f.banner_title || f.banner_image_url) && (
                  <div className="flex items-center gap-3 rounded-xl p-3 text-white"
                    style={{ background: `linear-gradient(135deg, ${(f.header_colors || []).join(', ')})` }}>
                    {f.banner_image_url
                      ? <img src={f.banner_image_url} alt="" className="h-10 w-10 rounded object-contain" />
                      : f.banner_emoji ? <span className="text-2xl">{f.banner_emoji}</span> : null}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold">{f.banner_title}</div>
                      {f.banner_subtitle && <div className="truncate text-xs opacity-90">{f.banner_subtitle}</div>}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New theme' : `Edit ${form.name}`}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Name" hint="For you, not shown in the app">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Independence Day" />
            </Field>
          </div>
          <Field label="Starts">
            <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
          </Field>
          <Field label="Ends">
            <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
          </Field>
        </div>

        <div className="mt-4 rounded-lg border border-brand-100 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">Colours</p>
          <div className="mb-3 h-14 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${preview.join(', ')})` }} />
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Field key={i} label={`Header stop ${i + 1}`}>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.header_colors[i] || '#FFFFFF'} onChange={(e) => setStop(i, e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-brand-100 bg-white" />
                  <Input value={form.header_colors[i] || ''} onChange={(e) => setStop(i, e.target.value)} />
                </div>
              </Field>
            ))}
          </div>
          <div className="mt-2 max-w-xs">
            <Field label="Accent" hint="Highlights while the theme runs">
              <div className="flex items-center gap-2">
                <input type="color" value={form.accent || '#FF7A1A'} onChange={(e) => setForm({ ...form, accent: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-brand-100 bg-white" />
                <Input value={form.accent || ''} onChange={(e) => setForm({ ...form, accent: e.target.value })} />
              </div>
            </Field>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-brand-100 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">Banner</p>
          <p className="mb-3 text-xs text-ink/55">Leave the title empty for a colour-only theme — no banner will show.</p>
          <Field label="Title">
            <Input value={form.banner_title} onChange={(e) => setForm({ ...form, banner_title: e.target.value })}
              placeholder="Celebrating 79th Independence Day" />
          </Field>
          <div className="mt-2">
            <Field label="Subtitle">
              <Textarea rows={2} value={form.banner_subtitle} onChange={(e) => setForm({ ...form, banner_subtitle: e.target.value })} />
            </Field>
          </div>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <Field label="Emoji" hint="Used when there is no image">
              <Input value={form.banner_emoji} onChange={(e) => setForm({ ...form, banner_emoji: e.target.value })} placeholder="🇮🇳" />
            </Field>
            <Field label="Image">
              <div className="flex items-center gap-3">
                {form.banner_image_url && <img src={form.banner_image_url} alt="" className="h-12 w-12 rounded-lg bg-gray-100 object-contain" />}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink/20 px-3 py-2 text-sm font-medium hover:bg-ink/5">
                  <Upload size={15} />
                  {uploading ? 'Uploading…' : 'Choose'}
                  <input type="file" accept="image/*" className="hidden" onChange={upload} disabled={uploading} />
                </label>
              </div>
            </Field>
          </div>
        </div>

        <label className="mt-4 flex items-start gap-2 rounded-lg border border-brand-100 bg-brand-50/50 p-3 text-sm font-medium text-ink/80">
          <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="mt-0.5 h-4 w-4 accent-brand-500" />
          <span>
            <Sparkles size={13} className="mr-1 inline text-brand-600" />
            Enabled
            <span className="block text-xs font-normal text-ink/50">
              Uncheck to pull the theme without losing its dates. It still only shows between them.
            </span>
          </span>
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={save} disabled={busy || uploading}>{busy ? 'Saving…' : 'Save theme'}</Button>
        </div>
      </Modal>
    </div>
  );
}
