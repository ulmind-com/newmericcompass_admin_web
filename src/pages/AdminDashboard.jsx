import React, { useEffect, useState } from 'react';
import { Users, Compass, Award, IndianRupee } from 'lucide-react';
import { adminApi } from '../api/admin';
import { Card, Spinner } from '../components/ui';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading analytics…" />;
  if (error) return <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>;

  const cards = [
    { title: 'Total Users', value: stats?.total_users ?? 0, icon: Users },
    { title: 'Vastu Scans', value: stats?.total_scans ?? 0, icon: Compass },
    { title: 'Premium Users', value: stats?.premium_users ?? 0, icon: Award },
    { title: 'Revenue', value: `₹${(stats?.revenue ?? 0).toFixed(2)}`, icon: IndianRupee },
  ];

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

      <Card className="flex h-80 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
            <Compass size={26} />
          </div>
          <p className="text-ink/40">Activity charts coming soon.</p>
        </div>
      </Card>
    </div>
  );
}
