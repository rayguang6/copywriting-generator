'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@supabase/supabase-js';
import { ensureUserExists } from '@/lib/user-service'; 

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error | string }>;
  signUp: (email: string, password: string) => Promise<{ error?: Error | string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, signIn: authSignIn, signUp: authSignUp, signOut: authSignOut } = useAuth();

  // Ensure user record exists whenever the user changes
  useEffect(() => {
    if (user) {
      ensureUserExists(user).catch(error => {
        console.error('Failed to ensure user exists:', error);
      });
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      await authSignIn(email, password);
      return {};
    } catch (error) {
      console.error('Auth provider sign in error:', error);
      return { 
        error: error instanceof Error 
          ? error 
          : 'Failed to sign in. Please check your credentials.'
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await authSignUp(email, password);
      return {};
    } catch (error: any) {
      console.error('Auth provider sign up error:', error);
      
      // Check if this is our custom error for existing users
      const errorMessage = error.message === 'User already registered with this email'
        ? 'An account with this email already exists. Please sign in instead.'
        : error instanceof Error 
          ? error.message 
          : 'Failed to sign up. Please try again later.';
          
      return { error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      await authSignOut();
      // Force a hard redirect to the auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
} 