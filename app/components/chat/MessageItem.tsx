"use client";

import { useState } from 'react';
import { Message } from '@/lib/types';
import { FiCopy, FiCheck } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

type MessageItemProps = {
  message: Message;
};

export default function MessageItem({ message }: MessageItemProps) {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const handleCopyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedToClipboard(true);
      
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopiedToClipboard(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] p-4 rounded-lg ${
        message.role === 'user' 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-700 text-gray-100'
      }`}>
        <div className="flex items-start">
          <div className="rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1 bg-gray-600 flex-shrink-0">
            {message.role === 'user' ? 'U' : 'AI'}
          </div>
          <div className="flex-1">
            {message.role === 'assistant' ? (
              <div className="relative">
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                </div>
                <button 
                  onClick={() => handleCopyToClipboard(message.content)}
                  className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 p-1 rounded text-sm opacity-50 hover:opacity-100"
                  title="Copy to clipboard"
                >
                  {copiedToClipboard ? <FiCheck size={16} /> : <FiCopy size={16} />}
                </button>
              </div>
            ) : (
              <p>{message.content}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 