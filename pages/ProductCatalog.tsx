
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface Product {
  id: string;
  name: string;
  description: string;
  type: string;
  sales_price: number;
  is_recurring: boolean;
  is_deleted: boolean;
}

const ProductCatalog: React.FC = () => {
  const { role } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All Product Types');
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_deleted', false)
        .order('name');

      if (filterType !== 'All Product Types') {
        query = query.eq('type', filterType);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Realtime subscription
    const channel = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterType, search]); // Re-fetch on filter change

  const isAdmin = role === UserRole.ADMIN;
  // Determine base path for links
  const getBasePath = () => {
    switch (role) {
      case UserRole.ADMIN: return '/admin';
      case UserRole.INTERNAL_USER: return '/internal'; // If internal needs access
      default: return '';
    }
  };
  const basePath = getBasePath();

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      <section>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">All Products</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and monitor your active subscription plans</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-4 pr-10 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              >
                <option>All Product Types</option>
                <option value="service">Service</option>
                <option value="consumable">Consumable</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">expand_more</span>
            </div>
            {isAdmin && (
              <button
                onClick={() => alert("Product creation feature coming soon!")}
                className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                New Product
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary"
              placeholder="Search product name..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <span>Sort By:</span>
            <button className="flex items-center gap-1 text-primary hover:underline">
              Price
              <span className="material-symbols-outlined text-xs">arrow_downward</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                to={`${basePath}/product/${product.id}`}
                key={product.id}
                className="bg-white dark:bg-slate-900 group rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden relative flex items-center justify-center">
                  {/* Placeholder image logic since DB doesn't have image column yet. Use name hash/seed */}
                  <img
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    src={`https://picsum.photos/seed/${product.id}/400/225`}
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${!product.is_deleted ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600'
                      }`}>
                      {!product.is_deleted ? 'Active' : 'Archived'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{product.description}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold">₹{product.sales_price}</span>
                      {product.is_recurring && <span className="text-slate-500 dark:text-slate-400 text-sm">/recurring</span>}
                    </div>
                    {isAdmin && (
                      <button className="text-primary p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {isAdmin && (
              <div className="bg-white dark:bg-slate-900 group rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed flex items-center justify-center p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer min-h-[300px]">
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-slate-400">add_circle</span>
                  </div>
                  <p className="font-semibold text-slate-600 dark:text-slate-300">Create New Product</p>
                  <p className="text-xs text-slate-400 mt-1">Configure pricing & attributes</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductCatalog;
