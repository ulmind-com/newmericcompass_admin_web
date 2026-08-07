import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Newmeric Admin</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => 
                  `block px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/rules" 
                className={({ isActive }) => 
                  `block px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                }
              >
                Vastu Rules
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/users" 
                className={({ isActive }) => 
                  `block px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                }
              >
                Users
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/tips" 
                className={({ isActive }) => 
                  `block px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                }
              >
                Daily Tips
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 z-10">
          <h2 className="text-lg font-semibold text-gray-700">Control Panel</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">Admin User</span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
