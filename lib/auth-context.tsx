'use client';

import { createContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthService } from './services/auth.service';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  role: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    AuthService.getCurrentSession().then((response) => {
      if (response.success) {
        setSession(response.session);
        setUser(response.session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data }: { data: { role: string } | null }) => {
        setRole(data?.role || 'user');
      });
    }
  }, [session]);

  const signIn = async (email: string, password: string) => {
    const response = await AuthService.signIn({ email, password });
    return { error: response.success ? null : { message: response.error } };
  };



  const signOut = async () => {
    await AuthService.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}