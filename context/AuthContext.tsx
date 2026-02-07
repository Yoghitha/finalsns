
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserRole } from '../types';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: UserRole | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Get initial session
        const initSession = async () => {
            // Set a timeout to prevent infinite loading
            const timeoutId = setTimeout(() => {
                console.warn('Auth check timed out, defaulting to public access');
                setLoading(false);
            }, 2000);

            try {
                const { data: { session } } = await supabase.auth.getSession();
                clearTimeout(timeoutId);

                if (session) {
                    setSession(session);
                    setUser(session.user);
                    await fetchRole(session.user.id);
                } else {
                    setSession(null);
                    setUser(null);
                    setRole(null);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                setLoading(false);
            }
        };

        initSession();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchRole(session.user.id);
            } else {
                setRole(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .single();

            if (error || !data) {
                console.error('Error fetching role:', error);
                // CRITICAL: Do NOT default to a role if fetch fails. Security risk!
                // Instead, force sign out or set to null so the user is treated as unverified.
                setRole(null);
            } else {
                setRole(data.role as UserRole);
            }
        } catch (error) {
            console.error('Error in fetchRole:', error);
            setRole(null);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
