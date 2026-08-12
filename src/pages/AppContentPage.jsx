import { useEffect, useState } from 'react';
import { Facebook, Instagram, Youtube, MessageCircle, Globe, Plus, Pencil, Trash2 } from 'lucide-react';

import { adminApi } from '../api/admin';
import Modal from '../components/Modal';
import { Button, Card, Field, Input, Select, Spinner, Textarea } from '../components/ui';

const PLATFORM_ICON = {
  facebook: Facebook, instagram: Instagram, youtube: Youtube, whatsapp: MessageCircle, web: Globe,
};
const PLATFORMS = ['youtube', 'facebook', 'instagram', 'whatsapp', 'web'];

const SECTIONS = [
  {
    value: 'essentials',
    title: 'Vastu Essentials',
    hint: 'Your YouTube and Facebook videos. Paste the direct video link — tapping it opens that app on the exact video.',
  },
  {
    value: 'social',
    title: 'Please Check This Out',
    hint: 'The follow-us row. Use profile/page links so the app opens straight on the page.',
  },
];

const BLANK = {
  section: 'essentials', platform: 'youtube', title: '', subtitle: '',
  url: '', thumbnail_url: '', order: 0, is_active: true,
};

/** Everything the app's side menu shows, plus how it asks for a review. */
export default function AppContentPage() {
  const [links, setLinks] = useState(null);
  const [share, setShare] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [savedShare, setSavedShare] = useState(false);

  const load = async () => {
    const [l, s] = await Promise.all([adminApi.listAppLinks(), adminApi.getShareSettings()]);
    setLinks(l);
    setShare(s);
  };
  useEffect(() => { load(); }, []);

  const openNew = (section) => { setForm({ ...BLANK, section }); setEditing('new'); };
  const openEdit = (l) => {
    setForm({ ...BLANK, ...l, subtitle: l.subtitle ?? '', thumbnail_url: l.thumbnail_url ?? '' });
    setEditing(l);
  };

  const save = async () => {
    if (!form.title.trim() || !form.url.trim()) return alert('A title and a link are required.');
    setBusy(true);
    try {
      const payload = {
        section: form.section, platform: form.platform,
        title: form.title.trim(), subtitle: form.subtitle.trim() || null,
        url: form.url.trim(), thumbnail_url: form.thumbnail_url.trim() || null,
        order: Number(form.order || 0), is_active: !!form.is_active,
      };
      if (editing === 'new') await adminApi.createAppLink(payload);
      else await adminApi.updateAppLink(editing.id, payload);
      setEditing(null);
      load();
    } catch (err) {
      alert(err?.response?.data?.detail || 'Save failed');
    } finally { setBusy(false); }
  };

  const remove = async (l) => {
    if (!confirm(`Remove "${l.title}" from the menu?`)) return;
    await adminApi.deleteAppLink(l.id);
    load();
  };

  const saveShare = async () => {
    setBusy(true);
    try {
      await adminApi.updateShareSettings({
        ...share,
        review_after_days: Number(share.review_after_days || 0),
        review_after_opens: Number(share.review_after_opens || 0),
      });
      setSavedShare(true);
      setTimeout(() => setSavedShare(false), 2000);
    } catch (err) {
      alert(err?.response?.data?.detail || 'Save failed');
    } finally { setBusy(false); }
  };

  if (!links || !share) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">App Content</h1>
        <p className="text-sm text-ink/60">The links in the app's side menu, and how the app asks to be shared and rated.</p>
      </div>

      {SECTIONS.map((section) => {
        const rows = links.filter((l) => l.section === section.value);
        return (
          <Card key={section.value}>
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">{section.title}</h2>
                <p className="text-xs text-ink/55">{section.hint}</p>
              </div>
              <Button variant="ghost" onClick={() => openNew(section.value)}><Plus size={15} /> Add</Button>
            </div>

            {rows.length === 0 ? (
              <p className="py-3 text-sm italic text-ink/50">Nothing here yet — this section is hidden in the app.</p>
            ) : (
              <div className="space-y-2">
                {rows.map((l) => {
                  const Icon = PLATFORM_ICON[l.platform] || Globe;
                  return (
                    <div key={l.id} className="flex items-center gap-3 rounded-xl border border-brand-100 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink">{l.title}</span>
                          {!l.is_active && <span className="rounded bg-ink/10 px-1.5 py-0.5 text-[10px] font-semibold text-ink/60">HIDDEN</span>}
                        </div>
                        <a href={l.url} target="_blank" rel="noreferrer"
                          className="block truncate text-xs text-ink/50 hover:text-brand-700 hover:underline">{l.url}</a>
                      </div>
                      <button onClick={() => openEdit(l)} className="rounded-lg p-2 text-ink/60 hover:bg-brand-50"><Pencil size={16} /></button>
                      <button onClick={() => remove(l)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}

      <Card>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-brand-700">Share & Review</h2>
        <p className="mb-3 text-xs text-ink/55">
          The review prompt only appears once the user has both paid and actually used the app, so it never
          lands on someone with nothing to say.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Share message" hint="What gets sent when a user shares the app">
              <Textarea rows={2} value={share.message} onChange={(e) => setShare({ ...share, message: e.target.value })} />
            </Field>
          </div>
          <Field label="Play Store URL"><Input value={share.android_url} onChange={(e) => setShare({ ...share, android_url: e.target.value })} placeholder="https://play.google.com/store/apps/details?id=…" /></Field>
          <Field label="App Store URL"><Input value={share.ios_url} onChange={(e) => setShare({ ...share, ios_url: e.target.value })} placeholder="https://apps.apple.com/app/id…" /></Field>
          <Field label="Website"><Input value={share.website_url} onChange={(e) => setShare({ ...share, website_url: e.target.value })} /></Field>
          <div />
          <Field label="Ask for a review after (days)">
            <Input type="number" min="0" value={share.review_after_days} onChange={(e) => setShare({ ...share, review_after_days: e.target.value })} />
          </Field>
          <Field label="…and after this many app opens">
            <Input type="number" min="0" value={share.review_after_opens} onChange={(e) => setShare({ ...share, review_after_opens: e.target.value })} />
          </Field>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={!!share.review_requires_purchase}
            onChange={(e) => setShare({ ...share, review_requires_purchase: e.target.checked })} />
          Only ask users who have bought something
        </label>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={saveShare} disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</Button>
          {savedShare && <span className="text-sm text-green-600">Saved</span>}
        </div>
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add link' : `Edit ${form.title}`}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Section">
            <Select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
              {SECTIONS.map((s) => <option key={s.value} value={s.value}>{s.title}</option>)}
            </Select>
          </Field>
          <Field label="Platform" hint="Decides the icon and which app opens">
            <Select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Main entrance rules explained" /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Subtitle" hint="Optional one-liner under the title">
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Link" hint="The direct video or page URL">
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://youtu.be/…" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Thumbnail URL" hint="Optional; shown next to the title in the app">
              <Input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} />
            </Field>
          </div>
          <Field label="Order"><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></Field>
          <div className="flex items-end">
            <label className="flex items-center gap-2 pb-2 text-sm text-ink/80">
              <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Visible in the app
            </label>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save link'}</Button>
        </div>
      </Modal>
    </div>
  );
}
