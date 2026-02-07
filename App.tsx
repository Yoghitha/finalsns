
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { UserRole } from './types';
import { useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
// Sidebar import removed as it is used inside layouts
import AdminLayout from './components/layouts/AdminLayout';
import InternalLayout from './components/layouts/InternalLayout';
import CustomerLayout from './components/layouts/CustomerLayout';
import Sidebar from './components/Sidebar'; // Keep if needed for imports, but logic moved to layout
import Dashboard from './pages/Dashboard';
import ProductCatalog from './pages/ProductCatalog';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import UserProfile from './pages/UserProfile';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import InvoiceDetail from './pages/InvoiceDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminCustomers from './pages/AdminCustomers';
import LandingPage from './pages/LandingPage';
import Reports from './pages/Reports';

const RoleBasedRedirect = () => {
  const { role, loading } = useAuth();

  if (loading) return null;

  switch (role) {
    case UserRole.ADMIN:
      return <Navigate to="/admin" replace />;
    case UserRole.INTERNAL_USER:
      return <Navigate to="/internal" replace />;
    case UserRole.CUSTOMER:
      return <Navigate to="/portal/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App: React.FC = () => {
  const { session, loading } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={session ? <RoleBasedRedirect /> : <Login />} />
        <Route path="/signup" element={session ? <RoleBasedRedirect /> : <Signup />} />
        <Route path="/unauthorized" element={<div className="p-10 text-center text-red-600">Unauthorized Access</div>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="products" element={<ProductCatalog />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>

        {/* Internal Routes */}
        <Route path="/internal" element={<InternalLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>

        {/* Customer Routes */}
        {/* Customer Routes */}
        <Route path="/portal" element={<CustomerLayout />}>
          <Route index element={<Navigate to="/portal/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="order/:id" element={<OrderDetails />} />
          <Route path="shop" element={<ProductCatalog />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Checkout />} />
          <Route path="confirmation" element={<OrderConfirmation />} />
          <Route path="invoice/:id" element={<InvoiceDetail />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <button
        className="fixed bottom-6 right-6 p-3 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-full shadow-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all z-[60] focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => setIsDarkMode(!isDarkMode)}
        aria-label="Toggle Dark Mode"
      >
        <span className="material-symbols-outlined block dark:hidden">dark_mode</span>
        <span className="material-symbols-outlined hidden dark:block">light_mode</span>
      </button>
    </>
  );
};

export default App;
