
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderDetails: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 dark:text-slate-400 mb-2">
            <ol className="flex items-center space-x-2">
              <li><Link className="hover:text-primary" to="/orders">Orders</Link></li>
              <li className="flex items-center"><span className="material-icons text-base">chevron_right</span></li>
              <li className="font-medium text-slate-900 dark:text-slate-200">{id}</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Order / {id}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Active</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <span className="material-icons text-lg">download</span>
            Download PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all">
            <span className="material-icons text-lg">cancel</span>
            Cancel Subscription
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <span className="material-icons">card_membership</span>
                <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest">Your Subscription</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline border-b border-slate-50 dark:border-slate-800 pb-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Plan</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Business Professional Plus</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-slate-50 dark:border-slate-800 pb-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Billing Cycle</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Next Renewal</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Oct 24, 2026</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <span className="material-icons">local_shipping</span>
                <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest">Invoicing & Shipping</h3>
              </div>
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <p className="font-semibold text-slate-900 dark:text-white">Alex Rivera</p>
                <p>123 Innovation Drive, Tech Park</p>
                <p>San Francisco, CA 94105</p>
                <p className="pt-2"><span className="text-slate-400">Email:</span> alex.r@company.io</p>
                <p><span className="text-slate-400">Phone:</span> +1 (555) 012-3456</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Last Invoices</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30">
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Invoice Number</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-primary hover:underline cursor-pointer">
                      <Link to="/invoice/INV-2026-001">INV-2026-001</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Feb 22, 2026</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white text-right">₹ 2,640.00</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">Paid</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-primary hover:underline cursor-pointer">
                      <Link to="/invoice/INV-2026-000">INV-2026-000</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Jan 22, 2026</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white text-right">₹ 2,640.00</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">Paid</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Order Summary</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Untaxed Amount</span>
                <span className="font-medium text-slate-900 dark:text-white">2280 Rs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Tax 15%</span>
                <span className="font-medium text-slate-900 dark:text-white">360 Rs</span>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary">₹ 2,640</span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Paid via Credit Card</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6">
              <div className="flex items-start gap-3">
                <span className="material-icons text-slate-400 text-lg">info</span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This order is under our standard <a className="text-primary underline" href="#">Subscription Agreement</a>. Renewal will happen automatically using your primary payment method.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
