import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Grid3x3, Compass, ScrollText, Inbox, Lightbulb, Users, LogOut,
  Tag, IndianRupee, KeyRound, Link2, CalendarDays,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/categories', label: 'Categories', icon: Grid3x3 },
  { to: '/padas', label: 'Padas (N5)', icon: Compass },
  { to: '/rules', label: 'Vastu Rules', icon: ScrollText },
  { to: '/submissions', label: 'Submissions', icon: Inbox },
  { to: '/plans', label: 'Plans & Pricing', icon: Tag },
  { to: '/revenue', label: 'Revenue', icon: IndianRupee },
  { to: '/access', label: 'Access', icon: KeyRound },
  { to: '/days', label: 'Day-Wise Remedy', icon: CalendarDays },
  { to: '/app-content', label: 'App Content', icon: Link2 },
  { to: '/tips', label: 'Daily Tips', icon: Lightbulb },
  { to: '/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-64 flex-col bg-ink text-white/90">
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient font-black text-white shadow">N5</div>
          <div>
            <div className="text-sm font-bold leading-tight">Newmeric Compass</div>
            <div className="text-xs text-white/50">Admin Panel</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'brand-gradient text-white shadow' : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-brand-100 bg-white/70 px-8 backdrop-blur">
          <h2 className="text-lg font-bold text-ink">Control Panel</h2>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-ink/60">{admin?.name || admin?.email || 'Admin'}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-xs font-bold text-white">
              {(admin?.name || admin?.email || 'A')[0].toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
