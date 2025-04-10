"use client";

import { Chat } from '@/lib/types';
import { getFrameworkDisplayName } from '@/lib/framework-service';

type ChatHeaderProps = {
  currentChat: Chat | null;
  selectedFramework: string | null;
};

export default function ChatHeader({ currentChat, selectedFramework }: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-[#343541] border-b border-gray-800 p-4 flex items-center">
      {currentChat ? (
        <div className="flex items-center">
          <h2 className="font-semibold text-gray-200 text-lg truncate">
            {currentChat.title}
          </h2>
          <span className="ml-3 text-xs text-gray-400">
            Framework: {getFrameworkDisplayName(currentChat.framework)}
          </span>
        </div>
      ) : (
        <h2 className="font-semibold text-gray-200 text-lg">
          {selectedFramework 
            ? `New ${getFrameworkDisplayName(selectedFramework)} Chat` 
            : 'New Chat'
          }
        </h2>
      )}
    </div>
  );
} 