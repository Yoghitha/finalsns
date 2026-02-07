
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Define base path based on role
  const getBasePath = () => {
    switch (role) {
      case 'admin': return '/admin';
      case 'internal': return '/internal';
      default: return '';
    }
  };

  const basePath = getBasePath();

  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', path: basePath || '/dashboard', allowed: ['admin', 'internal'] },
    { name: 'Subscriptions', icon: 'subscriptions', path: `${basePath}/subscriptions`, allowed: ['admin', 'internal'] },
    { name: 'Customers', icon: 'group', path: `${basePath}/customers`, allowed: ['admin', 'internal'] },
    { name: 'Products', icon: 'inventory_2', path: `${basePath}/products`, allowed: ['admin'] },
    { name: 'Reports', icon: 'bar_chart', path: `${basePath}/reports`, allowed: ['admin'] },
  ];

  // If role is null (loading), show nothing or minimal
  if (!role) return null;

  const visibleItems = menuItems.filter(item => item.allowed.includes(role));

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 hidden lg:flex flex-col sticky top-0 h-screen">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white">bolt</span>
        </div>
        <span className="text-xl font-bold tracking-tight">SubFlow Pro</span>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {visibleItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
              ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-primary text-primary dark:text-blue-400 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-sm">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
