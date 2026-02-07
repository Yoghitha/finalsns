import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const AdminCustomers: React.FC = () => {
    const { role } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const isAdmin = role === UserRole.ADMIN;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Admin policy allows viewing all users
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesFilter = filter === 'all' || user.role === filter;
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleCreateInternalUser = () => {
        // This typically requires a backend function or Supabase Auth API call
        // Since we are client-side, we can't directly create a user with a specific role in Auth 
        // without a server-side function (service role) or using the 'Invite' feature.
        // For now, we'll show a message or modal placeholder.
        alert("To create an Internal User, please use the Supabase Dashboard or implement a specific Edge Function.");
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage customer and internal user accounts.</p>
                </div>
                {isAdmin && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg text-sm">
                        To add an Internal User: <br />
                        1. User must sign up as Customer.<br />
                        2. Find their email below and click "Promote".
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start">
                        {['all', 'customer', 'internal', 'admin'].map(role => (
                            <button
                                key={role}
                                onClick={() => setFilter(role)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${filter === role ? 'bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-blue-400' : 'text-slate-500'}`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Search by email..."
                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm w-full sm:w-64 focus:ring-1 focus:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                user.role === 'internal' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'text-green-600 bg-green-50' : 'text-slate-500 bg-slate-100'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-400 hover:text-primary transition-colors mr-2">
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            {user.role === 'customer' && isAdmin && (
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`Promote ${user.email} to Internal User?`)) {
                                                            try {
                                                                const { error } = await supabase.rpc('promote_to_internal_user', { target_user_id: user.id });
                                                                if (error) alert(error.message);
                                                                else fetchUsers();
                                                            } catch (e) {
                                                                console.error(e);
                                                            }
                                                        }
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700 text-xs font-bold border border-blue-200 px-2 py-1 rounded"
                                                >
                                                    Promote
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCustomers;
