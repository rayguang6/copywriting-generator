"use client";

import { useState } from 'react';
import { FiSend, FiAlignLeft } from 'react-icons/fi';
import { getFrameworkDisplayName, getFrameworkById } from '@/lib/framework-service';

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
  
  // Get framework details if one is selected
  const framework = selectedFramework ? getFrameworkById(selectedFramework) : null;
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {/* Framework badge */}
      {framework && (
        <div className="flex items-center gap-2 text-sm text-blue-300">
          <FiAlignLeft size={14} />
          <span>Using {framework.name} framework</span>
        </div>
      )}
    
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={selectedFramework 
            ? `Describe your product or service using the ${framework?.name} approach...` 
            : 'Select a framework and enter your topic...'
          }
          className={`flex-1 bg-gray-700 border rounded-md px-4 py-3 text-white focus:outline-none ${
            selectedFramework 
              ? 'border-blue-500/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30' 
              : 'border-gray-600 focus:border-gray-500'
          }`}
          disabled={isGenerating || isLoading}
        />
        <button
          type="submit"
          className={`p-3 rounded-md ${
            isGenerating || isLoading
              ? 'bg-blue-600/50 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          disabled={isGenerating || isLoading || !inputValue.trim()}
        >
          {isGenerating ? (
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <FiSend size={18} />
          )}
        </button>
      </div>
    </form>
  );
} 