import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-6">
                    <span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-300">
                        gpp_bad
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;
