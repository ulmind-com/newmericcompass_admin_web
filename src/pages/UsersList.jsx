import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { adminApi } from '../api/admin';
import { Card, Spinner } from '../components/ui';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    adminApi.getUsers(page, 10)
      .then((data) => {
        setUsers(data.users);
        setTotalPages(Math.ceil(data.total_count / data.page_size) || 1);
        setTotalCount(data.total_count || 0);
        setError(null);
      })
      .catch(() => setError('Failed to fetch users.'))
      .finally(() => setLoading(false));
  }, [page]);

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(lowerSearch);
    const emailMatch = u.email?.toLowerCase().includes(lowerSearch);
    return nameMatch || emailMatch;
  });

  if (loading && users.length === 0) return <Spinner label="Loading users…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">Users</h1>
        <p className="text-sm text-ink/50">App users and their subscription status ({totalCount} total).</p>
      </div>
      {error && <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      <div className="relative max-w-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-ink/40" />
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full rounded-lg border border-brand-100 bg-white py-2 pl-10 pr-3 text-sm text-ink placeholder:text-ink/40 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50/60 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                {['User', 'WhatsApp', 'Joined', 'Subscription', 'Status'].map((h) => <th key={h} className="px-6 py-3 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-brand-50/40">
                  <td className="px-6 py-4">
                    <div className="font-medium text-ink">{u.name}</div>
                    <div className="text-ink/50">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-ink/60">{u.whatsapp || '—'}</td>
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
              {filteredUsers.length === 0 && <tr><td colSpan="5" className="px-6 py-10 text-center text-ink/40">No users found.</td></tr>}
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
