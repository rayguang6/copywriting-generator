"use client";

import { useState, useEffect, useRef } from 'react';
import { FiMenu, FiPlusCircle, FiLogOut, FiLogIn, FiUser, FiBriefcase, FiMessageSquare, FiRefreshCw, FiEdit2, FiMoreVertical, FiTrash2, FiX, FiAlertTriangle } from 'react-icons/fi';
import { useAuthContext } from '@/providers/AuthProvider';
import Link from 'next/link';
import { Chat } from '@/lib/types';
import { getUserChats, updateChat, deleteChat } from '@/lib/chat-service';
import { useRouter, usePathname } from 'next/navigation';
import { getAllFrameworks, formatFrameworkName } from '@/lib/framework-service';

export default function Sidebar({ onSelectFramework, onSelectChat }: { 
  onSelectFramework: (framework: string) => void,
  onSelectChat?: (chatId: string) => void 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [activeChatMenuId, setActiveChatMenuId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{chatId: string, title: string} | null>(null);
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Extract chatId from pathname if we're on a chat detail page
  const chatIdFromPath = pathname.startsWith('/chat/') 
    ? pathname.split('/')[2] 
    : null;

  // Get all frameworks from the framework service
  const frameworks = getAllFrameworks();

  // Fetch user's chats when the component mounts or when currentChatId changes
  useEffect(() => {
    if (user) {
      fetchUserChats();
    }
  }, [user, chatIdFromPath]);

  const fetchUserChats = async () => {
    try {
      setIsLoadingChats(true);
      const chats = await getUserChats();

      // Format chats to match the expected type with updated_at field
      const formattedChats = chats.map(chat => ({
        ...chat,
        updated_at: chat.created_at // Use created_at as fallback for updated_at
      }));
      
      setUserChats(formattedChats);
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
    router.push('/chat');
  };

  const handleSelectFramework = (frameworkId: string) => {
    // Log the selected framework ID to help with debugging
    console.log("Selecting framework with ID:", frameworkId);
    
    // Select the framework but don't create a chat yet
    onSelectFramework(frameworkId);
    
    // Navigate to the chat page with the framework selected
    router.push('/chat');
  };

  const handleSelectChat = (chatId: string) => {
    if (onSelectChat) {
      // Use the callback instead of navigation if provided
      onSelectChat(chatId);
    } else {
      // Fall back to navigation if no callback is provided
      router.push(`/chat/${chatId}`);
    }
    
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

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        activeChatMenuId && 
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setActiveChatMenuId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeChatMenuId]);

  const toggleChatMenu = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveChatMenuId(activeChatMenuId === chatId ? null : chatId);
  };

  const promptDeleteChat = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmation({chatId: chat.id, title: chat.title});
    setActiveChatMenuId(null);
  };

  const handleDeleteChat = async () => {
    if (!deleteConfirmation) return;
    
    try {
      await deleteChat(deleteConfirmation.chatId);
      // Refresh chats after deletion
      fetchUserChats();
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmation(null);
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
              className="flex items-center gap-3 w-full bg-transparent hover:bg-gray-700 transition-all duration-200 border border-gray-600 hover:border-gray-500 rounded-md py-3 px-3 text-sm text-left cursor-pointer hover:shadow-md"
            >
              <FiPlusCircle size={16} className="text-gray-400 group-hover:text-white transition-colors" />
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
                  className="w-full font-medium text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition cursor-pointer"
                  onClick={() => handleSelectFramework(framework.id)}
                >
                <FiEdit2 size={14} />
                {formatFrameworkName(framework)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chat history section */}
          <div className="mt-5 flex-1 flex flex-col overflow-hidden">
            <h2 className="text-xs uppercase font-semibold text-gray-400 mb-2 px-3 flex items-center justify-between">
              <span>Recent Chats</span>
              <div className="flex items-center">
                {isLoadingChats ? (
                  <span className="text-xs text-gray-500">Loading...</span>
                ) : (
                  <button 
                    onClick={handleRefreshChats} 
                    className="text-gray-400 hover:text-white p-1 rounded-full cursor-pointer hover:rotate-180 transition-all duration-300"
                    title="Refresh chats"
                  >
                    <FiRefreshCw size={14} />
                  </button>
                )}
              </div>
            </h2>
            <div className="flex-1 overflow-y-auto pr-1">
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
                      <div className="group relative">
                        <button
                          className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer ${
                            pathname.startsWith('/chat/') && pathname.includes(chat.id) ? 'bg-gray-700' : ''
                          }`}
                          onClick={() => handleSelectChat(chat.id)}
                        >
                          <FiMessageSquare size={14} />
                          <span className="truncate flex-1">{formatChatTitle(chat.title)}</span>
                          <button
                            ref={activeChatMenuId === chat.id ? buttonRef : null}
                            onClick={(e) => toggleChatMenu(chat.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded cursor-pointer transition-opacity duration-200"
                            title="Chat options"
                          >
                            <FiMoreVertical size={14} />
                          </button>
                        </button>

                        {/* Dropdown menu */}
                        {activeChatMenuId === chat.id && (
                          <div 
                            ref={menuRef}
                            className="absolute right-2 top-8 bg-gray-700 rounded shadow-lg py-1 z-10 animate-fade-in"
                          >
                            <button
                              onClick={(e) => startEditingChat(chat, e)}
                              className="w-full text-left px-3 py-1 text-sm hover:bg-gray-600 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <FiEdit2 size={12} />
                              <span>Rename</span>
                            </button>
                            <button
                              onClick={(e) => promptDeleteChat(chat, e)}
                              className="w-full text-left px-3 py-1 text-sm text-red-400 hover:bg-gray-600 hover:text-red-300 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <FiTrash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
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
                  className="flex items-center gap-2 w-full rounded-md p-2 text-sm hover:bg-gray-700 transition mb-1 cursor-pointer"
                >
                  <FiBriefcase size={16} />
                  <span>Business Profiles</span>
                </Link>
                
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full rounded-md p-2 text-sm hover:bg-gray-700 transition cursor-pointer"
                >
                  <FiLogOut size={16} />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <Link href="/auth" className="flex items-center gap-2 w-full rounded-md p-2 text-sm hover:bg-gray-700 transition cursor-pointer">
                <FiLogIn size={16} />
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex items-center text-red-500 mb-4">
              <FiAlertTriangle size={24} className="mr-2" />
              <h3 className="text-lg font-medium">Delete Chat</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{formatChatTitle(deleteConfirmation.title)}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm focus:outline-none transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm focus:outline-none flex items-center gap-1 transition-colors cursor-pointer"
              >
                <FiTrash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 