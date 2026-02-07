import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import Navigation from '../Navigation';

const CustomerLayout: React.FC = () => {
    const { session, role, loading, signOut } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session || role !== UserRole.CUSTOMER) {
        // Admins/Internals shouldn't typically see the customer portal view of 'My Dashboard' unless acting as one.
        // Strict separation:
        if (session) return <Navigate to="/unauthorized" />;
        return <Navigate to="/login" />;
    }

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-200">
            <Navigation isAuthenticated={true} onLogout={() => { signOut(); window.location.href = '/login'; }} />
            <div className="flex flex-1">
                {/* Customer Portal might not have a sidebar, or a different one */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
                    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CustomerLayout;
