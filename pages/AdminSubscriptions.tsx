
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AdminSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [stats, setStats] = useState({
    active: 0,
    quotations: 0,
    churn: 0
  });

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans (name, price, billing_interval),
          profiles (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);

      // Calculate Stats
      const active = data?.filter(s => s.status === 'active').length || 0;
      const quotes = data?.filter(s => s.status === 'quotation').length || 0;
      // Churn is hard to calc from just list without history, 
      // but we can count 'closed' vs total for now as a proxy or just show 0
      const closed = data?.filter(s => s.status === 'closed').length || 0;
      const total = data?.length || 1;
      const churnRate = ((closed / total) * 100).toFixed(1);

      setStats({
        active,
        quotations: quotes,
        churn: Number(churnRate)
      });

    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();

    const channel = supabase
      .channel('admin_subs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
        fetchSubscriptions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredSubs = filter === 'All'
    ? subscriptions
    : subscriptions.filter(s => s.status.toLowerCase() === filter.toLowerCase());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Subscriptions</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and monitor subscription lifecycles across your organization.</p>
        </div>
        <button className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all">
          <span className="material-symbols-outlined">add</span>
          New Subscription
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500">Active Subscriptions</p>
          <p className="text-2xl font-bold mt-1">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500">Pending Quotations</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">{stats.quotations}</p>
        </div>
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500">Churn Rate (All Time)</p>
          <p className="text-2xl font-bold mt-1 text-red-500">{stats.churn}%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-500">Filter By Status:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {['All', 'Active', 'Quotation', 'Closed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${filter === s ? 'bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-blue-400' : 'text-slate-500'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4 text-center">Next Billing</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Monthly Rev</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading subscriptions...</td>
                </tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No subscriptions found.</td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-primary dark:text-blue-400">
                      {sub.subscription_number ? `#${sub.subscription_number}` : sub.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {sub.profiles?.full_name || sub.profiles?.email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {sub.plans?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 text-center">
                      {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${sub.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                          sub.status === 'quotation' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' :
                            'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right">
                      {formatCurrency(sub.plans?.price || 0)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
