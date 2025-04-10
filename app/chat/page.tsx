"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RequireAuth from '../components/RequireAuth';
import WelcomeMessage from '../components/chat/WelcomeMessage';
import { getDefaultBusinessProfile, getUserBusinessProfiles } from '@/lib/business-profile-service';
import { useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { BusinessProfile } from '@/lib/types';
import ProfileDisplay from '../components/chat/ProfileDisplay';
import ProfileSelector from '../components/chat/ProfileSelector';
import ChatInput from '../components/chat/ChatInput';
import Link from 'next/link';
import { createChat } from '@/lib/chat-service';
import { useFramework } from './layout';

export default function ChatPage() {
  const { framework: selectedFramework } = useFramework();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<BusinessProfile | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuthContext();

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

  const handleSubmit = async (messageContent: string) => {
    if (isGenerating) return;
    
    // Set loading state
    setIsGenerating(true);
    setError(null);
    
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
      
      // Navigate to the new chat page
      router.push(`/chat/${newChat.id}?message=${encodeURIComponent(messageContent)}`);
    } catch (error) {
      console.error('Failed to create new chat:', error);
      setError('Failed to create new chat. Please try again.');
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

  return (
    <RequireAuth>
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!loading && (
            <WelcomeMessage 
              selectedProfile={selectedProfile}
              businessProfiles={businessProfiles}
              onToggleProfileSelector={toggleProfileSelector}
              selectedFramework={selectedFramework}
            />
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
    </RequireAuth>
  );
} 