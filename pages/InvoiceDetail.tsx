
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams(); // This is the invoice UUID
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            *,
            invoice_items (*),
            profiles:customer_id (full_name, email),
            subscriptions (
               created_at, 
               next_billing_date,
               plans (name, billing_interval)
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setInvoice(data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading invoice...</div>;
  if (!invoice) return <div className="p-10 text-center">Invoice not found.</div>;

  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  // Subtotal (before tax) calculation approximation based on tax rate if needed, or sum items
  // Assuming total_amount in DB is inclusive of tax if tax isn't separate.
  // We'll just list items.
  const subtotal = invoice.invoice_items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;

  // Tax calculation assumption (using 18% GST as per placeholder) or 0 if not calc.
  // DB scheme might not have flexible tax yet. using 0 for now unless we see tax column.
  const tax = invoice.tax_amount || 0;
  const total = invoice.total_amount || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Invoices / <span className="text-primary font-medium">{invoice.invoice_number || 'Draft'}</span></p>
          <h1 className="text-3xl font-bold">Invoice {invoice.invoice_number || 'Draft'}</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-md transition-colors" onClick={() => window.print()}>
            <span className="material-symbols-outlined text-sm">download</span>
            Print / PDF
          </button>
          {invoice.status === 'open' && (
            <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-2 bg-primary hover:bg-blue-700 text-white font-medium rounded-md transition-shadow shadow-lg shadow-blue-500/20">
              <span className="material-symbols-outlined text-sm">payment</span>
              Pay Now
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">Invoice Date</p>
                <p className="text-sm font-medium">{formatDate(invoice.created_at)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">Due Date</p>
                <p className="text-sm font-medium">{invoice.due_date ? formatDate(invoice.due_date) : '-'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">Status</p>
                <p className="text-sm font-medium capitalize">{invoice.status}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-2">Payment Terms</p>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {invoice.subscriptions?.plans?.billing_interval || 'Immediate'}
              </div>
            </div>
          </div>
          <div className="space-y-2 md:text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">Billed To</p>
            <p className="text-lg font-bold">{invoice.profiles?.full_name || 'Valued Customer'}</p>
            <p className="text-sm text-primary font-medium underline decoration-primary/30">{invoice.profiles?.email}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Quantity</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Unit Price</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoice.invoice_items?.map((item: any) => (
                <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{item.description}</div>
                  </td>
                  <td className="px-4 py-5 text-right font-medium">{item.quantity}</td>
                  <td className="px-4 py-5 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="px-8 py-5 text-right font-semibold">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 flex justify-end">
          <div className="w-full md:w-80 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(subtotal)}</span>
            </div>
            {/* 
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Tax</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(tax)}</span>
            </div>
            */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-base font-bold">Total</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
            {invoice.status === 'paid' && (
              <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 space-y-2">
                <div className="flex justify-between text-xs font-medium text-green-700 dark:text-green-400">
                  <span>Paid on {formatDate(invoice.updated_at)}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-green-800 dark:text-green-300">
                  <span>Amount Due</span>
                  <span>0.00 Rs</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center">
            Thank you for your business. If you have any questions concerning this invoice, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
