import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import VastuRulesPage from './pages/VastuRulesPage';

import AdminDashboard from './pages/AdminDashboard';
import UsersList from './pages/UsersList';

// Placeholder for Login
const Login = () => <div className="p-10 text-center">Login Page (To be implemented) <br/><br/> <a href="/" className="text-blue-500">Go to Dashboard</a></div>;
const Tips = () => <div className="p-6">Daily Tips Manager (Coming soon)</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Protected Routes */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="rules" element={<VastuRulesPage />} />
          <Route path="users" element={<UsersList />} />
          <Route path="tips" element={<Tips />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
