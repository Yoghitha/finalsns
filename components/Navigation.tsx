
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isAuthenticated, onLogout }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Display name hierarchy: Metadata Full Name -> Metadata Name -> Email -> User
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAALZNQbOCJFBHcQkicLb3sl7BxKx2Z2VxPWXKAggEtA_llRTC6TlvoctXEDFF6jSSA35CzHt4oQ--00P2_TPLFB3tP3sFmrCxooC9t4XfIfViRPR5F-zJsxwzhJOymPfNn4zw-gSYHwFA-kJ2ls-oQ2i9k_953gHYZs4gUR5dUCdXPW0J_FZny7mbIsGsoOpB5qj6CWOJ0KtHELg73RavwWZacwlU7t5q8E17KBLJ9hQFO06uyeKwNKM0d4dcfVzzCP499ZoSWZ9mH";

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">layers</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">SubFlow</span>
            </Link>
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-6 text-sm font-medium h-full">
                <Link
                  to="/portal/dashboard"
                  className={`${isActive('/portal/dashboard') ? 'text-primary border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white'} py-5 transition-colors`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/portal/shop"
                  className={`${isActive('/portal/shop') ? 'text-primary border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white'} py-5 transition-colors`}
                >
                  Catalog
                </Link>
                <Link
                  to="/portal/orders"
                  className={`${isActive('/portal/orders') ? 'text-primary border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white'} py-5 transition-colors`}
                >
                  My Orders
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/portal/cart" className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <span className="material-symbols-outlined">shopping_cart</span>
                  <span className="absolute top-1 right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">3</span>
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 py-1 px-3 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                      <img alt="User avatar" src={avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{displayName}</span>
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-2 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                    <Link to="/portal/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <span className="material-symbols-outlined text-sm mr-2">person</span> My Profile
                    </Link>
                    <Link to="/portal/orders" className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <span className="material-symbols-outlined text-sm mr-2">receipt_long</span> My Orders
                    </Link>
                    <hr className="my-1 border-slate-100 dark:border-slate-800" />
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <span className="material-symbols-outlined text-sm mr-2">logout</span> Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary">Sign In</Link>
                <Link to="/signup" className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
