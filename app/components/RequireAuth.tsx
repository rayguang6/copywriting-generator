'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if user is not authenticated
      window.location.href = '/auth';
    }
  }, [user, loading]);

  // Show nothing while loading or if not authenticated
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#343541]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
} 