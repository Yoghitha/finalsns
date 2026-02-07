
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-10">
        <div className="flex space-x-8">
          <button className="pb-4 text-sm font-semibold border-b-2 border-primary text-primary flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</span>
            Order
          </button>
          <button className="pb-4 text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 hover:text-slate-700 dark:hover:text-slate-300">
            <span className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 text-xs flex items-center justify-center">2</span>
            Address
          </button>
          <button className="pb-4 text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 hover:text-slate-700 dark:hover:text-slate-300">
            <span className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 text-xs flex items-center justify-center">3</span>
            Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <h1 className="text-2xl font-bold mb-6">Review your order</h1>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row gap-6 items-center sm:items-start group">
            <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              <img alt="Enterprise Analytics Pro" className="object-cover w-full h-full opacity-80 group-hover:scale-110 transition-transform duration-300" src="https://picsum.photos/seed/analytics/300/300"/>
            </div>
            <div className="flex-grow space-y-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-lg">Enterprise Analytics Pro</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Billed daily • Recurring subscription</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xl">1,200 <span className="text-xs font-normal">rs / day</span></span>
                </div>
              </div>
              <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-between gap-4">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button className="px-3 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-icons-outlined text-sm">remove</span>
                  </button>
                  <input className="w-12 text-center border-0 bg-transparent text-sm focus:ring-0" type="number" defaultValue="1"/>
                  <button className="px-3 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-icons-outlined text-sm">add</span>
                  </button>
                </div>
                <button className="flex items-center gap-1 text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium">
                  <span className="material-icons-outlined text-lg">delete_outline</span>
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 p-5 rounded-xl flex flex-col sm:flex-row gap-6 items-center sm:items-start group relative">
            <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              <span className="material-icons-outlined text-blue-500 text-4xl">local_offer</span>
            </div>
            <div className="flex-grow space-y-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-lg text-blue-700 dark:text-blue-400">Early Adopter Discount</h3>
                  <p className="text-sm text-blue-600/70 dark:text-blue-400/70">10% Off your recurring order</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xl text-blue-700 dark:text-blue-400">-120 <span className="text-xs font-normal">rs</span></span>
                </div>
              </div>
              <div className="pt-4 flex justify-center sm:justify-end">
                <button className="flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-sm font-medium">
                  <span className="material-icons-outlined text-lg">close</span>
                  Remove discount
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900 dark:text-white">1,080 rs</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Taxes (11.1%)</span>
                <span className="font-medium text-slate-900 dark:text-white">120 rs</span>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-black text-primary">1,200 <span className="text-sm font-normal text-slate-500">rs</span></span>
              </div>
            </div>
            <div className="mb-6 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Discount Code</label>
              <div className="flex gap-2">
                <input className="flex-grow bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary" placeholder="Enter code" type="text" defaultValue="WELCOME10"/>
                <button className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
                  Apply
                </button>
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2.5 rounded-lg border border-green-100 dark:border-green-900/30">
                <span className="material-icons-outlined text-sm">check_circle</span>
                <span className="text-xs font-medium">Discount 'WELCOME10' successfully applied!</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/confirmation')}
              className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
            >
              <span className="material-icons-outlined">lock</span>
              Checkout Now
            </button>
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Secure 256-bit encrypted payment gateway.
              <br/>You won't be charged until the next step.
            </p>
          </div>
          <div className="mt-6 p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-4 bg-white/50 dark:bg-slate-900/50">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <span className="material-icons-outlined">support_agent</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Need help?</p>
              <p className="text-xs text-slate-500">Contact our expert support team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
