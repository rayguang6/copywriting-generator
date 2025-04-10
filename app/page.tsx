"use client";

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import RequireAuth from './components/RequireAuth';
import { useSearchParams, useRouter } from 'next/navigation';
import { getChatById } from '@/lib/chat-service';
import { convertLegacyFramework } from '@/lib/framework-service';

export default function Home() {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get('chatId');

  // Load chat framework if a chat is selected
  useEffect(() => {
    if (chatId) {
      loadChatFramework(chatId);
    }
  }, [chatId]);

  const loadChatFramework = async (id: string) => {
    try {
      const { chat } = await getChatById(id);
      if (chat && chat.framework) {
        console.log("Raw framework from chat:", chat.framework);
        
        // Convert legacy framework format if needed
        const frameworkId = convertLegacyFramework(chat.framework);
        console.log("Converted to frameworkId:", frameworkId);
        
        setSelectedFramework(frameworkId);
      }
    } catch (error) {
      console.error('Error loading chat framework:', error);
    }
  };

  const handleSelectFramework = (frameworkId: string) => {
    console.log("Home setting framework:", frameworkId);
    setSelectedFramework(frameworkId);
  };

  return (
    <RequireAuth>
      <div className="flex h-screen bg-[#343541]">
        <Sidebar onSelectFramework={handleSelectFramework} />
        <Chat selectedFramework={selectedFramework} />
      </div>
    </RequireAuth>
  );
}
