
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar_url: ''
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = () => {
    setLoading(true);
    if (user) {
      // Prioritize metadata, fallback to profile empty strings
      const metadata = user.user_metadata || {};
      setProfile({
        full_name: metadata.full_name || '',
        email: user.email || '',
        phone: metadata.phone || '',
        address: metadata.address || '',
        bio: metadata.bio || '',
        avatar_url: metadata.avatar_url || ''
      });
    }
    setLoading(false);
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      // Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          bio: profile.bio,
          avatar_url: profile.avatar_url
        }
      });

      if (authError) throw authError;

      // Sync with profiles table (best effort)
      const updates = {
        id: user!.id,
        full_name: profile.full_name,
        // If columns don't exist, this might fail, but auth update succeeded.
        // We catch error here to not block UI success if it's just a column issue.
      };

      try {
        await supabase.from('profiles').upsert(updates);
      } catch (err) {
        console.warn('Profile sync failed (likely missing columns), but auth metadata updated.', err);
      }

      setMessage('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage(`Error updating profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.id]: e.target.value
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">User Details</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Manage your personal information and contact preferences.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <form onSubmit={updateProfile}>
          <div className="p-6 sm:p-8 space-y-8">
            {message && (
              <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('Error') ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                {message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-sm flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                  )}
                </div>
                {/* 
                <button className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-400 hover:text-primary transition-colors shadow-sm" type="button">
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                </button>
                */}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Profile Photo</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Avatar provided via metadata (e.g. Social Login).</p>
                {/* Image upload not implemented yet */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="full_name">Full Name</label>
                <input
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                  id="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">Email</label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  id="email"
                  value={profile.email}
                  disabled
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="phone">Phone Number</label>
                <input
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                  id="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="address">Address</label>
                <input
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                  id="address"
                  value={profile.address}
                  onChange={handleChange}
                  type="text"
                  placeholder="Street Address"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="bio">Bio</label>
                <textarea
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                  id="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Additional details..."
                  rows={4}
                ></textarea>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-end items-center gap-3">
            <button
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              type="button"
              onClick={() => loadProfile()}
            >
              Cancel Changes
            </button>
            <button
              className="w-full sm:w-auto px-8 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-blue-700 rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-70"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
