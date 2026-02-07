
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [quantity, setQuantity] = useState(1);

  const isAdmin = role === UserRole.ADMIN;
  const backLink = isAdmin ? '/admin/products' : '/shop';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="mb-8 flex items-center text-sm text-slate-500 dark:text-slate-400">
        <Link className="hover:text-primary" to={backLink}>All products</Link>
        <span className="mx-2">/</span>
        <span className="hover:text-primary">Cloud Infrastructure</span>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-white font-medium">Cloud Storage Suite</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 flex gap-6">
          <div className="flex flex-col gap-4 w-20 shrink-0">
            <button className="w-20 h-20 rounded-lg border-2 border-primary overflow-hidden bg-white dark:bg-card-dark p-1">
              <img alt="Thumbnail 1" className="w-full h-full object-cover rounded" src="https://picsum.photos/seed/storage1/200/200" />
            </button>
            <button className="w-20 h-20 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-card-dark p-1 hover:border-slate-400">
              <img alt="Thumbnail 2" className="w-full h-full object-cover rounded" src="https://picsum.photos/seed/storage2/200/200" />
            </button>
            <button className="w-20 h-20 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-card-dark p-1 hover:border-slate-400">
              <img alt="Thumbnail 3" className="w-full h-full object-cover rounded" src="https://picsum.photos/seed/storage3/200/200" />
            </button>
          </div>
          <div className="flex-grow aspect-square bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex items-center justify-center p-8">
            <img alt="Cloud Storage Suite" className="w-full h-full object-contain" src="https://picsum.photos/seed/cloudmain/600/600" />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="mb-2">
            <span className="text-xs font-bold tracking-wider text-primary uppercase bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">Best Seller</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Cloud Storage Suite</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Secure, high-speed distributed storage for modern enterprises. Scalable up to 10PB with built-in redundancy.</p>

          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Plan Term</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Total Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { id: 'monthly', label: 'Monthly', total: '₹1,200', rate: '₹1,200/mo', save: '' },
                  { id: '6mo', label: '6 Months', total: '₹5,760', rate: '₹960/mo', save: 'SAVE 20%' },
                  { id: 'yearly', label: 'Yearly', total: '₹10,080', rate: '₹840/mo', save: 'SAVE 30%' },
                ].map((plan) => (
                  <tr
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer group ${selectedPlan === plan.id ? 'bg-blue-50/50 dark:bg-primary/5' : ''}`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <input checked={selectedPlan === plan.id} readOnly className="w-4 h-4 text-primary focus:ring-primary border-slate-300" name="plan" type="radio" />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{plan.label}</span>
                          {plan.save && <span className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">{plan.save}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold">{plan.total}</td>
                    <td className="px-6 py-5 text-sm text-slate-500">{plan.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Product Category: Infrastructure</p>
            {isAdmin ? (
              <button
                onClick={() => alert("Product editing feature coming soon!")}
                className="h-12 bg-slate-800 text-white px-6 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined">edit</span>
                Edit Product
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-12">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 h-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <input className="w-12 h-full text-center border-0 focus:ring-0 bg-transparent text-sm font-bold" type="text" value={quantity} readOnly />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 h-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                <Link to="/cart" className="flex-grow h-12 bg-primary hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">shopping_cart</span>
                  Add to Cart
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span className="material-symbols-outlined text-slate-400 text-xl">description</span>
              <a className="hover:underline" href="#">Terms and conditions</a>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span className="material-symbols-outlined text-green-500 text-xl">verified_user</span>
              <span>30 day money back guarantee</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span className="material-symbols-outlined text-slate-400 text-xl">local_shipping</span>
              <span>Activation within 2-3 Business hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
