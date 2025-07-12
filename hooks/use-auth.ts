'use client';

import { useContext } from 'react';
import { AuthContext } from '../lib/auth-context';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Additional auth-related hooks can be added here
export function useRequireAuth() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return { user: null, loading: true, isAuthenticated: false };
  }
  
  return {
    user,
    loading: false,
    isAuthenticated: !!user,
  };
}

export function useAuthRedirect() {
  const { user, loading } = useAuth();
  
  return {
    shouldRedirectToLogin: !loading && !user,
    shouldRedirectToDashboard: !loading && !!user,
    loading,
  };
}