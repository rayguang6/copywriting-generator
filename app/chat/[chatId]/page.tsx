"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { BusinessProfile, Message as MessageType, Chat as ChatType } from '@/lib/types';
import { getDefaultBusinessProfile, getUserBusinessProfiles } from '@/lib/business-profile-service';
import { generateCopy } from '@/lib/ai-service';
import { addMessage, getChatById } from '@/lib/chat-service';
import RequireAuth from '../../components/RequireAuth';
import MessageItem from '../../components/chat/MessageItem';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatInput from '../../components/chat/ChatInput';
import ProfileSelector from '../../components/chat/ProfileSelector';
import ProfileDisplay from '../../components/chat/ProfileDisplay';
import { useAuthContext } from '@/providers/AuthProvider';
import Link from 'next/link';
import { useFramework } from '../layout';

export default function ChatDetailPage() {
  const { framework, setFramework } = useFramework();
  const params = useParams();
  const searchParams = useSearchParams();
  const chatId = params.chatId as string;
  const initialMessage = searchParams.get('message');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<BusinessProfile | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const currentChatIdRef = useRef<string | null>(null);
  const router = useRouter();
  const { user } = useAuthContext();

  // Track current chat ID
  useEffect(() => {
    currentChatIdRef.current = chatId;
  }, [chatId]);

  // Load business profiles
  useEffect(() => {
    if (!user) return;
    
    const loadProfiles = async () => {
      try {
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
      }
    };
    
    loadProfiles();
  }, [user]);

  // Load chat data
  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
    } else {
      router.push('/chat');
    }
  }, [chatId, router]);

  // Handle initial message (when coming from new chat)
  useEffect(() => {
    if (initialMessage && currentChat && messages.length === 0 && !isGenerating) {
      // Wait a short moment before submitting to ensure everything is loaded
      const timer = setTimeout(() => {
        console.log('Submitting initial message:', initialMessage);
        handleSubmit(initialMessage);
        
        // Clear the message from URL after processing
        const newUrl = `/chat/${chatId}`;
        window.history.replaceState({}, '', newUrl);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage, currentChat, messages, isGenerating, chatId]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Update business profile when chat changes
  useEffect(() => {
    if (currentChat?.business_profile_id && businessProfiles.length > 0) {
      // If the current chat has a business profile, set it as selected
      const chatProfile = businessProfiles.find(p => p.id === currentChat.business_profile_id);
      if (chatProfile) {
        setSelectedProfile(chatProfile);
      }
    }
  }, [currentChat, businessProfiles]);

  // Load a chat by ID
  const loadChat = async (id: string) => {
    try {
      // Skip loading if we're already generating a message for another chat
      if (isGenerating && id !== currentChatIdRef.current) {
        return;
      }
      
      setLoading(true);
      const chatData = await getChatById(id);
      
      // Only update state if this is still the current chat
      if (id === currentChatIdRef.current) {
        if (chatData) {
          // Extract messages array from the chat data
          const messages = chatData.messages || [];
          
          // Set the current chat (remove messages to avoid duplication)
          const { messages: _, ...chatWithoutMessages } = chatData;
          
          // Make sure the chat data matches the ChatType interface by ensuring updated_at exists
          const formattedChat: ChatType = {
            id: chatWithoutMessages.id,
            created_at: chatWithoutMessages.created_at,
            updated_at: chatWithoutMessages.created_at, // Use created_at as fallback
            user_id: chatWithoutMessages.user_id,
            title: chatWithoutMessages.title,
            framework: chatWithoutMessages.framework,
            business_profile_id: chatWithoutMessages.business_profile_id,
            archived: chatWithoutMessages.archived
          };
          
          setCurrentChat(formattedChat);
          setSelectedFramework(formattedChat.framework);
          // Update the framework context to keep it in sync
          setFramework(formattedChat.framework);
          
          // Set messages separately
          setMessages(messages);
          
          // If there's a business profile in the data, add it to state later
          if (chatWithoutMessages.business_profile) {
            // Set or update the selected profile
            setSelectedProfile(chatWithoutMessages.business_profile);
          }
        } else {
          setError('Chat not found');
          router.push('/chat');
        }
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      if (id === currentChatIdRef.current) {
        setError('Failed to load chat. Please try again.');
      }
    } finally {
      if (id === currentChatIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (messageContent: string) => {
    if (isGenerating) return;
    
    // Keep track of the current chat ID for this submission
    const submissionChatId = currentChatIdRef.current;
    
    // Set loading state
    setIsGenerating(true);
    setError(null);
    
    try {
      // Create unique message ID for client-side only
      const tempUserMessageId = `temp-user-${Date.now()}`;
      
      // Add user message to state immediately for UI responsiveness
      const userMessage: MessageType = {
        id: tempUserMessageId,
        chat_id: submissionChatId || '',
        role: 'user',
        content: messageContent,
        created_at: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // We always have a chat ID in this component since it's a route parameter
      const currentChatId = chatId;
      
      // If we have a chat ID, save the message to the database
      if (currentChatId) {
        try {
          const savedUserMessage = await addMessage(currentChatId, 'user', messageContent);
          
          // Only update state if we're still on the same chat
          if (currentChatIdRef.current === currentChatId) {
            // Update the message in state with the server-generated ID
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === tempUserMessageId ? savedUserMessage : msg
              )
            );
          }
        } catch (error) {
          console.error('Failed to save user message to database:', error);
          // Continue with local message since we've already updated the UI
        }
      }
      
      // Check if chat has changed
      if (currentChatIdRef.current !== currentChatId) {
        console.log('Abandoning AI response because chat changed');
        setIsGenerating(false);
        return;
      }
      
      // Generate AI response
      // Include both existing messages and the new user message
      const previousMsgs = [...messages, userMessage].map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      
      try {
        // Determine which framework to use
        const frameworkToUse = currentChat?.framework || selectedFramework || 'aida';
        
        // Use the correct generateCopy function
        const response = await generateCopy({
          prompt: messageContent,
          framework: frameworkToUse,
          businessProfile: selectedProfile,
          previousMessages: previousMsgs as any
        });
        
        // Final check if chat has changed
        if (currentChatIdRef.current !== currentChatId) {
          console.log('Abandoning AI response update because chat changed');
          setIsGenerating(false);
          return;
        }
        
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
            
            // Only update if still on same chat
            if (currentChatIdRef.current === currentChatId) {
              // Update the message in state with the server-generated ID
              setMessages(prevMessages => 
                prevMessages.map(msg => 
                  msg.id === tempAssistantMessageId ? savedAssistantMessage : msg
                )
              );
            }
          } catch (error) {
            console.error('Failed to save assistant message to database:', error);
            // Continue since we've already updated the UI
          }
        }
      } catch (error) {
        console.error('Error in chat submission:', error);
        if (currentChatIdRef.current === currentChatId) {
          setError('Failed to process your message. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error in chat submission:', error);
      if (currentChatIdRef.current === submissionChatId) {
        setError('Failed to process your message. Please try again.');
      }
    } finally {
      if (currentChatIdRef.current === submissionChatId || submissionChatId === null) {
        setIsGenerating(false);
      }
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

  // Handle framework selection
  const handleSelectFramework = (frameworkId: string) => {
    setSelectedFramework(frameworkId);
    setFramework(frameworkId);
  };

  return (
    <RequireAuth>
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {/* Chat header */}
        <ChatHeader 
          currentChat={currentChat}
          selectedFramework={selectedFramework}
        />
        
        {/* Messages container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto py-4 px-4 md:px-8"
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-pulse text-gray-400">Loading chat...</div>
            </div>
          ) : (
            messages.length > 0 ? (
              <div className="space-y-6 max-w-3xl mx-auto">
                {messages.map(message => (
                  <MessageItem 
                    key={message.id} 
                    message={message} 
                  />
                ))}
                {isGenerating && (
                  <div className="flex items-center text-gray-400 animate-pulse">
                    <div className="ml-2">Generating response...</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center h-full text-gray-400">
                No messages yet. Start the conversation!
              </div>
            )
          )}
        </div>
        
        {/* Input area */}
        <div className="border-t border-gray-700 p-4">
          {/* Business Profile display */}
          {user && (
            <ProfileDisplay 
              profile={selectedProfile} 
              onToggleSelector={toggleProfileSelector} 
              showSelector={showProfileSelector}
            />
          )}
          
          <ChatInput 
            onSubmit={handleSubmit}
            isGenerating={isGenerating}
            isLoading={loading}
            selectedFramework={null} // We already have a framework in the chat
          />
          
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-400">
              {isGenerating ? "Generating..." : "Powered by Deepseek AI"}
            </p>
            
            {!user && (
              <Link href="/auth" className="text-xs text-blue-400 hover:underline">
                Sign in to save chats
              </Link>
            )}
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>
      </div>
      
      {/* Business profile selector modal */}
      <ProfileSelector 
        isOpen={showProfileSelector}
        onClose={toggleProfileSelector}
        profiles={businessProfiles}
        onSelectProfile={selectProfile}
      />
    </RequireAuth>
  );
} 