"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the chat page
    router.push('/chat');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#343541] text-white">
      <p>Redirecting to chat...</p>
    </div>
  );
}
