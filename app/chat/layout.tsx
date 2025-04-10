"use client";

import { useState, useContext, createContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';

// Create a context for the selected framework
const FrameworkContext = createContext<{
  framework: string | null;
  setFramework: (framework: string) => void;
}>({
  framework: null,
  setFramework: () => {},
});

// Hook to use the framework context
export function useFramework() {
  return useContext(FrameworkContext);
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);

  const handleSelectFramework = (frameworkId: string) => {
    setSelectedFramework(frameworkId);
    // Navigate to the base chat page when selecting a framework
    if (pathname !== '/chat') {
      router.push('/chat');
    }
  };

  const handleSelectChat = (chatId: string) => {
    // Update the URL without refreshing the page
    router.push(`/chat/${chatId}`, { scroll: false });
  };

  return (
    <FrameworkContext.Provider value={{ 
      framework: selectedFramework, 
      setFramework: setSelectedFramework 
    }}>
      <div className="flex h-screen bg-[#343541]">
        <Sidebar onSelectFramework={handleSelectFramework} onSelectChat={handleSelectChat} />
        <div className="flex flex-col h-screen w-full md:ml-[260px] bg-[#343541] text-gray-100">
          {children}
        </div>
      </div>
    </FrameworkContext.Provider>
  );
} 