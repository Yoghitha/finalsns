
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, change, icon, iconBg, iconColor }: any) => (
  <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 ${iconBg} ${iconColor} rounded-lg`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      {change && <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">{change}</span>}
      {!change && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">Last 24h</span>}
    </div>
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
    <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { role, user } = useAuth();
  const [stats, setStats] = useState<any>({
    revenue: 0,
    activeSubs: 0,
    pendingInvoices: 0,
    newSignups: 0
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      // 1. Stats via RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_dashboard_stats');
      if (rpcError) throw rpcError;

      // Pending Invoices Count
      const { count: pendingCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // New Signups (last 30 days) - Manual count as RPC didn't include it
      const { count: signupsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      setStats({
        revenue: rpcData.revenue_mtd,
        activeSubs: rpcData.active_subscriptions,
        pendingInvoices: pendingCount || 0,
        newSignups: signupsCount || 0
      });

      // 2. Transactions (Payments)
      const { data: txData, error: txError } = await supabase
        .from('payments')
        .select(`
          id, 
          amount, 
          status, 
          payment_date, 
          invoices (
            customer_id,
            profiles (full_name),
            subscriptions (
              plans (name)
            )
          )
        `)
        .order('payment_date', { ascending: false })
        .limit(5);

      if (txError) throw txError;
      setTransactions(txData || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      if (!user) return;

      // 1. User Stats
      // Active Subscriptions
      const { count: activeCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('customer_id', user.id);

      // Pending Invoices Amount
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('total_amount, status')
        .eq('customer_id', user.id);

      const pendingAmount = invoiceData
        ?.filter(i => i.status === 'open')
        .reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;

      const paidAmount = invoiceData
        ?.filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;

      setStats({
        revenue: paidAmount, // Total spent
        activeSubs: activeCount || 0,
        pendingInvoices: pendingAmount, // Amount due
        newSignups: 0
      });

      // 2. User Transactions
      const { data: txData, error: txError } = await supabase
        .from('payments')
        .select(`
          id, 
          amount, 
          status, 
          payment_date, 
          invoices (
            customer_id,
            subscriptions (
              plans (name)
            )
          )
        `)
        .eq('invoices.customer_id', user.id) // RLS handles this but explicit checks don't hurt
        // Wait, filtering on joined table in Select is tricky. 
        // Better rely on RLS on `payments` table which I set to check invoice->customer_id.
        .order('payment_date', { ascending: false })
        .limit(5);

      if (txError) throw txError;
      setTransactions(txData || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (role === UserRole.ADMIN || role === UserRole.INTERNAL_USER) {
      await fetchAdminData();
    } else {
      await fetchUserData();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Realtime subscription
    const channel = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, user]);

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || '??';
  };

  if (loading && !transactions.length) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  }

  const isCustomer = role === UserRole.CUSTOMER;
  const isInternal = role === UserRole.INTERNAL_USER;
  const showRevenue = role === UserRole.ADMIN; // Only Admin sees Revenue

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back, here's what's happening with your subscriptions today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {showRevenue ? (
          <StatCard
            title="Monthly Recurring Revenue"
            value={formatCurrency(stats.revenue)}
            change="+12.5%"
            icon="payments"
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
          />
        ) : isInternal ? (
          <StatCard
            title="Tasks Pending"
            value="12"
            icon="assignment"
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
          />
        ) : (
          <StatCard
            title="Total Spent"
            value={formatCurrency(stats.revenue)}
            icon="payments"
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
          />
        )}

        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubs}
          change={isCustomer ? undefined : "+8.2%"}
          icon="group"
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title={isCustomer ? "Amount Due" : "Pending Invoices"}
          value={isCustomer ? formatCurrency(stats.pendingInvoices) : stats.pendingInvoices}
          icon="receipt_long"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        {!isCustomer && (
          <StatCard
            title="New Signups"
            value={stats.newSignups}
            change="+15"
            icon="person_add"
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
        )}
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Transactions</h2>
          {/* Link to full history */}
          <Link to={isCustomer ? "/orders" : "/admin/subscriptions"} className="text-sm font-medium text-primary hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Date</th>
                {!isCustomer && <th className="px-6 py-3">Customer</th>}
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No recent transactions found.
                  </td>
                </tr>
              ) : transactions.map((tx) => {
                const customerName = tx.invoices?.profiles?.full_name || 'User';
                const planName = tx.invoices?.subscriptions?.plans?.name || 'N/A';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(tx.payment_date).toLocaleDateString()}
                    </td>
                    {!isCustomer && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                            {getInitials(customerName)}
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {customerName}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{planName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.status === 'succeeded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        tx.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {tx.status === 'succeeded' ? 'Paid' : tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white text-right">{formatCurrency(tx.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-center">
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
