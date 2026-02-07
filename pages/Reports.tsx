
import React from 'react';

const Reports: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revenue Reports</h1>
        <p className="text-slate-500 dark:text-slate-400">Deep dive into your business growth and subscription performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-card-dark p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">MRR Growth</h3>
            <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-bold">
              <option>Last 12 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-4">
            {[40, 60, 45, 90, 80, 100, 120, 110, 140, 130, 160, 180].map((val, i) => (
              <div key={i} className="group relative flex-1">
                <div 
                  className="bg-primary/20 group-hover:bg-primary transition-all rounded-t-lg" 
                  style={{ height: `${val}px` }}
                ></div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{val * 1000}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Jan</span>
            <span>Jun</span>
            <span>Dec</span>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Churn Analysis</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Expansion Revenue</span>
                <span className="text-emerald-600 font-bold">+₹12,400</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Contraction Revenue</span>
                <span className="text-amber-600 font-bold">-₹2,100</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Churned Revenue</span>
                <span className="text-red-600 font-bold">-₹4,500</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-12 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Net Revenue Retention</p>
            <p className="text-3xl font-black text-primary">104.2%</p>
            <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              +2.1% from last month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
