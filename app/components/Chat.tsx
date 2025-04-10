"use client";

import { useState, useEffect, useRef } from 'react';
import { FiInfo } from 'react-icons/fi';
import { BusinessProfile, Message as MessageType, Chat as ChatType } from '@/lib/types';
import { getDefaultBusinessProfile, getUserBusinessProfiles } from '@/lib/business-profile-service';
import { generateCopy } from '@/lib/ai-service';
import { createChat, addMessage, getChatById, getChatMessages } from '@/lib/chat-service';
import { getFrameworkDisplayName } from '@/lib/framework-service';
import Link from 'next/link';
import { useAuthContext } from '@/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';

// Import new components
import MessageItem from './chat/MessageItem';
import ChatHeader from './chat/ChatHeader';
import ChatInput from './chat/ChatInput';
import ProfileSelector from './chat/ProfileSelector';
import ProfileDisplay from './chat/ProfileDisplay';
import WelcomeMessage from './chat/WelcomeMessage';

type ChatProps = {
  selectedFramework: string | null;
};

export default function Chat({ selectedFramework }: ChatProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<BusinessProfile | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const currentChatIdRef = useRef<string | null>(null); // Track current chat ID to prevent race conditions
  const { user } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');

  // Update the ref whenever chatId changes
  useEffect(() => {
    currentChatIdRef.current = chatId;
  }, [chatId]);

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

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
          
          // Set messages separately
          setMessages(messages);
          
          // If there's a business profile in the data, add it to state later
          if (chatWithoutMessages.business_profile) {
            // Set or update the selected profile
            setSelectedProfile(chatWithoutMessages.business_profile);
          }
        } else {
          setError('Chat not found');
          router.push('/');
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
      
      // Create a new chat if we don't have a chat ID
      let currentChatId = submissionChatId;
      if (!currentChatId) {
        try {
          // Create a chat title from the user's first message (truncated)
          const chatTitle = messageContent.length > 40
            ? `${messageContent.substring(0, 40)}...`
            : messageContent;
          
          const businessProfileId = selectedProfile?.id || null;
          
          // Use the selected framework ID or default to 'aida'
          const frameworkId = selectedFramework || 'aida';
          
          const newChat = await createChat(
            chatTitle, 
            frameworkId, 
            businessProfileId
          );
          currentChatId = newChat.id;
          currentChatIdRef.current = currentChatId; // Update the ref
          
          // Make sure to add the updated_at field to match the ChatType interface
          const formattedNewChat: ChatType = {
            id: newChat.id,
            created_at: newChat.created_at,
            updated_at: newChat.created_at, // Use created_at as a fallback
            user_id: newChat.user_id,
            title: newChat.title,
            framework: newChat.framework,
            business_profile_id: newChat.business_profile_id,
            archived: newChat.archived
          };
          
          setCurrentChat(formattedNewChat);
          
          // Update the URL without refreshing the page
          router.push(`/?chatId=${currentChatId}`, { scroll: false });
        } catch (error) {
          console.error('Failed to create new chat:', error);
          setError('Failed to create new chat. Please try again.');
          setIsGenerating(false);
          return;
        }
      }
      
      // Check if the chat ID still matches our submission
      if (currentChatIdRef.current !== submissionChatId && submissionChatId !== null) {
        console.log('Abandoning message submission because chat changed');
        setIsGenerating(false);
        return;
      }
      
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
      
      // Check again if chat has changed
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

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChat(null);
    setError(null);
    
    // Remove chatId from URL
    router.push('/');
  };

  return (
    <div className="flex flex-col h-screen w-full md:ml-[260px] bg-[#343541] text-gray-100">
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {/* Chat header */}
        <ChatHeader currentChat={currentChat} selectedFramework={selectedFramework} />

        {/* Chat messages container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-6"
        >
          {messages.length > 0 ? (
            // Display conversation
            messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))
          ) : (
            // Empty state - Welcome message
            !loading && (
              <WelcomeMessage 
                selectedProfile={selectedProfile}
                businessProfiles={businessProfiles}
                onToggleProfileSelector={toggleProfileSelector}
                selectedFramework={selectedFramework}
              />
            )
          )}
        </div>
      </div>

      <div className="border-t border-gray-700 p-4">
        {/* Business Profile Selector */}
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
          selectedFramework={selectedFramework}
        />
        
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
      <ProfileSelector 
        isOpen={showProfileSelector}
        onClose={toggleProfileSelector}
        profiles={businessProfiles}
        onSelectProfile={selectProfile}
      />
    </div>
  );
} 