
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Fetch Invoices as Orders
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Realtime subscription
    const channel = supabase
      .channel('order_history_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `customer_id=eq.${user.id}` }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'draft': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400';
      case 'void': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <nav aria-label="Breadcrumb" className="flex mb-2">
            <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link className="hover:text-primary" to="/profile">Account</Link></li>
              <li className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span>Invoices</span>
              </li>
            </ol>
          </nav>
          <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">Invoice History</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="p-6 text-center text-slate-500">Loading invoices...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-slate-500">No invoices found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link className="text-sm font-bold text-primary dark:text-blue-400 hover:underline" to={`/invoice/${order.id}`}>
                        {order.invoice_number ? `#${order.invoice_number}` : order.id.substring(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-slate-900 dark:text-white">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/invoice/${order.id}`} className="text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">chevron_right</span>
                      </Link>
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

export default OrderHistory;
