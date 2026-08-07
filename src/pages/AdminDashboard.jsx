import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Users, Search, Award, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-500">Loading Analytics...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  }

  const cards = [
    { title: "Total Users", value: stats?.total_users || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Vastu Scans", value: stats?.total_scans || 0, icon: Search, color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "Premium Users", value: stats?.premium_users || 0, icon: Award, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Revenue", value: `$${stats?.revenue?.toFixed(2) || '0.00'}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className={`p-4 rounded-full ${card.bg}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder for future charts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex items-center justify-center">
        <p className="text-gray-400">Activity Chart Placeholder</p>
      </div>
    </div>
  );
}
