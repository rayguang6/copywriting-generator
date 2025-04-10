"use client";

import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { getFrameworkDisplayName } from '@/lib/framework-service';

type ChatInputProps = {
  onSubmit: (message: string) => Promise<void>;
  isGenerating: boolean;
  isLoading: boolean;
  selectedFramework: string | null;
};

export default function ChatInput({ 
  onSubmit, 
  isGenerating, 
  isLoading,
  selectedFramework 
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isGenerating || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue(''); // Clear input immediately
    
    await onSubmit(message);
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={`Enter a topic or product description${selectedFramework ? ` for ${getFrameworkDisplayName(selectedFramework)}` : ''}`}
        className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
        disabled={isGenerating || isLoading}
      />
      <button
        type="submit"
        className={`bg-blue-600 text-white p-2 rounded-md ${(isGenerating || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        disabled={isGenerating || isLoading}
      >
        {isGenerating ? (
          <div className="w-6 h-6 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <FiSend size={18} />
        )}
      </button>
    </form>
  );
} 