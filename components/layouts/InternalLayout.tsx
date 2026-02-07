import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import Sidebar from '../Sidebar';
import Navigation from '../Navigation';

const InternalLayout: React.FC = () => {
    const { session, role, loading, signOut } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session || role !== UserRole.INTERNAL_USER) {
        // Note: Admin might functionality want to access internal views, but typically Admin has their own.
        // If strict role separation:
        if (session && role === UserRole.ADMIN) return <Navigate to="/admin" />;
        if (session) return <Navigate to="/unauthorized" />;
        return <Navigate to="/login" />;
    }

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-200">
            <Navigation isAuthenticated={true} onLogout={() => { signOut(); window.location.href = '/login'; }} />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default InternalLayout;
