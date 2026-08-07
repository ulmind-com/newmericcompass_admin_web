import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/admin';
import { Card, Spinner } from '../components/ui';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    adminApi.getUsers(page, 10)
      .then((data) => {
        setUsers(data.users);
        setTotalPages(Math.ceil(data.total_count / data.page_size) || 1);
        setError(null);
      })
      .catch(() => setError('Failed to fetch users.'))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading && users.length === 0) return <Spinner label="Loading users…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">Users</h1>
        <p className="text-sm text-ink/50">App users and their subscription status.</p>
      </div>
      {error && <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50/60 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                {['User', 'Joined', 'Subscription', 'Status'].map((h) => <th key={h} className="px-6 py-3 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-brand-50/40">
                  <td className="px-6 py-4">
                    <div className="font-medium text-ink">{u.name}</div>
                    <div className="text-ink/50">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-ink/60">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.is_premium ? 'bg-gold/20 text-maroon' : 'bg-gray-100 text-gray-600'}`}>
                      {u.is_premium ? 'Premium' : 'Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.status === 'active' ? 'bg-hgreen/10 text-hgreen' : 'bg-red-100 text-red-700'}`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="4" className="px-6 py-10 text-center text-ink/40">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-brand-100 px-6 py-3 text-sm">
          <span className="text-ink/60">Page <b>{page}</b> of <b>{totalPages}</b></span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-brand-100 px-3 py-1 disabled:opacity-40">Previous</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-brand-100 px-3 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
