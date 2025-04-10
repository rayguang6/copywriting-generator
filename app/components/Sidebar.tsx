"use client";

import { useState, useEffect } from 'react';
import { FiMenu, FiPlusCircle, FiLogOut, FiLogIn, FiUser, FiBriefcase, FiMessageSquare, FiRefreshCw, FiEdit2 } from 'react-icons/fi';
import { useAuthContext } from '@/providers/AuthProvider';
import Link from 'next/link';
import { Chat } from '@/lib/types';
import { getUserChats, updateChat } from '@/lib/chat-service';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getAllFrameworks, formatFrameworkName } from '@/lib/framework-service';

export default function Sidebar({ onSelectFramework }: { onSelectFramework: (framework: string) => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState('');
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');

  // Get all frameworks from the framework service
  const frameworks = getAllFrameworks();

  // Fetch user's chats when the component mounts or when chatId changes
  useEffect(() => {
    if (user) {
      fetchUserChats();
    }
  }, [user, chatId]);

  const fetchUserChats = async () => {
    try {
      setIsLoadingChats(true);
      const chats = await getUserChats();
      setUserChats(chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNewChat = () => {
    // Reset the chat by navigating to the homepage
    router.push('/');
  };

  const handleSelectFramework = (frameworkId: string) => {
    // Log the selected framework ID to help with debugging
    console.log("Selecting framework with ID:", frameworkId);
    
    // Select the framework but don't create a chat yet
    onSelectFramework(frameworkId);
    
    // Reset the URL to remove any chatId
    router.push('/');
  };

  const handleSelectChat = (chatId: string) => {
    router.push(`/?chatId=${chatId}`);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  // Format chat title - truncate if too long
  const formatChatTitle = (title: string) => {
    return title.length > 25 ? title.substring(0, 22) + '...' : title;
  };

  // Manual refresh function
  const handleRefreshChats = () => {
    fetchUserChats();
  };

  // Start editing chat title
  const startEditingChat = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from selecting the chat
    setEditingChatId(chat.id);
    setNewChatTitle(chat.title);
  };

  // Save edited chat title
  const handleSaveEditedTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingChatId && newChatTitle.trim()) {
      try {
        await updateChat(editingChatId, { title: newChatTitle.trim() });
        // Update local state
        setUserChats(prevChats => 
          prevChats.map(chat => 
            chat.id === editingChatId ? { ...chat, title: newChatTitle.trim() } : chat
          )
        );
        // Exit edit mode
        setEditingChatId(null);
      } catch (error) {
        console.error('Error updating chat title:', error);
      }
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingChatId(null);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <FiMenu size={24} />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-[#202123] text-white w-[260px] p-2 transition-transform duration-300 ease-in-out z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-hidden
      `}>
        <div className="flex flex-col h-full">
          {/* New chat button at top */}
          <div className="p-2">
            <button 
              onClick={handleNewChat}
              className="flex items-center gap-3 w-full bg-transparent hover:bg-gray-700 transition border border-gray-600 rounded-md py-3 px-3 text-sm text-left"
            >
              <FiPlusCircle size={16} />
              <span>New chat</span>
            </button>
          </div>
          
          {/* Frameworks section */}
          <div className="mt-5 flex-shrink-0">
            <h2 className="text-xs uppercase font-semibold text-gray-400 mb-2 px-3">Frameworks</h2>
            <div className="space-y-1 max-h-[30vh] overflow-y-auto">
              {frameworks.map((framework) => (
                <button
                  key={framework.id}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition"
                  onClick={() => handleSelectFramework(framework.id)}
                >
                  {formatFrameworkName(framework)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chat history section */}
          <div className="mt-5 flex-1 overflow-hidden">
            <h2 className="text-xs uppercase font-semibold text-gray-400 mb-2 px-3 flex items-center justify-between">
              <span>Recent Chats</span>
              <div className="flex items-center">
                {isLoadingChats ? (
                  <span className="text-xs text-gray-500">Loading...</span>
                ) : (
                  <button 
                    onClick={handleRefreshChats} 
                    className="text-gray-400 hover:text-white p-1 rounded-full"
                    title="Refresh chats"
                  >
                    <FiRefreshCw size={14} />
                  </button>
                )}
              </div>
            </h2>
            <div className="space-y-1 max-h-[30vh] overflow-y-auto pr-1">
              {userChats.length > 0 ? (
                userChats.map((chat) => (
                  <div key={chat.id} className="relative">
                    {editingChatId === chat.id ? (
                      <form onSubmit={handleSaveEditedTitle} className="px-2">
                        <input
                          type="text"
                          value={newChatTitle}
                          onChange={(e) => setNewChatTitle(e.target.value)}
                          className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                          onBlur={handleCancelEdit}
                          onKeyDown={(e) => e.key === 'Escape' && handleCancelEdit()}
                        />
                      </form>
                    ) : (
                      <button
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition flex items-center gap-2 group ${
                          pathname === '/' && window.location.search.includes(chat.id) ? 'bg-gray-700' : ''
                        }`}
                        onClick={() => handleSelectChat(chat.id)}
                      >
                        <FiMessageSquare size={14} />
                        <span className="truncate flex-1">{formatChatTitle(chat.title)}</span>
                        <button
                          onClick={(e) => startEditingChat(chat, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded"
                          title="Rename conversation"
                        >
                          <FiEdit2 size={12} />
                        </button>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                !isLoadingChats && (
                  <div className="text-sm text-gray-400 px-3 py-2">
                    No recent chats
                  </div>
                )
              )}
            </div>
          </div>
          
          {/* Auth section at bottom */}
          <div className="mt-auto border-t border-gray-700 pt-2 px-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 p-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm truncate">{user.email}</span>
                </div>
                
                {/* Business Profiles Link */}
                <Link
                  href="/business-profiles"
                  className="flex items-center gap-2 w-full rounded-md p-2 text-sm hover:bg-gray-700 transition mb-1"
                >
                  <FiBriefcase size={16} />
                  <span>Business Profiles</span>
                </Link>
                
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full rounded-md p-2 text-sm hover:bg-gray-700 transition"
                >
                  <FiLogOut size={16} />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <Link href="/auth" className="flex items-center gap-2 w-full rounded-md p-2 text-sm hover:bg-gray-700 transition">
                <FiLogIn size={16} />
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 