import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Image as ImageIcon, X } from 'lucide-react';
import { adminApi } from '../api/admin';
import { Button, Card, Spinner, VerdictBadge } from '../components/ui';
import Modal from '../components/Modal';

const STATUS_STYLE = {
  new: 'bg-brand-100 text-brand-700',
  in_review: 'bg-amber-100 text-amber-700',
  report_sent: 'bg-hgreen/10 text-hgreen',
};

export default function SubmissionsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.getSubmissions(page, 20)
      .then((d) => { setRows(d.submissions); setTotalPages(Math.ceil(d.total_count / d.page_size) || 1); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]);

  const setStatus = async (id, status) => {
    await adminApi.updateSubmissionStatus(id, status);
    setOpen((o) => (o ? { ...o, status } : o));
    load();
  };

  if (loading && !rows.length) return <Spinner label="Loading submissions…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">Submissions</h1>
        <p className="text-sm text-ink/50">Property scans sent by users — details, directions and photos.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50/60 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>{['User', 'Property', 'Placements', 'Photos', 'Status', 'Date'].map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {rows.map((s) => {
                const photos = (s.items || []).reduce((n, it) => n + (it.images?.length || 0), 0);
                return (
                  <tr key={s.id} className="cursor-pointer hover:bg-brand-50/40" onClick={() => setOpen(s)}>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-ink">{s.name || '—'}</div>
                      <div className="text-ink/50">{s.whatsapp || s.email || ''}</div>
                    </td>
                    <td className="max-w-xs truncate px-5 py-3 text-ink/70">{s.address || s.title || '—'}</td>
                    <td className="px-5 py-3 text-ink/70">{s.items?.length || 0}</td>
                    <td className="px-5 py-3 text-ink/70">{photos}</td>
                    <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[s.status] || STATUS_STYLE.new}`}>{(s.status || 'new').replace('_', ' ')}</span></td>
                    <td className="px-5 py-3 text-ink/60">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan="6" className="px-6 py-10 text-center text-ink/40">No submissions yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-brand-100 px-5 py-3 text-sm">
          <span className="text-ink/60">Page <b>{page}</b> of <b>{totalPages}</b></span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-brand-100 px-3 py-1 disabled:opacity-40">Previous</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-brand-100 px-3 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </Card>

      <Modal open={!!open} onClose={() => setOpen(null)} maxWidth="max-w-2xl" title={open?.name ? `${open.name}'s Property` : 'Submission'}
        footer={open && <>
          <Button variant="outline" onClick={() => setStatus(open.id, 'in_review')}>Mark in review</Button>
          <Button onClick={() => setStatus(open.id, 'report_sent')}>Mark report sent</Button>
        </>}>
        {open && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 rounded-xl bg-brand-50/50 p-4 sm:grid-cols-2">
              {open.whatsapp && <Info icon={Phone} label="WhatsApp" value={open.whatsapp} />}
              {open.email && <Info icon={Mail} label="Email" value={open.email} />}
              {open.address && <Info icon={MapPin} label="Address" value={open.address} />}
              <Info icon={ImageIcon} label="Submitted" value={new Date(open.created_at).toLocaleString()} />
            </div>

            <div className="space-y-3">
              {(open.items || []).map((it, i) => (
                <div key={i} className="rounded-xl border border-brand-100 p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-ink">{it.category_name || it.category_slug}</div>
                    <div className="flex items-center gap-2 text-sm text-ink/60">
                      {it.direction16} · {it.degree?.toFixed(1)}° {it.verdict && <VerdictBadge verdict={it.verdict} />}
                    </div>
                  </div>
                  {it.latitude != null && it.longitude != null ? (
                    <a className="mt-1 inline-block text-xs font-medium text-brand-700 hover:underline"
                      href={`https://www.google.com/maps?q=${it.latitude},${it.longitude}`}
                      target="_blank" rel="noreferrer">
                      📍 {it.latitude.toFixed(5)}, {it.longitude.toFixed(5)}
                      {it.accuracy ? ` (±${Math.round(it.accuracy)}m)` : ''}
                    </a>
                  ) : null}
                  {it.images?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {it.images.map((url, k) => (
                        <img key={k} src={url} alt="" onClick={() => setLightbox(url)}
                          className="h-20 w-20 cursor-pointer rounded-lg border border-brand-100 object-cover hover:opacity-80" />
                      ))}
                    </div>
                  ) : <div className="mt-1 text-xs text-ink/40">No photos</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-6" onClick={() => setLightbox(null)}>
          <button className="absolute right-5 top-5 text-white/80 hover:text-white"><X size={28} /></button>
          <img src={lightbox} alt="" className="max-h-[90vh] max-w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className="mt-0.5 text-brand-500" />
      <div>
        <div className="text-xs font-semibold uppercase text-ink/40">{label}</div>
        <div className="text-sm text-ink/80">{value}</div>
      </div>
    </div>
  );
}
