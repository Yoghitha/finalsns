
import React from 'react';
import { Link } from 'react-router-dom';

const OrderConfirmation: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                Thank you for your order
              </h1>
              <p className="text-xl font-medium text-slate-500 dark:text-slate-400">
                Order <span className="text-primary dark:text-blue-400">#S0001</span>
              </p>
            </div>
            <button className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold rounded shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <span className="material-symbols-outlined mr-2">print</span>
              Print Receipt
            </button>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-6 rounded-xl flex items-start gap-4 shadow-sm">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
              <span className="material-symbols-outlined">check</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-400">Payment Successful</h3>
              <p className="text-emerald-700 dark:text-emerald-500/80">Your payment has been processed and your subscription is now active. A confirmation email has been sent to your registered address.</p>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>
              Next Steps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/" className="p-5 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-primary transition-colors cursor-pointer group block">
                <h4 className="font-bold group-hover:text-primary dark:group-hover:text-blue-400">Visit Dashboard</h4>
                <p className="text-sm text-slate-500 mt-1">Start configuring your workspace right away.</p>
              </Link>
              <Link to="/orders" className="p-5 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-primary transition-colors cursor-pointer group block">
                <h4 className="font-bold group-hover:text-primary dark:group-hover:text-blue-400">Manage Subscription</h4>
                <p className="text-sm text-slate-500 mt-1">Review your plan details and billing dates.</p>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-24">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Order Summary</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 relative">
                <div className="relative">
                  <img alt="SaaS Product" className="w-16 h-16 rounded-lg object-cover bg-slate-100 dark:bg-slate-800" src="https://picsum.photos/seed/summary/200/200"/>
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-900">1</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Professional Plan</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Monthly Billing</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">₹1,200</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-3xl">sell</span>
                </div>
                <div className="flex-grow text-emerald-600 dark:text-emerald-400">
                  <h3 className="font-semibold">WELCOME10</h3>
                  <p className="text-xs">10% off on your order</p>
                </div>
                <div className="text-right text-emerald-600 dark:text-emerald-400">
                  <p className="font-bold">-₹120</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-medium">₹1,080</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Taxes (12% GST)</span>
                  <span className="font-medium">₹120</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">Total</span>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">INR</span>
                    <span className="text-3xl font-bold text-primary dark:text-white">₹1,200</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center gap-4">
              <span className="material-symbols-outlined text-slate-400">shield</span>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Secure Payment Secured by Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
