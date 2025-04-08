'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signUp: (email: string, password: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, signIn: authSignIn, signUp: authSignUp, signOut } = useAuth();

  const signIn = async (email: string, password: string) => {
    try {
      await authSignIn(email, password);
      return {};
    } catch (error) {
      console.error('Auth provider sign in error:', error);
      return { 
        error: error instanceof Error 
          ? error 
          : new Error('Failed to sign in. Please check your credentials.')
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await authSignUp(email, password);
      return {};
    } catch (error) {
      console.error('Auth provider sign up error:', error);
      return { 
        error: error instanceof Error 
          ? error 
          : new Error('Failed to sign up. Please try again later.')
      };
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