import React, { useEffect, useState } from 'react';
import { Users, Compass, Award, IndianRupee, Inbox, Clock, UserPlus } from 'lucide-react';
import { adminApi } from '../api/admin';
import { Card, Spinner } from '../components/ui';

const STATUS_STYLE = {
  pending: 'bg-amber-50 text-amber-600 ring-1 ring-amber-600/20',
  processing: 'bg-blue-50 text-blue-600 ring-1 ring-blue-600/20',
  completed: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-600 ring-1 ring-red-600/20',
};

const USER_STATUS_STYLE = {
  active: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/20',
  suspended: 'bg-red-50 text-red-600 ring-1 ring-red-600/20',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      adminApi.getSubmissions(1, 5),
      adminApi.getUsers(1, 5)
    ])
      .then(([statsData, submissionsData, usersData]) => {
        setStats(statsData);
        setRecentSubmissions(submissionsData.submissions || []);
        setRecentUsers(usersData.users || []);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (error) return <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>;

  const cards = [
    { title: 'Total Users', value: stats?.total_users ?? 0, icon: Users },
    { title: 'Vastu Scans', value: stats?.total_scans ?? 0, icon: Compass },
    { title: 'Premium Users', value: stats?.premium_users ?? 0, icon: Award },
    { title: 'Revenue', value: `₹${(stats?.revenue ?? 0).toFixed(2)}`, icon: IndianRupee },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">Dashboard</h1>
        <p className="text-sm text-ink/50">Overview of your Newmeric Compass app.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl brand-gradient text-white shadow">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{c.title}</p>
                  <h3 className="text-2xl font-black text-ink">{c.value}</h3>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Inbox size={20} className="text-brand-500" />
            <h2 className="text-lg font-bold text-ink">Recent Submissions</h2>
          </div>
          <div className="divide-y divide-ink/5">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between hover:bg-ink/5 -mx-5 px-5 transition-colors">
                  <div>
                    <p className="font-semibold text-ink">{sub.name}</p>
                    <p className="text-xs text-ink/50">{sub.title || sub.address}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-ink/40">
                      <Clock size={12} />
                      <span>{formatDate(sub.created_at)}</span>
                      <span>•</span>
                      <span>{sub.items?.length || 0} items</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[sub.status] || STATUS_STYLE.pending}`}>
                    {sub.status || 'pending'}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-ink/40">No recent submissions.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-brand-500" />
            <h2 className="text-lg font-bold text-ink">Recent Users</h2>
          </div>
          <div className="divide-y divide-ink/5">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.id} className="py-3 flex items-center justify-between hover:bg-ink/5 -mx-5 px-5 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink">{user.name}</p>
                      {user.is_premium && (
                        <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-600">PRO</span>
                      )}
                    </div>
                    <p className="text-xs text-ink/50">{user.email}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-ink/40">
                      <Clock size={12} />
                      <span>{formatDate(user.created_at)}</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${USER_STATUS_STYLE[user.status] || USER_STATUS_STYLE.active}`}>
                    {user.status || 'active'}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-ink/40">No recent users.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
