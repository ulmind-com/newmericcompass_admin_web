import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import { Spinner } from './components/ui';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CategoriesPage from './pages/CategoriesPage';
import PadasPage from './pages/PadasPage';
import RulesPage from './pages/RulesPage';
import SubmissionsPage from './pages/SubmissionsPage';
import PlansPage from './pages/PlansPage';
import RevenuePage from './pages/RevenuePage';
import AccessPage from './pages/AccessPage';
import TipsPage from './pages/TipsPage';
import UsersList from './pages/UsersList';

function Protected({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <Spinner label="Loading…" />;
  return admin ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><AdminLayout /></Protected>}>
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="padas" element={<PadasPage />} />
            <Route path="rules" element={<RulesPage />} />
            <Route path="submissions" element={<SubmissionsPage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="access" element={<AccessPage />} />
            <Route path="tips" element={<TipsPage />} />
            <Route path="users" element={<UsersList />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
