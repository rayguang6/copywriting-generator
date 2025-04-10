"use client";

import { useState, useEffect, useRef } from 'react';
import { FiSend, FiInfo, FiCopy, FiCheck } from 'react-icons/fi';
import { BusinessProfile, Message as MessageType, Chat as ChatType } from '@/lib/types';
import { getDefaultBusinessProfile, getUserBusinessProfiles } from '@/lib/business-profile-service';
import { generateCopy } from '@/lib/ai-service';
import { createChat, addMessage, getChatById, getChatMessages } from '@/lib/chat-service';
import { getFrameworkById, convertLegacyFramework, getFrameworkDisplayName } from '@/lib/framework-service';
import Link from 'next/link';
import { useAuthContext } from '@/providers/AuthProvider';
import ReactMarkdown from 'react-markdown';
import { useRouter, useSearchParams } from 'next/navigation';

type ChatProps = {
  selectedFramework: string | null;
};

export default function Chat({ selectedFramework }: ChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<BusinessProfile | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');

  // Load business profiles
  useEffect(() => {
    if (!user) return;
    
    const loadProfiles = async () => {
      try {
        setLoading(true);
        // Get all profiles
        const profiles = await getUserBusinessProfiles();
        setBusinessProfiles(profiles);
        
        // Try to get default profile
        const defaultProfile = await getDefaultBusinessProfile();
        if (defaultProfile) {
          setSelectedProfile(defaultProfile);
        } else if (profiles.length > 0) {
          // If no default, use first profile
          setSelectedProfile(profiles[0]);
        }
      } catch (error) {
        console.error('Error loading business profiles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfiles();
  }, [user]);

  // Load existing chat if chatId is provided
  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
    } else {
      setLoading(false);
      setMessages([]);
      setCurrentChat(null);
    }
  }, [chatId]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Reset copy to clipboard status after 2 seconds
  useEffect(() => {
    if (copiedToClipboard) {
      const timeout = setTimeout(() => {
        setCopiedToClipboard(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [copiedToClipboard]);

  // Load a chat by ID
  const loadChat = async (id: string) => {
    try {
      setLoading(true);
      const chatData = await getChatById(id);
      setCurrentChat(chatData.chat);
      setMessages(chatData.messages);

      // If this chat has a framework, update the selected framework in the parent
      console.log("Loading chat with framework:", chatData.chat.framework);
    } catch (error) {
      console.error('Error loading chat:', error);
      setError('Failed to load chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isGenerating) return;
    
    // Set loading state
    setIsGenerating(true);
    setError(null);
    
    const userMessageContent = inputValue.trim();
    
    // Clear input immediately to prevent duplicate submissions
    setInputValue('');
    
    try {
      // Create unique message ID for client-side only
      const tempUserMessageId = `temp-user-${Date.now()}`;
      
      // Add user message to state immediately for UI responsiveness
      const userMessage: MessageType = {
        id: tempUserMessageId,
        chat_id: chatId || '',
        role: 'user',
        content: userMessageContent,
        created_at: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Create a new chat if we don't have a chat ID
      let currentChatId = chatId;
      if (!currentChatId) {
        try {
          // Create a chat title from the user's first message (truncated)
          const chatTitle = userMessageContent.length > 40
            ? `${userMessageContent.substring(0, 40)}...`
            : userMessageContent;
          
          const businessProfileId = selectedProfile?.id || null;
          
          // Use the selected framework ID or default to 'aida'
          const frameworkId = selectedFramework || 'aida';
          console.log("Creating new chat with framework:", frameworkId);
          
          const newChat = await createChat(
            chatTitle, 
            frameworkId, 
            businessProfileId
          );
          currentChatId = newChat.id;
          setCurrentChat(newChat);
          
          // Update the URL without refreshing the page
          router.push(`/?chatId=${currentChatId}`, { scroll: false });
        } catch (error) {
          console.error('Failed to create new chat:', error);
          setError('Failed to create new chat. Please try again.');
          setIsGenerating(false);
          return;
        }
      }
      
      // If we have a chat ID, save the message to the database
      if (currentChatId) {
        try {
          const savedUserMessage = await addMessage(currentChatId, 'user', userMessageContent);
          
          // Update the message in state with the server-generated ID
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === tempUserMessageId ? savedUserMessage : msg
            )
          );
          
        } catch (error) {
          console.error('Failed to save user message to database:', error);
          // Continue with local message since we've already updated the UI
        }
      }
      
      // Generate AI response
      const previousMsgs = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      
      try {
        // Determine which framework to use
        const frameworkToUse = currentChat?.framework || selectedFramework || 'aida';
        
        // Use the correct generateCopy function
        const response = await generateCopy({
          prompt: userMessageContent,
          framework: frameworkToUse,
          businessProfile: selectedProfile,
          previousMessages: previousMsgs as any
        });
        
        // Create a temporary assistant message for immediate display
        const tempAssistantMessageId = `temp-assistant-${Date.now()}`;
        const assistantMessage: MessageType = {
          id: tempAssistantMessageId,
          chat_id: currentChatId || '',
          role: 'assistant',
          content: response,
          created_at: new Date().toISOString(),
        };
        
        // Add assistant message to UI
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
        
        // If we have a chat ID, save the assistant message to the database
        if (currentChatId) {
          try {
            const savedAssistantMessage = await addMessage(currentChatId, 'assistant', response);
            
            // Update the message in state with the server-generated ID
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === tempAssistantMessageId ? savedAssistantMessage : msg
              )
            );
            
          } catch (error) {
            console.error('Failed to save assistant message to database:', error);
            // Continue since we've already updated the UI
          }
        }
        
      } catch (error) {
        console.error('Error in chat submission:', error);
        setError('Failed to process your message. Please try again.');
      }
      
    } catch (error) {
      console.error('Error in chat submission:', error);
      setError('Failed to process your message. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle profile selector
  const toggleProfileSelector = () => {
    setShowProfileSelector(!showProfileSelector);
  };

  // Select a business profile
  const selectProfile = (profile: BusinessProfile) => {
    setSelectedProfile(profile);
    setShowProfileSelector(false);
  };

  const handleCopyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedToClipboard(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChat(null);
    setError(null);
    setInputValue('');
    
    // Remove chatId from URL
    router.push('/');
  };

  const renderMessageContent = (message: MessageType) => {
    if (message.role === 'assistant') {
      return (
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
      );
    }
    
    return <p>{message.content}</p>;
  };

  // Render framework-specific information
  const renderFrameworkInfo = () => {
    if (!selectedFramework) {
      return (
        <p className="text-sm text-gray-300 mb-4">
          Select a framework from the sidebar to get started.
        </p>
      );
    }

    // Get framework information
    const framework = getFrameworkById(selectedFramework);
    
    if (!framework) {
      return (
        <p className="text-sm text-gray-300 mb-4">
          Unknown framework selected. Please select a valid framework.
        </p>
      );
    }

    // Display framework information based on its ID
    if (framework.id === 'aida') {
      return (
        <ul className="list-disc list-inside text-sm text-gray-300 mb-4 space-y-1">
          <li><strong>Attention:</strong> Grab the audience's attention</li>
          <li><strong>Interest:</strong> Generate interest with compelling details</li>
          <li><strong>Desire:</strong> Create desire for the product/service</li>
          <li><strong>Action:</strong> Prompt the audience to take action</li>
        </ul>
      );
    } else if (framework.id === 'fab') {
      return (
        <ul className="list-disc list-inside text-sm text-gray-300 mb-4 space-y-1">
          <li><strong>Features:</strong> List the product's features</li>
          <li><strong>Advantages:</strong> Explain the advantages of these features</li>
          <li><strong>Benefits:</strong> Emphasize the benefits users will experience</li>
        </ul>
      );
    } else if (framework.id === 'pas') {
      return (
        <ul className="list-disc list-inside text-sm text-gray-300 mb-4 space-y-1">
          <li><strong>Problem:</strong> Identify your audience's pain point</li>
          <li><strong>Agitate:</strong> Emphasize why this problem needs solving</li>
          <li><strong>Solution:</strong> Present your product as the answer</li>
        </ul>
      );
    }

    // Fallback for any other framework
    return (
      <p className="text-sm text-gray-300 mb-4">
        Using the <strong>{getFrameworkDisplayName(framework.id)}</strong> framework. Type your message to begin.
      </p>
    );
  };

  // Update when selectedFramework changes
  useEffect(() => {
    console.log("Chat component received framework:", selectedFramework);
  }, [selectedFramework]);

  return (
    <div className="flex flex-col h-screen w-full md:ml-[260px] bg-[#343541] text-gray-100">
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {/* Chat header */}
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
              {selectedFramework ? `New ${getFrameworkDisplayName(selectedFramework)} Chat` : 'New Chat'}
            </h2>
          )}
        </div>

        {/* Chat messages container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-6"
        >
          {messages.length > 0 ? (
            // Display conversation
            messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
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
                      {renderMessageContent(message)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full">
              {!loading && (
                <>
                  <div className="text-4xl mb-2">👋</div>
                  <h1 className="text-2xl font-bold mb-6">How can I help you today?</h1>
                  {!selectedProfile && businessProfiles.length > 0 && (
                    <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-md mb-6 max-w-lg">
                      <div className="flex items-start gap-2">
                        <FiInfo className="text-yellow-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-yellow-300 font-medium mb-1">No business profile selected</p>
                          <p className="text-yellow-200/70 text-sm">
                            Select a business profile to get better results tailored to your business.
                          </p>
                          <button 
                            onClick={toggleProfileSelector}
                            className="mt-2 px-3 py-1 bg-yellow-800 hover:bg-yellow-700 rounded-md text-sm transition"
                          >
                            Select a profile
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-[#3e3f4b] p-6 rounded-lg w-full max-w-2xl">
                    <h3 className="text-xl font-medium mb-4">Generate Copywriting</h3>
                    <p className="text-gray-300 mb-4">
                      Enter a topic or product description below to generate marketing copy{selectedFramework ? ` using the ${getFrameworkDisplayName(selectedFramework)} framework` : ''}:
                    </p>
                    {renderFrameworkInfo()}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-700 p-4">
        {/* Business Profile Selector - restored */}
        {user && (
          <div className="mb-3 relative">
            <button 
              onClick={toggleProfileSelector}
              className="text-sm text-gray-300 hover:text-white flex items-center gap-1 mb-2"
            >
              <span className="font-medium">Business Profile:</span>
              <span className="text-white">{selectedProfile ? selectedProfile.name : 'None'}</span>
              <span className="ml-1 text-xs">{showProfileSelector ? '▲' : '▼'}</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Enter a topic or product description${selectedFramework ? ` for ${getFrameworkDisplayName(selectedFramework)}` : ''}`}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            disabled={isGenerating || loading}
          />
          <button
            type="submit"
            className={`bg-blue-600 text-white p-2 rounded-md ${(isGenerating || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            disabled={isGenerating || loading}
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
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-400">
            {isGenerating ? "Generating..." : "Powered by Deepseek AI"}
          </p>
          
          {!user && (
            <Link href="/auth" className="text-xs text-blue-400 hover:underline">
              Sign in to use business profiles
            </Link>
          )}
        </div>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      {/* Business profile selector modal */}
      {showProfileSelector && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Select a Business Profile</h2>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {businessProfiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => selectProfile(profile)}
                  className="w-full text-left p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <div className="font-medium">{profile.name}</div>
                  <div className="text-sm text-gray-400">{profile.industry}</div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={toggleProfileSelector}
                className="px-4 py-2 text-gray-300 hover:text-white transition"
              >
                Cancel
              </button>
              <Link
                href="/business-profiles"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
              >
                Manage Profiles
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 