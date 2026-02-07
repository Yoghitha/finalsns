
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        // Auto-logged in
        navigate('/');
      } else if (data.user) {
        // Email confirmation required
        setMessage("Account created! Please check your email to confirm.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-card-dark p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-3xl">person_add</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Start managing your subscriptions like a pro
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm text-center">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-800 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Alex Johnson"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-800 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="alex@example.com"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-800 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="••••••••"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm</label>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-800 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="••••••••"
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Password must be at least 8 characters long and include an uppercase, lowercase, and special character.
          </p>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">
              I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
